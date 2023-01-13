

---
<!--#-->
Completer (借用Dart Completer概念), 將 Promise 物件寫進 Completer.future 中，並將 reject/resolve 方法也寫進 Completer 物件中，只要持有 Completer 物件便能待不確定的未來中執行 reject/resolve 方法以返回 Promise 結果， __使用時機： 希望於其他 scope resolve promise 物件__

### 特性
- 用於存放 Promise 物件
- 直接 expose resolve / reject 方法於 Completer 物件中, 用於外部 resolve/reject
- 提供註解屬性 meta

__型別__ | [source][s-completer]
```ts
abstract class _Completer<T> {
  /** 用來暫時代表 future 值的物件，也可作為 Completer 本身的註解 */
  abstract _meta?: T
  /** 即 Promise 物件本身, 其 resolve / reject 方法分別為
   * {@link complete} / {@link reject} */
  abstract future: Promise<T>;
  /** 同 Promise.resolve, resolve {@link future} 本身*/
  abstract complete(value: T | PromiseLike<T>) : void;
  /** 同 Promise.reject, reject {@link future} 本身 */
  abstract reject(reason?: any): void;
}
```
__example__
以meta 屬性為例
```ts
const completer = new Completer<AxiosRequestConfig>({
  meta: requestConfig
})
```

__example__
```ts
async function example(){
  const completer = new Completer({
    id: 123, 
    timeStamp: (new Date()).getTime(),
  });
  function fetch(){
    return completer.future;
  }
  const future = fetch();

  // 只要有 completer 物件就能夠在未來 resolve future
  completer.complete( axios.get(...) )
  console.log(await future);
}
```

__example__ | [source][s-test-completer]:
```ts
  const completer = new Completer();
  function fetch(): Promise<any>{
    // 這裡，completer.future 永遠不 resolve
    return completer.future;
  }
  const futureResult = fetch();
  await wait(400);
  // 因為永遠不 resolve 所以 futureResult 一直是 pending promise
  expect(typeof (futureResult.then)).toBe("function");
  expect((futureResult as any).value).toBeUndefined();
  // completer.future 被 resolve
  completer.complete({value: ""})
  expect(((await futureResult) as any).value).not.toBeUndefined();
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


