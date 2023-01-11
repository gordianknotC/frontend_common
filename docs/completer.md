

---
<!--#-->
Completer (借用Dart Completer概念), 將 Promise 物件寫進 Completer.future 中，並將 reject/resolve 方法也寫進 Completer 物件中，只要持有 Completer 物件便能待不確定的未來中執行 reject/resolve 方法以返回 Promise 結果

__型別__ | [source][s-completer]
```ts
 export class Completer<T>  {
  complete:(value: T | PromiseLike<T>) => void;
  reject:(reason?: any) => void;
  future: Promise<T>;
  constructor() {
    this.future= new Promise((resolve: any, reject: any)=>{
      this.complete = (val: T)=>{
        resolve(val);
      };
      this.reject = (reason)=>{
        reject(reason);
      };
    })
  }
}
```

__example__
如使用在 jest mocking test 中
```ts
const url = "/path/to/get";
const expectedFetched = {
  data: {username: "hello"}
};
const mockReturns = {
  "error_code": 401,
  "error_key": "Unauthorized",
  "error_name": "Unauthorized",
  "message": "Unauthorized",
};
const payload = {};
const completer = new Completer();
const wait = (helper.authHeaderUpdater!.processFulFill as any as jest.SpyInstance)
  .withImplementation(
    (config: AxiosRequestConfig<any>)=>{
      return config;
    }, async ()=>{
      return completer.future;
    }
  );
await helper.expectGetPassed(url,payload, mockReturns, expectedFetched);

// 在 complete 前, processFulFill 都會一直維持 mocking implementation
completer.complete({});
await wait;
// complete / wait 以後 恢復 implementation 
expect(helper.authGuard!.canProcessReject).toBeCalled();
expect(helper.authGuard!.canProcessFulFill).toBeCalled();
```



__example__ | [source][s-test-completer]:
```ts
  const completer = new Completer();
  function fetch(){
    return completer.future;
  }
  const futureResult = fetch();
  await wait(400);
  expect(typeof (futureResult.then)).toBe("function");
  expect((futureResult as any).value).toBeUndefined();
  completer.complete({value: ""})
  expect(((await futureResult) as any).value).not.toBeUndefined();
```