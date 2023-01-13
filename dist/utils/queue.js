"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencedQueueConsumer = exports.AsyncQueue = exports.IQueueConsumer = exports.IAsyncQueue = void 0;
const crypto_1 = require("crypto");
const __1 = require("..");
class IAsyncQueue {
}
exports.IAsyncQueue = IAsyncQueue;
class IQueueConsumer {
}
exports.IQueueConsumer = IQueueConsumer;
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
class AsyncQueue {
    constructor(timeoutErrorObj = {
        error_code: "timeout",
        error_key: "",
        error_msg: "timeout error",
        message: "timeout error"
    }) {
        this.timeoutErrorObj = timeoutErrorObj;
        this.queue = (0, __1.Arr)([]);
    }
    /** 判斷 {@link queue} 是否為空 */
    get isEmpty() {
        return this.queue.length == 0;
    }
    getQueueItem(id) {
        if (this.queue.length == 0)
            return null;
        return this.queue.firstWhere((_) => _._meta.id == id);
    }
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
    enqueue(id, promise, timeout = 10000, meta = {}, dequeueImmediately = true) {
        const timestamp = new Date().getTime();
        const completer = new __1.Completer({
            id,
            timestamp,
            meta,
            timeout: setTimeout(() => {
                this.onTimeout(id);
            }, timeout),
            promise,
        });
        this.queue.push(completer);
        if (dequeueImmediately)
            this.dequeue({ id, removeQueue: false });
        return completer.future;
        // return new Promise((resolve, reject) => {
        //   this.queue.push({
        //     id,
        //     timestamp,
        //     meta,
        //     timeout: setTimeout(() => {
        //       this.onTimeout(id);
        //     }, timeout),
        //     promise,
        //     resolve,
        //     reject
        //   });
        //   if (dequeueImmediately)
        //     this.dequeue({id, removeQueue: false});
        // });
    }
    /** 與  {@link enqueue} 相同，只是 id 自動生成
     * @returns Completer 物件，非 async Promise
    */
    enqueueWithoutId(promise, timeout = 10000, meta = {}, dequeueImmediately = true) {
        this.enqueue(this._getId(), promise, timeout, meta, dequeueImmediately);
        const item = this.queue.last;
        return item;
    }
    _getId() {
        return (0, crypto_1.randomUUID)();
    }
    onTimeout(id) {
        const item = this.queue.firstWhere(_ => _._meta.id == id);
        if (!item)
            return;
        item.reject(this.timeoutErrorObj);
    }
    remove(item, reject = false) {
        clearTimeout(item._meta.timeout);
        if (reject)
            item.reject({
                reason: "flushed"
            });
        this.queue.remove(item);
        console.log("remove:", item._meta.id);
    }
    /**清除 {@link queue} */
    clearQueue() {
        for (let index = 0; index < this.queue.length; index++) {
            const item = this.queue[index];
            this.remove(item, true);
        }
    }
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
    dequeueByResult(option) {
        const { id, result } = option;
        const removeQueue = true;
        const item = this.queue.firstWhere(_ => _._meta.id == id);
        if (!item) {
            return null;
        }
        try {
            item.complete(result);
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
        }
        catch (err) {
            item.reject(err);
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
        }
    }
    /**
     * 依所提供的 id 查找相應的 QueueItem，執行 QueueItem 裡的 Promise 請求並依
     * option.removeQueue 決定是否移除 QueueItem, 預設 option.removeQueue 為 true
     * @param option.id - 取得queue的id
     * @param option.removeQueue - 預設 true
     * @returns
     */
    async dequeue(option) {
        const { id, removeQueue } = option;
        const item = this.queue.firstWhere(_ => _._meta.id == id);
        if (!item) {
            console.log("d1");
            return null;
        }
        try {
            console.log("d2");
            const result = await item._meta.promise();
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true) {
                console.log("d3");
                this.remove(item);
            }
            console.log("d4");
            item.complete(result);
            return result;
        }
        catch (err) {
            console.log("d5");
            item.reject(err);
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true)
                this.remove(item);
        }
        console.log("d6");
        return null;
    }
}
exports.AsyncQueue = AsyncQueue;
class SequencedQueueConsumer {
    constructor(queue) {
        this.queue = queue;
    }
    _getId() {
        return (0, crypto_1.randomUUID)();
    }
    feedRequest(request) {
        this.queue.enqueue(this._getId(), request);
        const item = this.queue.queue.last;
        return item;
    }
    consumeAll() {
        throw new Error("Method not implemented.");
    }
    consumeAllWhen(condition) {
        throw new Error("Method not implemented.");
    }
}
exports.SequencedQueueConsumer = SequencedQueueConsumer;
//# sourceMappingURL=queue.js.map