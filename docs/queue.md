

---
<!--#-->
Promise 實作駐列處理

- enqueue
- dequeue
- dequeueByResult

__型別__
```ts
export abstract class IQueue<T extends QueueItem> {
  abstract queue: T[];
  abstract enqueue(
    id: number,
    promise: () => Promise<any>,
    timeout?: number
  ): Promise<any>;
  abstract dequeue(option: {id: number, removeQueue: boolean}): Promise<any>;
  abstract dequeueByResult(option: {id: number, result: any}): Promise<any>;
}
```

### enqueue
> 將請求推到 Queue 裡，並同時執行 QueueItem，直到使用者 [dequeue] 才將 Queued 物件由列表中移除
  
__型別__:
```ts
/**
 * 將請求推到 Queue 裡，並同時執行，直到使用者 
 * {@link dequeue} 才將 Queued 物件由列表中移除
 * @param id - 請求 ID
 * @param promise - 處請求邏輯
 * @param timeout - timeout
 * @returns 
 */
  public enqueue(
    id: number,
    promise: () => Promise<any>,
    timeout: number = 10000,
  ): Promise<any>
```

__example__:
```ts
  const idC = 3;
  q.enqueue(idC, async ()=>{
    return new Promise(async resolve =>{
      await wait(span);
      resolve({idC});
    });
  });
  expect(q.queue.length).toBe(1);
```

### dequeue
> 執行queue裡的item，並依option.removeQueue決定是否移除queued item

__型別__:
```ts
/**
 * 執行queue裡的item，並依option.removeQueue決定是否移除queued item
 * 預設 option.removeQueue 為 true
 * @param option.id - 取得queue的id
 * @param option.removeQueue - 預設 true
 * @returns 
 */
public async dequeue(option: {id: number, removeQueue?: boolean}): Promise<any>
```

__example__:
```ts
test("expect raise exception while it's queuing", async ()=>{
    let rA, rB, rC, rD;
    let [wA, wB, wC, wD] = [100, 200, 600, 800];
    const t = time();
    q.enqueue(idA, async ()=>{
      return new Promise(async resolve =>{
        await wait(wA);
        rA = {idA};
        resolve({idA});
      });
    });
    expect(q.queue.length).toBe(1);
    q.enqueue(idC, async ()=>{
      return new Promise(async resolve =>{
        await wait(wC);
        rC = {idC}
        resolve({idC});
      });
    });
    expect(q.queue.length).toBe(2);
    expect(q.enqueue(idB, async ()=>{
      return new Promise(async (resolve, reject) =>{
        await wait(wB);
        reject("reject...");
      });
    })).rejects.toEqual("reject...");
    expect(q.queue.length).toBe(3);

    const resultA = await q.dequeue({id: idA});
    expect(resultA).toEqual({idA});
    expect(q.queue.length).toBe(2);
    
    const resultC = await q.dequeue({id: idC});
    expect(resultC).toEqual({idC});
    expect(q.queue.length).toBe(1);

    const resultB = await q.dequeue({id: idB});
    expect(q.queue.length).toBe(0);
  });
```

### dequeueByResult
> 提供 queue item 回傳 promise resolve 的結果，並將 queue item 移除

__型別__:
```ts
  /**
   * 提供 queue item 回傳 promise resolve 的結困，並將 queue item 移除
   * @param option.id - 取得queue的id
   * @param option.removeQueue - 預設 true
   * @returns 
   */
  public async dequeueByResult(option: {id: number, result: any}): Promise<any>
```

__example__:
```ts
const pendingId = "idA";
// 十秒後 timeout
const pending = q.enqueue(pendingId, async ()=>{
    return waitForTimeOut(10 * 1000);
});
// 覆寫內容於是能將值返回給 pending 
q.dequeueByResult({id: pendingId, result: {succeed: true}});
expect(pending).resolves.toEquals({succeed: true});
```