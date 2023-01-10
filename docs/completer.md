

---
<!--#-->
Completer (假用Dart Completer概念), Completer 為 Promise 物件，只是將 reject/resolve 方法寫進 Completer 物件中，只要持有 Completer 物件便能待不確定的未來中執行 reject/resolve 方法以返回 Promise 結果

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