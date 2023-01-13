import { Env, _currentEnv } from "@/extension/extension_setup";
import {
  setupComputed,
  setupReactive,
  setupRef,
  setupWatch,
  setupCurrentEnv,
} from "@/index";
import { Completer } from "@/utils/completer";
import { AllowedLogger, AllowedModule, ELevel, Logger } from "@/utils/logger";
import { AsyncQueue } from "@/utils/queue";
import { computed, reactive, ref, watch } from "vue";
import { wait } from "../helpers/common.util.test.helper";

enum EModules {
  Test = "Test",
  Hobbits = "Hobbits",
}

describe("Logger", () => {
  const testModule: AllowedModule<EModules> = {
    moduleName: EModules.Test,
    disallowedHandler: (level) => false,
  };
  const newLogModule: AllowedModule<EModules> = {
    moduleName: EModules.Hobbits,
    disallowedHandler: (level) => {
      return level <= ELevel.info;
    },
  };
  const logModules: AllowedLogger<EModules> = {
    [EModules.Test]: testModule,
    [EModules.Hobbits]: newLogModule
  }
  beforeAll(() => {
    setupComputed(computed);
    setupReactive(reactive);
    setupRef(ref);
    setupWatch(watch);
    setupCurrentEnv("test");
  });
  describe("Considering of not using env", ()=>{
    let log: Logger<EModules>;
    function clear(env: Env, allowance: any){
      Logger.clearModules();
      setupCurrentEnv(env);
      Logger.setLoggerAllowance(allowance);
      log = new Logger(testModule);
    }

    beforeEach(()=>{
      clear("test",{[EModules.Test]: testModule});
    });
    test("add Module Test, expect Module Test exists", () => {
      const option = log._allowance;
      log = new Logger({ moduleName: EModules.Test });
      expect(option).toBe(log._allowance);
      expect(Logger.hasModule(testModule)).toBeTruthy();
      expect(Logger.isAllowed(testModule, ELevel.trace)).toBeTruthy();
    });
    test("trace logger, expect only three stack showup on screen and first stack can trace back to SubTemp", () => {
      const stackNumber = 3;
      function Temp() {
        function SubTemp() {
          log.log(["hello world, it's testModule calling"], { stackNumber });
        }
        return SubTemp();
      }
      Temp();
      expect(log._prevLog).not.toBeUndefined();
      expect(log._prevLog.stacksOnDisplay.length).toBe(stackNumber);
      expect(log._prevLog.stacksOnDisplay[0]).toContain("SubTemp");
      expect(log._prevLog.moduleName).toBe("Test");
    });
  
    test("set disallowed module, expect new logger never being called", () => {
      Logger.setLoggerAllowance<EModules>({
        [EModules.Test]: testModule,
      });
      const newLog = new Logger(newLogModule);
      newLog.log(["fellow", "it's testModule calling"]);
      expect(newLog._prevLog).toBeUndefined();
    });
  
    test("allow newLogModule and apply log on debug level, expect no logs to be allowed", () => {
      Logger.setLoggerAllowance<EModules>({
        [EModules.Test]: testModule,
        [EModules.Hobbits]: newLogModule,
      });
      const newLog = new Logger(newLogModule);
      newLog.log(["newLog", "it's newLog calling, expect not to be allowed"]);
      expect(
        Logger.isAllowed(newLogModule, ELevel.trace),
        "to be disallowed on trace level"
      ).toBeFalsy();
      expect(
        newLogModule.disallowedHandler(ELevel.trace),
        "to be disallowed on trace level"
      ).toBeTruthy();
      expect(newLog._prevLog).toBeUndefined();
    });
  
    test("allow newLogModule and apply log on info level, expect logs to be applied", () => {
      Logger.setLoggerAllowance<EModules>({
        [EModules.Test]: testModule,
        [EModules.Hobbits]: newLogModule,
      });
      const newLog = new Logger(newLogModule);
      newLog.current(["newLog", "it's newLog calling, expect to be allowed"]);
      expect(
        Logger.isAllowed(newLogModule, ELevel.current),
        "to be allowed on current level"
      ).toBeTruthy();
      expect(
        newLogModule.disallowedHandler(ELevel.current),
        "to be allowed on current level"
      ).toBeFalsy();
      expect(newLog._prevLog).not.toBeUndefined();
    });
  
    test("setAllowanceByEnv, expect assertion error", ()=>{
      const action = ()=> Logger.setLoggerAllowanceByEnv({
        test: {},
        develop: {}
      });
      expect(action).toThrow();
      expect(action).toThrowError("AssertionError");
    });
  });
  describe("Considering of using env", ()=>{
    let log: Logger<EModules>;

    function clear(env: Env, allowance: any){
      Logger.clearModules();
      setupCurrentEnv(env);
      Logger.setLoggerAllowanceByEnv(Object.assign({
        test: {},
        develop: {}
      }, allowance));
      log = new Logger(testModule);
    }

    beforeEach(()=>{
      clear("release", {
        release: {[EModules.Test]: testModule}
      });
    });

    test("setLoggerAllowanceByEnv - expect module not exists", () => {
      clear("test", {
        release: {[EModules.Test]: testModule}
      });
      expect(_currentEnv.value).toBe("test");

      console.log("allowedModules", (Logger as any).allowedModules)
      expect(Logger.hasModule(testModule)).toBeFalsy();
      Logger.clearModules();
    });

    test("setLoggerAllowanceByEnv - expect module exists", () => {
      expect(_currentEnv.value).toBe("release");
      expect(Logger.hasModule(testModule)).toBeTruthy();
      expect(log._allowance).toEqual(testModule);
    });

    test("trace logger, expect to be blocked since it's not dev mode", () => {
      expect(_currentEnv.value).toBe("release");
      expect(Logger.hasModule(testModule)).toBeTruthy();
      expect(log._allowance).toEqual(testModule);
      expect(Logger.isAllowed(log._allowance, ELevel.trace)).toBeFalsy();
    });

    test("warn logger, expect to be blocked since it's not dev mode", () => {
      function Temp() {
        function SubTemp() {
          log.warn(["hello world, it's testModule calling"], { stackNumber });
        }
        return SubTemp();
      }
      const stackNumber = 3;
      expect(_currentEnv.value).toBe("release");
      expect(Logger.hasModule(testModule)).toBeTruthy();
      expect(log._allowance).toEqual(testModule);
      expect(Logger.isAllowed(log._allowance, ELevel.warn)).toBeTruthy();
      Temp();
      expect(log._prevLog).not.toBeUndefined();
      expect(log._prevLog.stacksOnDisplay.length).toBe(stackNumber);
      expect(log._prevLog.stacksOnDisplay[0]).toContain("SubTemp");
      expect(log._prevLog.moduleName).toBe("Test");
    });
  });
  
});
