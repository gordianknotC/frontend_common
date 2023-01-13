

---
<!--#-->
### Feature
- 針對 trace/debug/info/warn/current/error/fatal 設置不同色彩
- 根據環境變數設置 overall log level
- 根據各別模組設置 log level

__型別__ | [source][s-logger]
```ts
abstract class LoggerMethods {
  abstract log(msg: any[], option?: LogOption): void;
  abstract trace(msg: any[], option?: LogOption): void;
  abstract info(msg: any[], option?: LogOption): void;
  abstract debug(msg: any[], option?: LogOption): void;
  abstract error(msg: any[], option?: LogOption): void;
  abstract fatal(msg: any[], option?: LogOption): void;
  abstract warn(msg: any[], option?: LogOption): void;
  abstract current(msg: any[], option?: LogOption): void;
}
Logger<M> implements LoggerMethods {
  static setCurrentEnv(env: Env) :void{}
  static isDisallowed(option: AllowedModule<any>, level: ELevel) :boolean{}
  static isAllowed(option: AllowedModule<any>, level: ELevel) :boolean{}
  static setLevelColors(option: Partial<typeof colorCaster>){};
  static setLoggerAllowance<M extends string>(option: Partial<AllowedLogger<M>>){};
  static setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>){};
  static hasModule<M>(option: AllowedModule<M>):boolean{};
}
```

### 設置色彩 
__型別__ | [source][s-logger]
```ts
// 內部使用 Color 套件
const defaultColorCaster: Record<ELevel, (msg: string) => string> = {
  [ELevel.trace]: (msg) => msg.grey,
  [ELevel.debug]: function (msg: string): string {
    return msg.white;
  },
  [ELevel.info]: function (msg: string): string {
    return msg.blue;
  },
  [ELevel.warn]: function (msg: string): string {
    return msg.yellow;
  },
  [ELevel.current]: function (msg: string): string {
    return msg.cyan;
  },
  [ELevel.error]: function (msg: string): string {
    return msg.red;
  },
  [ELevel.fatal]: function (msg: string): string {
    return msg.bgBrightRed;
  },
};

static setLevelColors(option: Partial<typeof defaultColorCaster>) {
  Object.assign(colorCaster, option);
}
```

__example__
```ts
const option = defaultColorCaster;
Logger.setLevelColors(option);
```

### 設置允許的 Logger
有以下二種方式
- [setLoggerAllowance](#setLoggerAllowance)
  不考慮 env, 設定什麼樣層級的 logger 允許被顯示, 不得與 [setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv) 混用如混用會 raise AssertionError
- [setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv)
  依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 [setCurrentEnv](#setCurrentEnv) 後呼叫, 一樣不得與 [setLoggerAllowance](#setLoggerAllowance) 混用如混用會 raise AssertionError

#### setLoggerAllowance 
__型別__ | [source][s-logger]
```ts
/** 
  * @typeParam M - module name 
*/
export type AllowedModule<M> = {
  moduleName: M;
  disallowedHandler: (level: ELevel) => boolean;
};
export type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;
setLoggerAllowance<M extends string>(option: Partial<AllowedLogger<M>>){}
```

__example__ 
混用 setLoggerAllowanceByEnv - raise AssertionError

```ts
// 不考慮 env
Logger.setLoggerAllowance<EModules>({
  [EModules.Test]: testModule,
  [EModules.Hobbits]: newLogModule,
});
const action = ()=> Logger.setLoggerAllowanceByEnv({
  test: {},
  develop: {}
});
expect(action).toThrow();
expect(action).toThrowError("AssertionError");
```

#### setLoggerAllowanceByEnv
__型別__ | [source][s-logger]
```ts
/** 
 * @see {@link AllowedLogger} 
 * @typeParam M - module name 
*/
export type AllowedLoggerByEnv<M extends string> = {
  production?: Partial<AllowedLogger<M>>;
  release?: Partial<AllowedLogger<M>>;
  develop: Partial<AllowedLogger<M>>;
  test: Partial<AllowedLogger<M>>;
};
setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>){}
```


__example__ | [source][s-test-logger]:
```ts
describe("Considering of using env", ()=>{
  let log: Logger<EModules>;
  const testModule: AllowedModule<EModules> = {
    moduleName: EModules.Test,
    disallowedHandler: (level) => false,
  };
  function clear(env: Env, allowance: any){
    Logger.clearModules();
    setupCurrentEnv(env);
    // 分別設置不同 env 下允許的 log level
    Logger.setLoggerAllowanceByEnv(Object.assign({
      test: {},
      develop: {},
      release: {},
      production: {}
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
```