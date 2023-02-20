"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencedQueueConsumer = exports.IQueueConsumer = void 0;
const __1 = require("..");
/** {inheritDoc IAsyncQueue}
 * @typeParam META - QueueItem 的 meta 型別
*/
class IQueueConsumer {
}
exports.IQueueConsumer = IQueueConsumer;
/** 以線性序列的方式 consume queue */
class SequencedQueueConsumer {
    constructor(queue) {
        this.queue = queue;
    }
    _getId() {
        return (0, __1.uuidV4)();
    }
    enqueue(request) {
        return this.queue.enqueue(this._getId(), request, { dequeueImmediately: false });
    }
    async consumeAll() {
        return this.consumeWhen((_) => true);
    }
    async consumeWhen(condition) {
        const qItems = this.queue.queue.filter(condition);
        const result = [];
        for (let i = 0; i < qItems.length; i++) {
            const id = qItems[i]._meta.id;
            const futureItem = this.queue.dequeue({ id, removeQueue: false });
            result.push(futureItem);
            try {
                await futureItem;
            }
            catch (e) {
                console.error(e);
            }
            finally {
                console.log("end of consume:", qItems[i]);
                this.queue.remove(qItems[i], false);
            }
        }
        return result;
    }
}
exports.SequencedQueueConsumer = SequencedQueueConsumer;
//# sourceMappingURL=queue_consumer.js.map