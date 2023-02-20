import {
  setupComputed,
  setupReactive,
  setupRef,
  setupWatch,
  setupCurrentEnv,
  Arr,
} from "@/index";
import { Completer } from "@/utils/completer";
import { AsyncQueue } from "@/utils/queue";
import { computed, reactive, ref, watch } from "vue";
import {SequencedQueueConsumer} from "@/utils/queue_consumer";

function wait(span: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, span);
  });
}
function time(): number {
  return new Date().getTime();
}
class QTester {
  constructor(public q: AsyncQueue<any>) {}
}

describe("Services", () => {
  beforeAll(() => {
    setupComputed(computed);
    setupReactive(reactive);
    setupRef(ref);
    setupWatch(watch);
    setupCurrentEnv("develop");
  });

  describe("Completer", () => {
    test("expect completer waiting for user to resolve to complete itself", async () => {
      const completer = new Completer();
      function fetch() {
        return completer.future;
      }
      const futureResult = fetch();
      await wait(400);
      expect(typeof futureResult.then).toBe("function");
      expect((futureResult as any).value).toBeUndefined();
      completer.complete({ value: "" });
      expect(((await futureResult) as any).value).not.toBeUndefined();
    });

    test("expect completer being reject by user", async () => {
      const completer = new Completer();
      function fetch() {
        return completer.future;
      }
      const futureResult = fetch();
      await wait(400);
      expect(typeof futureResult.then).toBe("function");
      expect((futureResult as any).value).toBeUndefined();
      expect(completer.future, "expect future object to be rejected").rejects.toEqual({error: ""})
      completer.reject({error: ""});
    });
  });

  describe("AsyncQueue", () => {
    describe("Unit function testing", ()=>{
      let Q: AsyncQueue<any>;
      let span = 500;
      let idA = 1;
      let idB = 2;
      let idC = 3;
      let idD = 4;
      beforeEach(() => {
        Q = new AsyncQueue();
      });

      test("wait for timeout expect queued item to be removed", async ()=>{
        jest.spyOn(Q as any, "onTimeout")
        const timeout = 100;
        const completer = Q.enqueue(123, async ()=>{
          await wait(500);
        }, {timeout})
        const called = {
          completed: false,
          rejected: false
        }
        expect(Q.queue.length).toBe(1);
        expect((Q as any).onTimeout).not.toBeCalled();
        await expect(completer.future).rejects.toEqual(Q.timeoutErrorObj);
        completer.onComplete(()=>{
          console.log("call onComplete")
          called.completed = true;
        });
        completer.onReject(()=>{
          console.log("call onReject")
          called.rejected = true;
        });

        await wait(timeout);
        expect((Q as any).onTimeout).toBeCalled();
        expect(called.completed, "expect not resolved").toBeFalsy();
        expect(called.rejected, "expect reject by timeout").toBeTruthy();
        expect(completer.isCompleted).toBeFalsy();
        expect(completer.isRejected).toBeTruthy();
        const rejected =await  Arr(((Q as any).onTimeout as jest.Mock).mock.results).last.value;
        expect(rejected).toEqual(Q.timeoutErrorObj);
        expect(Q.queue.length).toBe(0);
      });

      test("dequeue an already completed object", ()=>{
        const timeout = 100;
        const completer = Q.enqueue(123, async ()=>{
          await wait(500);
        }, {timeout})
        completer.complete("hello");
        expect(Q.queue.length).toBe(1)

        Q.dequeueByResult({id: 123, result: "999"});
        expect(completer.future).resolves.toEqual("hello")
        expect(Q.queue.length).toBe(0)
      })

      test("dequeue with an async result", ()=>{
        const timeout = 100;
        const completer = Q.enqueue(123, async ()=>{
          await wait(500);
          return "originalResult"
        }, {timeout})
        expect(Q.queue.length).toBe(1)

        Q.dequeueByResult({id: 123, asyncResult: Promise.resolve("hello")});
        expect(completer.future).resolves.toEqual("hello")
      });

      test("dequeue with an async result - 2", async () => {
        let [wD] = [800];
        const pending = Q.enqueue(idD, async () => {
          return new Promise(async (resolve) => {
            await wait(10000);
          });
        });
        function getPendingResult() {
          return pending.future;
        }
        await wait(wD);
        Q.dequeueByResult({
          id: idD,
          result: {
            succeed: true,
          },
        });
        await expect(getPendingResult()).resolves.toEqual({
          succeed: true,
        });
      });

      test("enqueue with dequeueImmediately set to false", async ()=>{
        let id = -1;
        const completer = Q.enqueue(123, async ()=>{
          await wait(500);
          id ++;
          console.log("id ++:", id);
          return "hello";
        }, {dequeueImmediately: false})
        const completer2 = Q.enqueue(333, async ()=>{
          await wait(500);
          id ++;
          console.log("id ++:", id);
          return "hello333";
        }, {dequeueImmediately: false})
        expect(Q.queue.length).toBe(2);

        Q.dequeue({id: 123});
        await expect(completer.future).resolves.toEqual("hello")
        expect(Q.queue.length).toBe(1)
        expect(id).toBe(0);

        Q.dequeue({id: 333});
        await expect(completer2.future).resolves.toEqual("hello333")
        expect(Q.queue.length).toBe(0)
        expect(id).toBe(1);
      })
    });

    describe("Compound functioning testing", ()=>{
      let q: AsyncQueue<any>;
      let span = 500;
      let idA = 1;
      let idB = 2;
      let idC = 3;
      let idD = 4;
      beforeAll(() => {
        q = new AsyncQueue();
      });

      test("put three async requests in sequence and postpone to dequeue when on time", async () => {
        let rA, rB, rC, rD;
        q.enqueue(idA, async () => {
          return new Promise(async (resolve) => {
            await wait(span);
            resolve({ idA });
            rA = { idA };
          });
        });
        q.enqueue(idB, async () => {
          return new Promise(async (resolve) => {
            await wait(span);
            resolve({ idB });
            rB = { idB };
          });
        });
        q.enqueue(idC, async () => {
          return new Promise(async (resolve) => {
            await wait(span);
            resolve({ idC });
            rC = { idC };
          });
        });
        expect(q.queue.length).toBe(3);

        await wait((2 * span) / 3);
        expect(rA).toBeUndefined();
        expect(rB).toBeUndefined();
        expect(rC).toBeUndefined();
        expect(q.queue.length).toBe(3);

        // wait for three async requests to be resolved
        await wait((2 * span) / 3);
        expect(rA).toEqual({ idA });
        expect(rB).toEqual({ idB });
        expect(rC).toEqual({ idC });
        expect(q.queue.length).toBe(3);

        // dequeue all the three resolved requests
        const resultA = await q.dequeue({ id: idA });
        const resultB = await q.dequeue({ id: idB });
        const resultC = await q.dequeue({ id: idC });

        expect(resultA).toEqual({ idA });
        expect(resultB).toEqual({ idB });
        expect(resultC).toEqual({ idC });
        expect(q.queue.length).toBe(0);
      });

      test("Put four async requests in sequence then dequeue it sequentially", async () => {
        let rA, rB, rC, rD;
        let [wA, wB, wC, wD] = [100, 200, 600, 800];
        const t = time();
        q.enqueue(idA, async () => {
          return new Promise(async (resolve) => {
            await wait(wA);
            resolve({ idA });
            rA = { idA };
          });
        });
        q.enqueue(idB, async () => {
          return new Promise(async (resolve) => {
            await wait(wB);
            resolve({ idB });
            rB = { idB };
          });
        });
        q.enqueue(idC, async () => {
          return new Promise(async (resolve) => {
            await wait(wC);
            resolve({ idC });
            rC = { idC };
          });
        });
        q.enqueue(idD, async () => {
          return new Promise(async (resolve) => {
            await wait(wD);
            resolve({ idD });
            rD = { idD };
          });
        });

        expect(q.queue.length).toBe(4);

        // dequeue A
        const resultA = await q.dequeue({ id: idA });
        expect(q.queue.length).toBe(3);
        expect(resultA).toEqual(rA);
        expect(time() - t).toBeGreaterThanOrEqual(wA);
        expect(time() - t).toBeLessThan(wB);

        // dequeue B
        const resultB = await q.dequeue({ id: idB });
        expect(q.queue.length).toBe(2);
        expect(resultB).toEqual(rB);
        expect(time() - t).toBeGreaterThanOrEqual(wB);
        expect(time() - t).toBeLessThan(wC);

        // dequeue C
        const resultC = await q.dequeue({ id: idC });
        expect(q.queue.length).toBe(1);
        expect(resultC).toEqual(rC);
        expect(time() - t).toBeGreaterThanOrEqual(wC);

        // dequeeu D
        const resultD = await q.dequeue({ id: idD });
        expect(q.queue.length).toBe(0);
        expect(resultD).toEqual(rD);
        expect(time() - t).toBeGreaterThanOrEqual(wD);
      });

      test("expect raise exception while it's queuing", async () => {
        let rA, rB, rC, rD;
        let [wA, wB, wC, wD] = [100, 200, 600, 800];
        const t = time();
        const removeQueue = true;
        const meta = {};

        jest.spyOn(q, "dequeue");
        q.enqueue(idA, async () => {
          return new Promise(async (resolve) => {
            await wait(wA);
            rA = { idA };
            resolve({ idA });
            console.log("resolve A");
          });
        });
        expect(q.queue.length).toBe(1);
        expect(q.dequeue).toBeCalledTimes(1);

        await expect(
          q.enqueue(idB, async () => {
            return new Promise(async (resolve, reject) => {
              await wait(wB);
              reject("reject...");
              console.log("resolve B");
            });
          }).future
        ).rejects.toEqual("reject...");
        expect(q.queue.length).toBe(2);
        expect(q.dequeue).toBeCalledTimes(2);

        q.enqueue(idC, async () => {
          return new Promise(async (resolve) => {
            await wait(wC);
            rC = { idC };
            resolve({ idC });
            console.log("resolve C");
          });
        });
        expect(q.queue.length).toBe(3);
        expect(q.dequeue).toBeCalledTimes(3);

        await wait(wA + wB + wC + 30);
        // 雖然 dequeue, 但內部不移除，直到使用者 dequeue
        expect(q.queue.length).toBe(3);

        const resultA = await q.dequeue({ id: idA });
        expect(resultA).toEqual({ idA });
        expect(q.queue.length).toBe(2);

        const resultC = await q.dequeue({ id: idC });
        expect(resultC).toEqual({ idC });
        expect(q.queue.length).toBe(1);

        const resultB = await q.dequeue({ id: idB });
        expect(q.queue.length).toBe(0);
      });
    });


    describe("SequencedQueueConsumer testing", ()=>{
      let q: AsyncQueue<any>;
      let s: SequencedQueueConsumer<any>;
      let span = 500;
      let idA = 1;
      let idB = 2;
      let idC = 3;
      let idD = 4;
      beforeAll(() => {
        q = new AsyncQueue();
        s = new SequencedQueueConsumer<any>(q);
      });

      test("Put four async requests, expect resolved sequentially", async ()=>{
        let id = -1;
        let requests = 4;
        for (let i = 0; i < requests; i++) {
          s.enqueue(()=>{
            return new Promise(async (resolve, reject)=>{
              await wait(span);
              id ++;
              resolve(id);
            })
          });
        }

        s.consumeAll();
        expect(s.queue.queue.length).toBe(4);
        expect(id).toBe(-1);

        await wait(span + 30);
        expect(s.queue.queue.length).toBe(3);
        expect(id).toBe(0);

        await wait(span + 30);
        expect(s.queue.queue.length).toBe(2);
        expect(id).toBe(1);

        await wait(span + 30);
        expect(s.queue.queue.length).toBe(1);
        expect(id).toBe(2);

        await wait(span + 30);
        expect(s.queue.queue.length).toBe(0);
        expect(id).toBe(3);
      });
    });
  });
});
