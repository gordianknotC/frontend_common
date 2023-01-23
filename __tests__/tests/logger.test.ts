import { Env, _currentEnv } from "@/extension/extension_setup";
import {
  setupComputed,
  setupReactive,
  setupRef,
  setupWatch,
  setupCurrentEnv,
} from "@/index";
import { Completer } from "@/utils/completer";
import { RawAllowedLogger, AllowedModule, ELevel } from "@/utils/logger.types";
import { Logger } from "@/utils/logger";
import { AsyncQueue } from "@/utils/queue";
import { computed, reactive, ref, watch } from "vue";
import { wait } from "../helpers/common.util.test.helper";
import { loggerSetupA } from "../setup/logger.setup.A";
import { LoggerHelper } from "../helpers/logger.test.helper";

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
  const logModules: RawAllowedLogger<EModules> = {
    [EModules.Test]: testModule,
    [EModules.Hobbits]: newLogModule,
  };
  beforeAll(() => {
    setupComputed(computed);
    setupReactive(reactive);
    setupRef(ref);
    setupWatch(watch);
    setupCurrentEnv("test");
  });

  describe("set logger env via setupCurrentEnv", () => {
    let log: Logger<EModules>;
    function clear(env: Env, allowance: any[]) {
      Logger.clearModules();
      setupCurrentEnv(env);
      Logger.setLoggerAllowance(allowance);
      log = new Logger(testModule);
    }
    beforeEach(() => {
      clear("test", [testModule]);
    });
    afterEach(() => {
      log.current(["abc"]);
      log.log(["abc"]);
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
          log.current(["hello world, it's testModule calling"], {
            stackNumber,
          });
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
      Logger.setLoggerAllowance<EModules>([testModule, newLogModule]);
      const newLog = new Logger(newLogModule);
      newLog.log(["fellow", "it's testModule calling"]);
      expect(newLog._prevLog).toBeUndefined();
    });

    test("allow newLogModule and apply log on debug level, expect no logs to be allowed", () => {
      Logger.setLoggerAllowance<EModules>([testModule, newLogModule]);
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
      Logger.setLoggerAllowance<EModules>([testModule, newLogModule]);
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

    test("setAllowanceByEnv, expect assertion error", () => {
      const action = () =>
        Logger.setLoggerAllowanceByEnv({
          test: [],
          develop: [],
        });
      expect(action).toThrow();
      expect(action).toThrowError("AssertionError");
    });
  });

  describe("set Logger env via setCurrentEnv", () => {
    let log: Logger<EModules>;
    function clear(env: Env, allowance: any[]) {
      Logger.clearModules();
      // setupCurrentEnv(env);
      Logger.setCurrentEnv(() => env);
      Logger.setLoggerAllowanceByEnv(
        Object.assign(
          {
            test: [],
            develop: [],
          },
          {
            [env]: allowance,
          }
        ) as any
      );
      log = new Logger(testModule);
    }

    beforeEach(() => {
      clear("release", [testModule]);
    });
    afterEach(() => {
      log.current(["abc"]);
      log.log(["abc"]);
      Logger.clearModules();
    });

    test("setLoggerAllowanceByEnv - expect module not exists", () => {
      clear("test", [testModule]);
      Logger.setCurrentEnv(() => "develop");
      expect((Logger as any).getEnv()).toBe("develop");
      console.log("allowedModules", (Logger as any).allowedModules);
      expect(Logger.hasModule(testModule)).toBeFalsy();
    });

    test("setLoggerAllowanceByEnv - expect module exists", () => {
      expect((Logger as any).getEnv()).toBe("release");
      expect(Logger.hasModule(testModule)).toBeTruthy();
      expect(log._allowance).toEqual(testModule);
    });

    test("trace logger, expect to be blocked since it's not dev mode", () => {
      expect((Logger as any).getEnv()).toBe("release");
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
      expect((Logger as any).getEnv()).toBe("release");
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

  describe("integration tests - setupA", () => {
    let helper: LoggerHelper;;
    beforeEach(() => {
    });

    test("expect log pass on test env", ()=>{
      const { LogModules, allModules } = loggerSetupA("test");
      const D = new Logger(LogModules.AuthClient);
      const helper = new LoggerHelper(D);
      helper.expectLogPass("hello", LogModules.AuthClient!.moduleName);
    });

    test("expect log ignored on release env", ()=>{
      const { LogModules, allModules } = loggerSetupA("release");
      const D = new Logger(LogModules.AuthClient);
      const helper = new LoggerHelper(D);
      helper.expectLogIgnored("hello", LogModules.AuthClient?.moduleName);
    });

    test("expect log ignored on production env", ()=>{
      const { LogModules, allModules } = loggerSetupA("production");
      const D = new Logger(LogModules.AuthClient);
      const helper = new LoggerHelper(D);
      helper.expectLogIgnored("hello", LogModules.AuthClient?.moduleName);
    });
  });
});
