

---
<!--#-->
Logger

__型別__ | [source][s-logger]

__example__ | [source][s-test-logger]:
```ts
  describe("Logger", () => {
  let log: Logger<EModules>;
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
  beforeAll(() => {
    ...
    log = new Logger(testModule);
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
    log.log(["fellow", "it's testModule calling"]);
    expect(log._prevLog.moduleName).toBe("Test");
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
});
```