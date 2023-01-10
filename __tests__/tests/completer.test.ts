
import { setupComputed, setupReactive, setupRef, setupWatch, setupCurrentEnv } from "@/index";
import { Completer } from "@/utils/completer";
import { Queue } from "@/utils/queue";
import { computed, reactive, ref, watch } from "vue";
import { wait } from "../helpers/common.util.test.helper";

 

  describe("Completer", ()=>{
    beforeAll(()=>{
      setupComputed(computed);
      setupReactive(reactive);
      setupRef(ref);
      setupWatch(watch);
      setupCurrentEnv("develop");
    });
    test("expect completer waiting for user to resolve to complete itself", async ()=>{
      const completer = new Completer();
      function fetch(){
        return completer.future;
      }
      const futureResult = fetch();
      await wait(400);
      expect(typeof (futureResult.then)).toBe("function");
      expect((futureResult as any).value).toBeUndefined();
      completer.complete({value: ""})
      expect(((await futureResult) as any).value).not.toBeUndefined();
    })
  });


