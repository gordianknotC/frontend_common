import { setupCurrentEnv, _currentEnv, Env } from "@/extension/extension_setup";
import { useColors } from "@/plugin/colorsPlugin";
import { Color, strip } from "colors";
import { assert } from "./assert";
import { final, LazyHolder } from "./lazy";

export type LogColor = keyof Color;

/** LogRecord 暫時用來除錯的型別 */
export type LogRecord = {
  /** 所有 stack */
  allStacks: string[];
  /** lbound/rbound 處理後顥示的 stack */
  stacksOnDisplay: string[];
  lBound: number;
  rBound: number;
  moduleName: string;
};
/** 
  * @typeParam M - module name 
*/
export type AllowedModule<M> = {
  moduleName: M;
  disallowedHandler: (level: ELevel) => boolean;
};

/** 
 * @typeParam M - module name 
 * @example
 * ```ts
    enum EModules {
      Test = "Test",
      Hobbits = "Hobbits",
    }
    const testModule: AllowedModule = {
      moduleName: EModules.Test,
      disallowedHandler: (l)=> l <= ELevel.info
    }
    const allowed = {
      [EModules.Test]: testModule
    }
   ```*/
export type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;

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

export type LogOption = {
  /** 預設為2，由現在的 trace stack 中，回算幾個 traceBack 作為起點
   * 因為實作上的理由所以預設是3
   * (message > logger > _messenger > whereUserInvokingLogs)
   * 1          2        3            4
   * ^----------^--------^------------^
   * */
  traceBack?: number;
  /** 要顯示多少層的 error stacks */
  stackNumber?: number;
};
/**
TRACE.
DEBUG.
INFO.
WARN.
ERROR.
FATAL.
OFF.
 */
export enum ELevel {
  trace,
  debug,
  info,
  warn,
  current,
  error,
  fatal,
}

const EmptyLogOption: AllowedLoggerByEnv<any> = {test: {}, develop: {}};

const defaultLogOption = { traceBack: 3, stackNumber: 5 };

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

function message(
  moduleName: string,
  level: ELevel,
  msg: any[],
  traceBack: number = 2,
  stackNumber: number = 5
): LogRecord {
  const allStacks = new Error().stack!.split("\n");
  const maxStackRecs = allStacks.length;
  const lBound = Math.min(traceBack + 1, maxStackRecs);
  const stacksOnDisplay = allStacks.splice(
    lBound,
    Math.min(stackNumber, maxStackRecs)
  );
  const rBound = lBound + stacksOnDisplay.length;
  const renderedModuleName = (defaultColorCaster[level] as any)(`[${moduleName}]`);
  console.log(renderedModuleName, ...msg, "\n" + stacksOnDisplay.join("\n"));
  return {
    stacksOnDisplay,
    allStacks,
    lBound,
    rBound,
    moduleName,
  };
}

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

type SetLoggerAllowanceMode = "ByEnv" | "IgnoreEnv";

let LOGGER_MODE = final<SetLoggerAllowanceMode>();

/**
 * ### 始始化有以下二種方式
 * 1) {@link setLoggerAllowance}
 * 2) {@link setLoggerAllowanceByEnv}
 * 
 * #### setLoggerAllowance
 * @example
  ```ts
  // logger.setup.ts
  enum EModules {
    Test = "Test",
    Hobbits = "Hobbits",
  }
  const LogModules: AllowedModule<EModules> = {
    [EModules.Test]: {
      moduleName: EModules.Test,
      disallowedHandler: (level) => false,
    },
    [EModules.Hobbits]: {
      moduleName: EModules.Test,
      disallowedHandler: (level) => false,
    },
  }
  Logger.setCurrentEnv("develop")
  Logger.setLoggerAllowance(LogModules)

  // 使用：arbitrary.test.source.ts
  const D = new Logger(LogModules.Test)
  ```
 * 
 * #### setLoggerAllowanceByEnv
 * @example
 ```ts
  // logger.setup.ts
  enum EModules {
    Test = "Test",
    Hobbits = "Hobbits",
  }
  const LogModules: AllowedModule<EModules> = {
    [EModules.Test]: {
      moduleName: EModules.Test,
      disallowedHandler: (level) => false,
    },
    [EModules.Hobbits]: {
      moduleName: EModules.Test,
      disallowedHandler: (level) => false,
    },
  }
  Logger.setCurrentEnv("develop")
  // 以下只有 release 允許 log
  Logger.setLoggerAllowanceByEnv({
    test: {},
    develop: {},
    release: LogModules
  })

  // 使用：arbitrary.hobbits.source.ts
  const D = new Logger(LogModules.Hobbits)
  ```
 */
export class Logger<M> implements LoggerMethods {
  static setCurrentEnv(envGetter: ()=>Env) {
    this.getEnv = envGetter;
  }
  static isDisallowed(option: AllowedModule<any>, level: ELevel) {
    return !this.isAllowed(option, level);
  }

