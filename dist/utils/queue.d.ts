/// <reference types="node" />
import { ArrayDelegate, Completer } from "..";
export declare type QueueItem<M = any> = {
    /** id: QueueItem identifier */
    id: number | string;
    /** meta: 用以儲存額外資訊，如 request config / request header */
    meta?: M;
    /** promise: 用來取得QueueItem所承載的非同步資料 */
    promise: () => Promise<any>;
    /** timestamp: 用來計算 timeout */
    timestamp: number;
    /** timeout: timeout id */
    timeout: NodeJS.Timeout;
};
export declare abstract class IAsyncQueue {
    abstract queue: ArrayDelegate<Completer<any, QueueItem>>;
    abstract get isEmpty(): boolean;
    abstract enqueue(id: number | string, promise: () => Promise<any>, timeout?: number): Promise<any>;
    abstract dequeue(option: {
        id: number | string;
        removeQueue: boolean;
    }): Promise<any>;
    abstract dequeueByResult(option: {
        id: number | string;
        result: any;
    }): Promise<any>;
    abstract clearQueue(): void;
}
export declare abstract class IQueueConsumer {
    abstract queue: IAsyncQueue;
    abstract feedRequest(request: () => Promise<any>): Completer<any, QueueItem>;
    abstract consumeAll(): Promise<any>;
    abstract consumeAllWhen(condition: (item: Completer<any, QueueItem>) => boolean): Promise<any>;
}
/**
 * 應用如 api client 處理需籍由 websocket 傳送出去的請求, 將請求暫存於 queue 以後，待收到 socket
 * 資料，再由 queue 裡的 promise resolve 返回值， resolve 後無論成功失敗，移除該筆 queue
 * @typeParam T - {@link QueueItem}
 * @example
   ```ts
   test("put three async in sequence and postpone to dequeue when on time", async ()=>{
      let rA, rB, rC, rD;
      q.enqueue(idA, async ()=>{
        return new Promise(async resolve =>{
          await wait(span);
          resolve({idA});
          rA = {idA};
        });
      });
      q.enqueue(idB, async ()=>{
        return new Promise(async resolve =>{
          await wait(span);
          resolve({idB});
          rB = {idB};
        });
      });
      q.enqueue(idC, async ()=>{
        return new Promise(async resolve =>{
          await wait(span);
          resolve({idC});
          rC = {idC}
        });
      });

      await wait(2 * span / 3 );
      expect(rA).toBeUndefined();
      expect(rB).toBeUndefined();
      expect(rC).toBeUndefined();
      expect(q.queue.length).toBe(3);

      await wait(2 * span / 3 );
      expect(rA).toEqual({idA});
      expect(rB).toEqual({idB});
      expect(rC).toEqual({idC});
      expect(q.queue.length).toBe(3);

      const resultA = await q.dequeue({id: idA});
      const resultB = await q.dequeue({id: idB});
      const resultC = await q.dequeue({id: idC});
      
      expect(resultA).toEqual({idA});
      expect(resultB).toEqual({idB});
      expect(resultC).toEqual({idC});
      expect(q.queue.length).toBe(0);
    });
   ```
 */
export declare class AsyncQueue implements IAsyncQueue {
    timeoutErrorObj: any;
    queue: ArrayDelegate<Completer<any, QueueItem>>;
    /** 判斷 {@link queue} 是否為空 */
    get isEmpty(): boolean;
    constructor(timeoutErrorObj?: any);
    getQueueItem(id: number | string): Completer<any, QueueItem> | null;
    /**
     * 將請求推到 Queue 裡，並有以下二種選擇 (視 @param dequeueImmediately)
     * 1） 同時執行 promise 非同部請求 via {@link dequeue} ，直到非同部請求 promise resolve 後， 使用者再次 {@link dequeue} 移除該列隊
     * 2） 不立即執行 promise 非同部請求 {@link dequeue} ，直到使用者自行 {@link dequeue} 後，移除該列隊
     * @param id - 請求 ID
     * @param promise - 處理非同部請求邏輯，待請求完成後，queue 生命周期完成移除
     * @param timeout - default 10 * 1000
     * @param meta - 使用者自定義註解
     * @param dequeueImmediately - enqueue 後馬上 dequeue，即執上 promise 直到 promise resolve 後
     * @returns
     * @example - 1
        ```ts
        q.enqueue(idC, async ()=>{
          return new Promise(async resolve =>{
            await wait(span);
            resolve({idC});
          });
        });
        ```
       @example - 2
       ```ts
       const removeQueue = false;
       q.enqueue(idC, async ()=>{
          return new Promise(async resolve =>{
            await wait(span);
            resolve({idC});
          });
        }, removeQueue);
        const completer = q.getQueueItem(idC);
        q.dequeue({id: idC, removeQueue});
       ```
     */
    enqueue(id: number | string, promise: () => Promise<any>, timeout?: number, meta?: any, dequeueImmediately?: boolean): Promise<any>;
    /** 與  {@link enqueue} 相同，只是 id 自動生成 */
    enqueueWithoutId(promise: () => Promise<any>, timeout?: number, meta?: any, dequeueImmediately?: boolean): Completer<any, QueueItem<any>>;
    private _getId;
    private onTimeout;
    private remove;
    /**清除 {@link queue} */
    clearQueue(): void;
    /**
     * 別於 {@link dequeue} 執行 {@link enqueue} 傳入的 promise 方法，待 promise 請求
     * resolve 後移除 {@link QueueItem}, {@link dequeueByResult} 則是不管 {@link enqueue}
     * 所傳入的 promise 結果，直接取代其 result
     *
     * @param option.id - 取得queue的id
     * @param option.removeQueue - 預設 true
     * @returns
     * @example
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
  
     @example - refreshToken 換發
     ```ts
      const pendingId = "idA";
      // 十秒後 timeout
      const pendingRequest = q.enqueue(pendingId, async ()=>{
          const response = await axios.get(...);
          const isAuthExpired = ...;
          if (isAuthExpired){
            const waiting =  waitForTimeOut(10, 1000);
            refreshAuth().then(async (_)=>{
              await result = await fetchAgain();
              q.dequeueByResult({id: pendingId, result});
            });
            return waiting;
          }else{
            return response;
          }
      });
     ```
     */
    dequeueByResult(option: {
        id: number | string;
        result: any;
    }): Promise<any>;
    /**
     * 依所提供的 id 查找相應的 QueueItem，執行 QueueItem 裡的 Promise 請求並依
     * option.removeQueue 決定是否移除 QueueItem, 預設 option.removeQueue 為 true
     * @param option.id - 取得queue的id
     * @param option.removeQueue - 預設 true
     * @returns
     */
    dequeue(option: {
        id: number | string;
        removeQueue?: boolean;
    }): Promise<any>;
}
export declare class SequencedQueueConsumer implements IQueueConsumer {
    queue: IAsyncQueue;
    constructor(queue: IAsyncQueue);
    private _getId;
    feedRequest(request: () => Promise<any>): Completer<any, QueueItem>;
    consumeAll(): Promise<any>;
    consumeAllWhen(condition: (item: Completer<any, QueueItem<any>>) => boolean): Promise<any>;
}
