"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.IQueue = void 0;
const __1 = require("..");
class IQueue {
}
exports.IQueue = IQueue;
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
class Queue {
    constructor(timeoutErrorObj = {
        error_code: "timeout",
        error_key: "",
        error_msg: "timeout error",
        message: "timeout error"
    }) {
        this.timeoutErrorObj = timeoutErrorObj;
        this.queue = (0, __1.Arr)([]);
    }
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
    enqueue(id, promise, timeout = 10000) {
        const timestamp = new Date().getTime();
        return new Promise((resolve, reject) => {
            this.queue.push({
                id,
                timestamp,
                timeout: setTimeout(() => {
                    this.onTimeout(id);
                }, timeout),
                promise,
                resolve,
                reject
            });
            this.dequeue({ id, removeQueue: false });
        });
    }
    onTimeout(id) {
        const item = this.queue.firstWhere(_ => _.id == id);
        if (!item)
            return;
        item.reject(this.timeoutErrorObj);
    }
    remove(item) {
        clearTimeout(item.timeout);
        this.queue.remove(item);
        console.log("remove:", item.id);
    }
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
    async dequeueByResult(option) {
        const { id, result } = option;
        const removeQueue = true;
        const item = this.queue.firstWhere(_ => _.id == id);
        if (!item) {
            return null;
        }
        try {
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
            item.resolve(result);
            return result;
        }
        catch (err) {
            item.reject(err);
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
        }
        return null;
    }
    /**
     * 執行queue裡的item，並依option.removeQueue決定是否移除queued item
     * 預設 option.removeQueue 為 true
     * @param option.id - 取得queue的id
     * @param option.removeQueue - 預設 true
     * @returns
     */
    async dequeue(option) {
        const { id, removeQueue } = option;
        const item = this.queue.firstWhere(_ => _.id == id);
        if (!item) {
            return null;
        }
        try {
            const result = await item.promise();
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
            item.resolve(result);
            return result;
        }
        catch (err) {
            item.reject(err);
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
        }
        return null;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map