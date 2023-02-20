import { Completer, IAsyncQueue, QueueItem } from "..";
/** {inheritDoc IAsyncQueue}
 * @typeParam META - QueueItem 的 meta 型別
*/
export declare abstract class IQueueConsumer<META> {
    abstract queue: IAsyncQueue<META>;
    abstract addRequest(request: () => Promise<any>): Completer<any, QueueItem<META>>;
    abstract consumeAll(): Promise<any>;
}
/** 以線性序列的方式 consume queue */
export declare class SequencedQueueConsumer<META> implements IQueueConsumer<META> {
    queue: IAsyncQueue<META>;
    constructor(queue: IAsyncQueue<META>);
    private _getId;
    addRequest(request: () => Promise<any>): Completer<any, QueueItem>;
    consumeAll(): Promise<any>;
    protected consumeWhen(condition: (item: Completer<any, QueueItem<any>>) => boolean): Promise<any>;
}
