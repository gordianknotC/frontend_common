import {
  setupComputed,
  setupReactive,
  setupRef,
  setupWatch,
  setupCurrentEnv,
} from "@/index";
import { Completer } from "@/utils/completer";
import { AsyncQueue } from "@/utils/queue";
import { computed, reactive, ref, watch } from "vue";

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
  });

  describe("Queue", () => {
    let q: AsyncQueue<any>;
    let span = 500;
    let idA = 1;
    let idB = 2;
    let idC = 3;
    let idD = 4;
    beforeAll(() => {
      q = new AsyncQueue();
    });

    test("put three async in sequence and postpone to dequeue when on time", async () => {
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

      await wait((2 * span) / 3);
      expect(rA).toEqual({ idA });
      expect(rB).toEqual({ idB });
      expect(rC).toEqual({ idC });
      expect(q.queue.length).toBe(3);

      const resultA = await q.dequeue({ id: idA });
      const resultB = await q.dequeue({ id: idB });
      const resultC = await q.dequeue({ id: idC });

      expect(resultA).toEqual({ idA });
      expect(resultB).toEqual({ idB });
      expect(resultC).toEqual({ idC });
      expect(q.queue.length).toBe(0);
    });

    test("Repeatedly put heavy and light traffic requests", async () => {
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
      const resultA = await q.dequeue({ id: idA });
      expect(q.queue.length).toBe(3);
      expect(resultA).toEqual(rA);
      expect(time() - t).toBeGreaterThanOrEqual(wA);
      expect(time() - t).toBeLessThan(wB);

      const resultB = await q.dequeue({ id: idB });
      expect(q.queue.length).toBe(2);
      expect(resultB).toEqual(rB);
      expect(time() - t).toBeGreaterThanOrEqual(wB);
      expect(time() - t).toBeLessThan(wC);

      const resultC = await q.dequeue({ id: idC });
      expect(q.queue.length).toBe(1);
      expect(resultC).toEqual(rC);
      expect(time() - t).toBeGreaterThanOrEqual(wC);

      const resultD = await q.dequeue({ id: idD });
      expect(q.queue.length).toBe(0);
      expect(resultD).toEqual(rD);
      expect(time() - t).toBeGreaterThanOrEqual(wD);
    });

    test("dequeueByResult", async () => {
      let rA, rB, rC, rD;
      let [wA, wB, wC, wD] = [100, 200, 600, 800];
      const t = time();
      const pending = q.enqueue(idD, async () => {
        return new Promise(async (resolve) => {
          await wait(10000);
        });
      });
      function getPendingResult() {
        return pending.future;
      }
      await wait(wD);
      q.dequeueByResult({
        id: idD,
        result: {
          succeed: true,
        },
      });
      expect(getPendingResult()).resolves.toEqual({
        succeed: true,
      });
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

      expect(
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
});
