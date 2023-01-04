/// <reference types="node" />
import { ArrayDelegate } from "..";
export declare type QueueItem = {
    id: number;
    promise: () => Promise<any>;
    resolve: any;
    reject: any;
    timestamp: number;
    timeout: NodeJS.Timeout;
};
export declare abstract class IQueue<T extends QueueItem> {
    abstract queue: T[];
    abstract enqueue(id: number, promise: () => Promise<any>, timeout?: number): Promise<any>;
    abstract dequeue(option: {
        id: number;
        removeQueue: boolean;
    }): Promise<any>;
    abstract dequeueByResult(option: {
        id: number;
        result: any;
    }): Promise<any>;
}
/**
 * 應用如 api client 處理需籍由 websocket 傳送出去的請求, 將請求暫存於 queue 以後，待收到 socket
 * 資料，再由 queue 裡的 promise resolve 返回值， resolve 後無論成功失敗，移除該筆 queue
 *
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
export declare class Queue implements IQueue<QueueItem> {
    timeoutErrorObj: any;
    queue: ArrayDelegate<QueueItem>;
    constructor(timeoutErrorObj?: any);
    /**
     * 將請求推到 Queue 裡，並同時執行，直到使用者
     * {@link dequeue} 才將 Queued 物件由列表中移除
     * @param id - 請求 ID
     * @param promise - 處請求邏輯
     * @param timeout - timeout
     * @returns
     * @example
        ```ts
        q.enqueue(idC, async ()=>{
          return new Promise(async resolve =>{
            await wait(span);
            resolve({idC});
          });
        });
        ```
     */
    enqueue(id: number, promise: () => Promise<any>, timeout?: number): Promise<any>;
    private onTimeout;
    private remove;
    /**
     * 提供 queue item 回傳 promise resolve 的結困，並將 queue item 移除
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
     */
    dequeueByResult(option: {
        id: number;
        result: any;
    }): Promise<any>;
    /**
     * 執行queue裡的item，並依option.removeQueue決定是否移除queued item
     * 預設 option.removeQueue 為 true
     * @param option.id - 取得queue的id
     * @param option.removeQueue - 預設 true
     * @returns
     */
    dequeue(option: {
        id: number;
        removeQueue?: boolean;
    }): Promise<any>;
}