  /** 判斷 model 於當前 env 中，該 level 是否被允許
   * 如果是 dev mode (develop/test) 狀態下，預許不顯示 info 以下的 log
   */
  static isAllowed(option: AllowedModule<any>, level: ELevel): boolean {
    if (Logger.getEnv() != "develop" && Logger.getEnv() != "test") {
      if (level <= ELevel.info) {
        console.log("block allowance, since it's not dev mode")
        return false;
      }
    }
    const module = this.allowedModules[this.getEnv()][option.moduleName as any];
    assert(()=>module != undefined, `module: ${option.moduleName} not found, please`);
    const allowed = !(module?.disallowedHandler(level) ?? true);
    console.log("isAllowed:", allowed, option.moduleName, "on level:", level);
    return allowed;
  }

  /** 設定不同 level 要程現什麼樣的色彩
   * @example
   * ```ts
    const colorCaster: Record<ELevel, (msg:string)=>string> = {
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
    }
    Logger.setLevelColors(colorCaster);
   * ```
   */
  static setLevelColors(option: Partial<typeof defaultColorCaster>) {
    Object.assign(defaultColorCaster, option);
  }

  /** 不考慮 env, 設定什麼樣層級的 logger 允許被顯示, 不得與 
   * {@link setLoggerAllowanceByEnv} 混用如混用會 raise AssertionError
   * @typeParam M - 模組名
   * @example - 混用的列子
     ```ts
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
   */
  static setLoggerAllowance<M extends string>(
    option: Partial<AllowedLogger<M>>
  ) {
    assert(
      () => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "IgnoreEnv",
      "Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together"
    );
    LOGGER_MODE.value ??= "IgnoreEnv";
    this._setLoggerAllowance(option);
  }

  /** 
   * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
   */
  static setLoggerAllowanceByEnv<M extends string>(
    option: AllowedLoggerByEnv<M>
  ) {
    assert(
      () => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "ByEnv",
      "AssertionError: Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together"
    );
    LOGGER_MODE.value ??= "ByEnv";
    const env = Logger.getEnv();
    Logger.allowedModules = Object.assign({...EmptyLogOption}, option);
  }

  static hasModule<M>(option: AllowedModule<M>) {
    return this.allowedModules[this.getEnv()][option.moduleName as any] != undefined;
  }

  static clearModules(){
    this.allowedModules = {...EmptyLogOption};
    LOGGER_MODE = final();
  }

  private static allowedModules: AllowedLoggerByEnv<any> = {
    test: {}, develop: {}
  };

  private static addModule<M>(allowance: AllowedModule<M>) {
    Logger.allowedModules[Logger.getEnv()][allowance.moduleName as any] = allowance;
  }
  private static getEnv = ()=> _currentEnv.value;

  private static _setLoggerAllowance<M extends string>(
    option: Partial<AllowedLogger<M>>
  ) {
    console.log("_setLoggerAllowance:", option)
    Logger.allowedModules = {...EmptyLogOption};
    Object.entries(option).forEach((pair) => {
      const [k, v] = pair as any as [M, AllowedModule<M>];
      Logger.addModule(v);
    });
    console.log("_setLoggerAllowance, allowedModules:", this.allowedModules)
  }

  _prevLog?: LogRecord;
  _allowance?: AllowedModule<M>;

  constructor(option: Pick<AllowedModule<M>, "moduleName">) {
    if (Logger.hasModule(option as any)) {
      this._allowance = Logger.allowedModules[Logger.getEnv()][option.moduleName];
      // todo: remind of user that module configuration never being override
    } else {
      useColors();
      this._allowance = Object.assign(
        {
          disallowedHandler: (level: ELevel) => {
            return false;
          },
        },
        {
          ...option,
        } as AllowedModule<M>
      );
      if (LOGGER_MODE.value == "IgnoreEnv")
        Logger.addModule(this._allowance!);
    }
  }

  _messenger(msg: any[], level: ELevel, option?: LogOption) {
    if (Logger.isAllowed(this._allowance!, level)) {
      assert(() => this._allowance != undefined);
      console.log("invoke log:", ...msg);
      this._prevLog = message(
        this._allowance.moduleName as any,
        level,
        msg,
        option?.traceBack ?? defaultLogOption.traceBack,
        option?.stackNumber ?? defaultLogOption.stackNumber
      );
    }
  }
  // todo: 簡化
  /**
   * @param option.traceBack - {@link LogOption} 預設為2，由現在的 trace stack 中，回算幾個 traceBack 作為起點, 因為實作上的理由所以預設是3
   * @param option.stackNumber - {@link LogOption} 要顯示多少層的 error stacks
   */
  log(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.trace, option);
  }
  /** {@inheritdoc log} */
  trace(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.trace, option);
  }
  /** {@inheritdoc log} */
  debug(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.debug, option);
  }
  /** {@inheritdoc log} */
  info(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.info, option);
  }
  /** {@inheritdoc log} */
  warn(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.warn, option);
  }
  /** {@inheritdoc log} */
  current(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.current, option);
  }
  /** {@inheritdoc log} */
  error(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.error, option);
  }
  /** {@inheritdoc log} */
  fatal(msg: any[], option?: LogOption): void {
    this._messenger(msg, ELevel.fatal, option);
  }
}
