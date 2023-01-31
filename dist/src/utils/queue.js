"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencedQueueConsumer = exports.AsyncQueue = exports.IQueueConsumer = exports.IAsyncQueue = exports.uuidV4 = void 0;
const __1 = require("..");
const uuid_1 = require("uuid");
function uuidV4() {
    return (0, uuid_1.v4)();
}
exports.uuidV4 = uuidV4;
/**
 * @typeParam META - QueueItem 的 meta 型別
 */
class IAsyncQueue {
}
exports.IAsyncQueue = IAsyncQueue;
/** {inheritDoc IAsyncQueue}
 * @typeParam META - QueueItem 的 meta 型別
*/
class IQueueConsumer {
}
exports.IQueueConsumer = IQueueConsumer;
/** {inheritDoc IAsyncQueue}
 * 應用如 api client 處理需籍由 websocket 傳送出去的請求, 將請求暫存於 queue 以後，待收到 socket
 * 資料，再由 queue 裡的 promise resolve 返回值， resolve 後無論成功失敗，移除該筆 queue
 * @typeParam META - {@link QueueItem} 的 meta 型別
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
        return completer;
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
        return (0, uuid_1.v4)();
    }
    /** reject outdated queue and remove it by id*/
    onTimeout(id) {
        const item = this.queue.firstWhere(_ => _._meta.id == id);
        if (!item)
            return;
        item.reject(this.timeoutErrorObj);
        this.remove(item);
        return this.timeoutErrorObj;
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
     * @param option.result - sync result 與 async result 二擇一
     * @param option.asyncResult - async result 與 sync result 二擇一
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
  
     @example - dequeue an already resolved promise
     ```ts
     test("dequeue an already completed object", ()=>{
        const timeout = 100;
        const completer = Q.enqueue(123, async ()=>{
          await wait(500);
        }, timeout)
        completer.complete("hello");
        expect(Q.queue.length).toBe(1)
        
        Q.dequeueByResult({id: 123, result: "999"});
        expect(completer.future).resolves.toEqual("hello")
        expect(Q.queue.length).toBe(0)
      })
     ```
     */
    dequeueByResult(option) {
        const { id, result, asyncResult } = option;
        const item = this.queue.firstWhere(_ => _._meta.id == id);
        if (!item) {
            return null;
        }
        try {
            if (item.isCompleted) {
                return this.remove(item);
            }
            else if (item.isRejected) {
                return this.remove(item);
            }
            if (result) {
                item.complete(result);
                this.remove(item);
            }
            else if (asyncResult) {
                asyncResult.then((_) => {
                    item.complete(_);
                    this.remove(item);
                }).catch((_) => {
                    item.reject(_);
                    this.remove(item);
                });
            }
        }
        catch (err) {
            item.reject(err);
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
            return null;
        }
        try {
            const result = await item._meta.promise();
            if (removeQueue !== null && removeQueue !== void 0 ? removeQueue : true) {
                this.remove(item);
            }
            item.complete(result);
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
exports.AsyncQueue = AsyncQueue;
class SequencedQueueConsumer {
    constructor(queue) {
        this.queue = queue;
    }
    _getId() {
        return uuidV4();
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