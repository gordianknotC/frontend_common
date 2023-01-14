import { Env } from "../extension/extension_setup";
import { LoggerMethods, AllowedLoggerByEnv, ELevel, AllowedModule, LogRecord, LogOption, RawAllowedLogger } from "./logger.types";
/** 預設 logger color */
declare const defaultColorCaster: Record<ELevel, (msg: string) => string>;
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
  const testModule = {
    moduleName: EModules.Test,
    disallowedHandler: (level) => false,
  };
  const newModule = {
    moduleName: EModules.Hobbits,
    disallowedHandler: (level) => false,
  }
  
  Logger.setCurrentEnv("develop")
  const LogModules = Logger.setLoggerAllowance(LogModules)

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
  const testModule = {
    moduleName: EModules.Test,
    disallowedHandler: (level) => false,
  };
  const newModule = {
    moduleName: EModules.Hobbits,
    disallowedHandler: (level) => false,
  }
  Logger.setCurrentEnv("develop")
  const LogModules = Logger.setLoggerAllowanceByEnv({
    test: [],
    develop: [],
    release: [testModule, newModule]
  });
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
    static isAllowed(option?: AllowedModule<any>, level?: ELevel): boolean;
    static toAllowedLogger<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M>;
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
      Logger.setLoggerAllowance<EModules>([
        testModule, newLogModule
      ]);
      const action = ()=> Logger.setLoggerAllowanceByEnv({
        test: [],
        develop: []
      });
      expect(action).toThrow();
      expect(action).toThrowError("AssertionError");
      ```
     * @example - 非混用
     * ```ts
        const ClientModule: AllowedModule<EModules> = {
          moduleName: EModules.Client,
          disallowedHandler: (level)=> false
        }
        const LogModules = defineAllowedLoggers([
          ClientModule,
          {...ClientModule, moduleName: EModules.AuthGuard},
          {...ClientModule, moduleName: EModules.RequestRep},
          {...ClientModule, moduleName: EModules.HeaderUpdater}
        ])
        Logger.setLoggerAllowanceByEnv(LogModules)
     * ```
     */
    static setLoggerAllowance<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M>;
    /**
     * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
     */
    static setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>): Partial<RawAllowedLogger<M>>;
    static hasModule<M>(option: AllowedModule<M>): boolean;
    static clearModules(): void;
    private static allowedModules;
    private static addModule;
    private static getEnv;
    _prevLog?: LogRecord;
    _allowance?: AllowedModule<M>;
    constructor(option?: Pick<AllowedModule<M>, "moduleName">);
    _messenger(msg: any[], level: ELevel, option?: LogOption): void;
    /**
     * @param option.traceAt - {@link LogOption} {@link defaultLogOption}
     * @param option.stackNumber - {@link LogOption} {@link defaultLogOption}
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
