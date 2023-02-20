import {ArrayDelegate, Arr, Completer, IAsyncQueue, QueueItem, uuidV4} from "..";
import { PickOne } from "./types";
import { v4 } from 'uuid';


/** {inheritDoc IAsyncQueue}
 * @typeParam META - QueueItem 的 meta 型別
*/
export abstract class IQueueConsumer<META> {
  abstract queue: IAsyncQueue<META>;
  abstract addRequest(request: () => Promise<any>):  Completer<any, QueueItem<META>>;
  abstract consumeAll(): Promise<any>;
}


/** 以線性序列的方式 consume queue */
export class SequencedQueueConsumer <META>
  implements IQueueConsumer<META>
{
  constructor(public queue: IAsyncQueue<META>){}

  private _getId(): number|string{
    return uuidV4();
  }

  addRequest(request: () => Promise<any>): Completer<any, QueueItem> {
    return this.queue.enqueue(this._getId() , request, {dequeueImmediately: false});
  }

  async consumeAll(): Promise<any> {
    return this.consumeWhen((_)=>true);
  }

  protected async consumeWhen(condition: (item: Completer<any, QueueItem<any>>) => boolean): Promise<any> {
    const qItems = this.queue.queue.filter(condition);
    const result = [];
    for (let i = 0; i < qItems.length; i++) {
      const id = qItems[i]._meta!.id;
      const futureItem = this.queue.dequeue({id, removeQueue: false});
      result.push(futureItem);
      console.log("start consume:",id,  qItems[i]);
      try{
        await futureItem;
      }catch(e){
        console.error(e);
      } finally {
        console.log("end of consume:", qItems[i]);
        this.queue.remove(qItems[i], false);
      }

    }
    this.queue.clearQueue();
    return result;
  }
}
