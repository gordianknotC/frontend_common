import { randomUUID } from "crypto";
import { ArrayDelegate, Arr } from "..";

export type Identifier<M=any> = {
  id: number|string;
  meta?: M;
  promise: () => Promise<any>;
  timestamp: number;
  timeout: NodeJS.Timeout;
};

export type QueueItem<M=any> = Identifier<M> & {
  resolve: any;
  reject: any;
};

export abstract class IQueue<T extends Identifier> {
  abstract queue: ArrayDelegate<T>;
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


export abstract class IQueueConsumer<T extends Identifier> {
  abstract queue: IQueue<T>;
  abstract feedRequest(request: () => Promise<any>): T;
  abstract consumeAll(): Promise<any>;
  abstract consumeAllWhen(condition: (item: T)=>boolean): Promise<any>;
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
export class Queue<T extends Identifier=QueueItem> implements IQueue<T> {
  queue: ArrayDelegate<T> = Arr([]);
  /** 判斷 {@link queue} 是否為空 */
  get isEmpty(){
    return this.queue.length == 0;
  }
  constructor(
    public timeoutErrorObj: any = {
      error_code: "timeout",
      error_key: "",
      error_msg: "timeout error",
      message: "timeout error"
    }
  ){}
  /**
   * 將請求推到 Queue 裡，並同時執行，直到使用者 
   * {@link dequeue} 才將 Queued 物件由列表中移除
   * @typeParam T - {@link QueueItem}
   * 
   * @param id - 請求 ID
   * @param promise - 處請求邏輯
   * @param timeout - default 10 * 1000
   * @param meta - 使用者自定義註解
   * @param dequeueImmediately - 
   * 
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
  public enqueue(
    id: number|string,
    promise: () => Promise<any>,
    timeout: number = 10000,
    meta: any = {},
    dequeueImmediately: boolean = true,
  ): Promise<any> {
    const timestamp = new Date().getTime();
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        timestamp,
        meta,
        timeout: setTimeout(() => {
          this.onTimeout(id);
        }, timeout),
        promise,
        resolve,
        reject
      } as any as T);
      if (dequeueImmediately)
        this.dequeue({id, removeQueue: false});
    });
  }

  /** 與  {@link enqueue} 相同，只是 id 自動生成 */
  public enqueueWithNoId(
    promise: () => Promise<any>,
    timeout: number = 10000,
    meta: any = {},
    dequeueImmediately: boolean = true,
  ){
    this.enqueue(this._getId() , promise, timeout, meta, dequeueImmediately);
    const item = this.queue.last;
    return item;
  }

  private _getId(): number|string{
    return randomUUID();
  }

  private onTimeout(id: number|string) {
    const item = this.queue.firstWhere(_ => _.id == id)!;
    if (!item) return;
    (item as any as QueueItem).reject(this.timeoutErrorObj);
  }

  /** 
   * @typeParam T - {@link QueueItem} */
  private remove(item: T, reject: boolean = false) {
    clearTimeout(item.timeout);
    if (reject)
      (item as any as QueueItem).reject({
        reason: "flushed"
      })
    this.queue.remove(item);
    console.log("remove:", item.id);
  }

  /**清除 {@link queue} */
  public clearQueue(): void {
    for (let index = 0; index < this.queue.length; index++) {
      const item = this.queue[index];
      this.remove(item, true);
    }
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
  public async dequeueByResult(option: {id: number|string, result: any}): Promise<any> {
    const {id, result} = option;
    const removeQueue = true;
    const item = this.queue.firstWhere(_ => _.id == id)!;
    if (!item) {
      return null;
    }
    try {
      if (removeQueue ?? true)
        this.remove(item);
      (item as any as QueueItem).resolve(result);
      return result;
    } catch (err) {
      (item as any as QueueItem).reject(err);
      if (removeQueue ?? true)
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
  public async dequeue(option: {id: number|string, removeQueue?: boolean}): Promise<any> {
    const {id, removeQueue} = option;
    const item = this.queue.firstWhere(_ => _.id == id)!;
    if (!item) {
      return null;
    }
    try {
      const result = await item.promise();
      if (removeQueue ?? true)
        this.remove(item);
        (item as any as QueueItem).resolve(result);
      return result;
    } catch (err) {
      (item as any as QueueItem).reject(err);
      if (removeQueue ?? true)
        this.remove(item);
    }
    return null;
  }
}

export class SequencedQueueConsumer 
  implements IQueueConsumer<QueueItem>
{
  constructor(public queue: IQueue<QueueItem<any>>){}

  private _getId(): number|string{
    return randomUUID();
  }
  feedRequest(request: () => Promise<any>): QueueItem {
    this.queue.enqueue(this._getId() , request);
    const item = this.queue.queue.last;
    return item;
  }

  consumeAll(): Promise<any> {
    throw new Error("Method not implemented.");
  }
  consumeAllWhen(condition: (item: QueueItem<any>) => boolean): Promise<any> {
    throw new Error("Method not implemented.");
  }
}