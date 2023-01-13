

---
<!--#-->
Promise 實作駐列處理, 由以下成員組成
－ queue
用來代表每個等待處理或處理中的Promise請求，由 Array<[Completer](#Completer)<QueueItem>> 物件陣列 存放所有 Promise 駐列每個駐列成員為一個 [Completer](#Completer)<QueueItem>, [Completer](#Completer) 本身類似 Promise 物件，只是將 resolve / reject 方法直接存在 [Completer](#Completer) 物件裡, 只要使用者持有 Completer 物件，就能自行由外部呼叫 resolve 方法，不用侷限於 new Promise 的結構

- enqueue
- dequeue
- dequeueByResult
- clearQueue
- remove

__型別__ | [source][s-queue]
```ts
export type QueueItem<M=any> = {
  id: number|string;
  meta?: M;
  promise: () => Promise<any>;
  timestamp: number;
  timeout: NodeJS.Timeout;
};

export abstract class IAsyncQueue {
  abstract queue: ArrayDelegate<Completer<QueueItem>>;
  abstract get isEmpty(): boolean;
  abstract enqueue(
    id: number|string,
    promise: () => Promise<any>,
    timeout?: number
  ): Promise<any>;
  abstract dequeue(option: {id: number|string, removeQueue: boolean}): Promise<any>;
  abstract dequeueByResult(option: {id: number|string, result: any}): Promise<any>;
  abstract clearQueue(): void;
}
```
### queue
> queue 為 [Completer](#Completer)<QueueItem> 物件陣列, QueueItem 有以下屬性
```ts
export type QueueItem<M=any> = {
  /** id: QueueItem identifier */
  id: number|string;
  /** meta: 用以儲存額外資訊，如 request config / request header */
  meta?: M;
  /** promise: 用來取得QueueItem所承載的非同步資料 */
  promise: () => Promise<any>;
  /** timestamp: 用來計算 timeout */
  timestamp: number;
  /** timeout: timeout id */
  timeout: NodeJS.Timeout;
};
```

> completer 本身類似 Promise 物件, 只是多了以下屬性
[source][s-completer]
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

當我們以 [Completer](#Completer) 存放 QueueItem 物件時便能於外部 resolve Promise [Completer](#Completer) 則作為一個 存放 Promise 物件及相應 reject/resolve 方法的容器

### enqueue
> 將 Promise 請求包入 QueueItem 並推到 Queue 裡，並有以下二種選擇 (視 @param dequeueImmediately)
> -  同時執行 promise 非同部請求 via [dequeue](#dequeue) ，直到非同部請求 promise resolve 後， 使用者再次 [dequeue](#dequeue) 移除該列隊
> - 不立即執行 promise 非同部請求 [dequeue](#dequeue) ，直到使用者自行 [dequeue](#dequeue) 後，移除該列隊
  
__型別__:
```ts
/**
 * @param id - 請求 ID
 * @param promise - 處理非同部請求邏輯，待請求完成後，queue 生命周期完成移除
 * @param timeout - default 10 * 1000
 * @param meta - 使用者自定義註解
 * @param dequeueImmediately - enqueue 後馬上 dequeue，即執上 promise 直到 promise resolve 後
 */
  public enqueue(
    id: number|string,
    promise: () => Promise<any>,
    timeout: number = 10000,
    meta: any = {},
    dequeueImmediately: boolean = true,
  ): Promise<any>
```

__example__ | [source][s-test-queue]:
> 立即執行 promise 非同部請求
```ts
jest.spyOn(q, "dequeue");
q.enqueue(idC, async ()=>{
  return new Promise(async resolve =>{
    console.log("promise called")
    await wait(span);
    resolve({idC});
  });
});
expect(q.queue.length).toBe(1);
expect(q.dequeue).toBeCalledTimes(1); // promise called

await q.dequeue({id: idC, removeQueue});
expect(q.queue.length).toBe(0);
```
__example__
> 不立即執行 promise 非同部請求，直到使用者自行 {@link dequeue}
```ts
const removeQueue = false;
jest.spyOn(q, "dequeue");
q.enqueue(idC, async ()=>{
  return new Promise(async resolve =>{
    await wait(span);
    resolve({idC});
  });
}, removeQueue);
expect(q.queue.length).toBe(1);
expect(q.dequeue).toBeCalledTimes(0);

await q.dequeue({id: idC, removeQueue});
expect(q.queue.length).toBe(0);
expect(q.dequeue).toBeCalledTimes(1);
```


### dequeue
> 依所提供的 id 查找相應的 QueueItem，執行 QueueItem 裡的 Promise 請求並依
  option.removeQueue 決定是否移除 QueueItem, 預設 option.removeQueue 為 true

__型別__:
```ts
/**
 * @param option.id - 取得queue的id
 * @param option.removeQueue - 預設 true
 */
public async dequeue(option: {id: number, removeQueue?: boolean}): Promise<any>
```

__example__ | [source][s-test-queue]:
```ts
test("expect raise exception while it's queuing", async () => {
  let rA, rB, rC, rD;
  let [wA, wB, wC, wD] = [100, 200, 600, 800];
  const t = time();
  const removeQueue = true;
  const meta = {};

  jest.spyOn(q, "dequeue");
  q.enqueue(idA, async () => {
    return new Promise(async (resolve) => {
      await wait(wA);
      rA = { idA };
      resolve({ idA });
      console.log("resolve A");
    });
  });
  expect(q.queue.length).toBe(1);
  expect(q.dequeue).toBeCalledTimes(1);

  expect(
    q.enqueue(idB, async () => {
      return new Promise(async (resolve, reject) => {
        await wait(wB);
        reject("reject...");
        console.log("resolve B");
      });
    })
  ).rejects.toEqual("reject...");
  expect(q.queue.length).toBe(2);
  expect(q.dequeue).toBeCalledTimes(2);

  q.enqueue(idC, async () => {
    return new Promise(async (resolve) => {
      await wait(wC);
      rC = { idC };
      resolve({ idC });
      console.log("resolve C");
    });
  });
  expect(q.queue.length).toBe(3);
  expect(q.dequeue).toBeCalledTimes(3);

  await wait(wA + wB + wC + 30);
  // 雖然 dequeue, 但內部不移除，直到使用者 dequeue
  expect(q.queue.length).toBe(3);

  const resultA = await q.dequeue({ id: idA });
  expect(resultA).toEqual({ idA });
  expect(q.queue.length).toBe(2);

  const resultC = await q.dequeue({ id: idC });
  expect(resultC).toEqual({ idC });
  expect(q.queue.length).toBe(1);

  const resultB = await q.dequeue({ id: idB });
  expect(q.queue.length).toBe(0);
});
```


### 其他方法

#### dequeueByResult
> 別於 [dequeue](#dequeue) 執行 [enqueue](#enqueue) 傳入的 promise 方法，待 promise 請求 resolve 後移除 {@link QueueItem}, [dequeueByResult](#dequeueByResult) 則是不管 [enqueue](#enqueue) 所傳入的 promise 結果，直接取代其 result

__型別__:
```ts
  /**
   * @param option.id - 取得queue的id
   * @param option.removeQueue - 預設 true
   */
  public async dequeueByResult(option: {id: number, result: any}): Promise<any>
```

__example__ | [source][s-test-queue]:
```ts
const pendingId = "idA";
const pending = q.enqueue(pendingId, async ()=>{
  // 這裡 promise 不回傳結果，直接等待十秒後 timeout
  return waitForTimeOut(10 * 1000);
});
// 覆寫內容於是能將值返回, pending 狀態於是 resolved 
q.dequeueByResult({id: pendingId, result: {succeed: true}});
expect(pending).resolves.toEquals({succeed: true});
```
#### getQueueItem
```ts
  getQueueItem(id:number|string):Completer<QueueItem> | null{
    if (this.queue.length == 0)
      return null;
    return this.queue.firstWhere((_)=>_._meta!.id == id);
  }
```

#### enqueueWithoutId
```ts
/** 與  {@link enqueue} 相同，只是 id 自動生成 */
public enqueueWithoutId(
  promise: () => Promise<any>,
  timeout: number = 10000,
  meta: any = {},
  dequeueImmediately: boolean = true,
)
```

#### clearQueue
```ts
/**清除 {@link queue} */
public clearQueue(): void {
  for (let index = 0; index < this.queue.length; index++) {
    const item = this.queue[index];
    this.remove(item, true);
  }
}
```