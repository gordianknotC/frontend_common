import { Env } from "../extension/extension_setup";
import { Color } from "colors";
export declare type LogColor = keyof Color;
/** LogRecord 暫時用來除錯的型別 */
export declare type LogRecord = {
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
export declare type AllowedModule<M> = {
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
export declare type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;
/**
 * @see {@link AllowedLogger}
 * @typeParam M - module name
*/
export declare type AllowedLoggerByEnv<M extends string> = {
    production?: Partial<AllowedLogger<M>>;
    release?: Partial<AllowedLogger<M>>;
    develop: Partial<AllowedLogger<M>>;
    test: Partial<AllowedLogger<M>>;
};
export declare type LogOption = {
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
export declare enum ELevel {
    trace = 0,
    debug = 1,
    info = 2,
    warn = 3,
    current = 4,
    error = 5,
    fatal = 6
}
declare const defaultColorCaster: Record<ELevel, (msg: string) => string>;
declare abstract class LoggerMethods {
    abstract log(msg: any[], option?: LogOption): void;
    abstract trace(msg: any[], option?: LogOption): void;
    abstract info(msg: any[], option?: LogOption): void;
    abstract debug(msg: any[], option?: LogOption): void;
    abstract error(msg: any[], option?: LogOption): void;
    abstract fatal(msg: any[], option?: LogOption): void;
    abstract warn(msg: any[], option?: LogOption): void;
    abstract current(msg: any[], option?: LogOption): void;
}
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
export declare class Logger<M> implements LoggerMethods {
    static setCurrentEnv(envGetter: () => Env): void;
    static isDisallowed(option: AllowedModule<any>, level: ELevel): boolean;
    /** 判斷 model 於當前 env 中，該 level 是否被允許
     * 如果是 dev mode (develop/test) 狀態下，預許不顯示 info 以下的 log
     */
    static isAllowed(option: AllowedModule<any>, level: ELevel): boolean;
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
    static setLevelColors(option: Partial<typeof defaultColorCaster>): void;
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
    static setLoggerAllowance<M extends string>(option: Partial<AllowedLogger<M>>): void;
    /**
     * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
     */
    static setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>): void;
    static hasModule<M>(option: AllowedModule<M>): boolean;
    static clearModules(): void;
    private static allowedModules;
    private static addModule;
    private static getEnv;
    private static _setLoggerAllowance;
    _prevLog?: LogRecord;
    _allowance?: AllowedModule<M>;
    constructor(option: Pick<AllowedModule<M>, "moduleName">);
    _messenger(msg: any[], level: ELevel, option?: LogOption): void;
    /**
     * @param option.traceBack - {@link LogOption} 預設為2，由現在的 trace stack 中，回算幾個 traceBack 作為起點, 因為實作上的理由所以預設是3
     * @param option.stackNumber - {@link LogOption} 要顯示多少層的 error stacks
     */
    log(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    trace(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    debug(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    info(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    warn(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    current(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    error(msg: any[], option?: LogOption): void;
    /** {@inheritdoc log} */
    fatal(msg: any[], option?: LogOption): void;
}
export {};
