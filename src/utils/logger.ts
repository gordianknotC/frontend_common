import { setupCurrentEnv, _currentEnv, Env } from "@/extension/extension_setup";
import { useColors } from "@/plugin/colorsPlugin";
import { Color, strip } from "colors";
import { assert } from "./assert";
import { final, LazyHolder } from "./lazy";
import { RawAllowedLoggerByEnv, SetLoggerAllowanceMode, LoggerMethods, AllowedLoggerByEnv, ELevel, AllowedModule, LogRecord, LogOption, RawAllowedLogger } from "./logger.types";
 
const EmptyLogOption: RawAllowedLoggerByEnv<any> = {test: {}, develop: {}};

/**
 * @property traceAt - 由現在的位置({@link message})向前 traceAt 多少行, 因實作因素預設3
 * @property stackNumber - 由現在的 Stack 向前保留多少個 stack，預設5
 */
const defaultLogOption = { traceAt: 3, stackNumber: 5 };

/** 預設 logger color */
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
  traceAt: number = 2,
  stackNumber: number = 5
): LogRecord {
  const allStacks = new Error().stack!.split("\n");
  const maxStackRecs = allStacks.length;
  const lBound = Math.min(traceAt + 1, maxStackRecs);
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
  static isAllowed(option?: AllowedModule<any>, level?: ELevel): boolean {
    if (!option)
      return false;
    level ??= ELevel.trace;
    if (Logger.getEnv() != "develop" && Logger.getEnv() != "test") {
      if (level <= ELevel.info) {
        console.info("block allowance, since it's not dev mode")
        return false;
      }
    }
    const module = this.allowedModules[this.getEnv()][option.moduleName as any];
    assert(()=>module != undefined, `module: ${option.moduleName} not found, please setLoggerAllowance first! For more info "https://github.com/gordianknotC/frontend_common#%E8%A2%91%E5%A7%8B%E5%8C%96"`);
    const allowed = !(
      module!.disallowedHandler(module.logLevelHandler(level)) ?? true
    );
    return allowed;
  }
  static toAllowedLogger<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M> {
    const result: RawAllowedLogger<M> = {} as any;
    modules.forEach((module)=>{
      module.logLevelHandler ??= (level)=>level;
      result[module.moduleName] = module;
    });
    return result;
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
  static setLoggerAllowance<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M> {
    assert(
      () => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "IgnoreEnv",
      "Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together"
    );
    const allowedLogger = this.toAllowedLogger(modules);
    LOGGER_MODE.value ??= "IgnoreEnv";
    Logger.allowedModules = {...EmptyLogOption};
    Object.entries(allowedLogger).forEach((pair) => {
      const [k, v] = pair as any as [M, AllowedModule<M>];
      Logger.addModule(v);
    });
    return allowedLogger;
  }

  /** 
   * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
   */
  static setLoggerAllowanceByEnv<M extends string>(
    option: AllowedLoggerByEnv<M>
  ): Partial<RawAllowedLogger<M>>  {
    assert(
      () => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "ByEnv",
      "AssertionError: Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together"
    );
    LOGGER_MODE.value ??= "ByEnv";
    const newOption: RawAllowedLoggerByEnv<M> = {} as any;
    Object.entries(option).forEach((pair)=>{
      const [env, v] = pair;
      newOption[env as keyof (RawAllowedLoggerByEnv<M>)] = this.toAllowedLogger(v);
    })
    Logger.allowedModules = Object.assign({...EmptyLogOption}, newOption);
    return this.allowedModules[this.getEnv()];
  }

  static hasModule<M>(option: AllowedModule<M>) {
    return this.allowedModules[this.getEnv()][option.moduleName as any] != undefined;
  }

  static clearModules(){
    this.allowedModules = {...EmptyLogOption};
    LOGGER_MODE = final();
  }

  private static allowedModules: RawAllowedLoggerByEnv<any> = {
    test: {}, develop: {}
  };

  private static addModule<M>(allowance: AllowedModule<M>) {
    Logger.allowedModules[Logger.getEnv()][allowance.moduleName as any] = allowance;
  }
  private static getEnv = ()=> _currentEnv.value;

  
  _prevLog?: LogRecord;
  _allowance?: AllowedModule<M>;

  constructor(option?: Pick<AllowedModule<M>, "moduleName">) {
    if (!option){
      return;
    }
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
    if (Logger.isAllowed(this._allowance, level)) {
      assert(() => this._allowance != undefined);
      this._prevLog = message(
        this._allowance.moduleName as any,
        level,
        msg,
        option?.traceAt ?? defaultLogOption.traceAt,
        option?.stackNumber ?? defaultLogOption.stackNumber
      );
    }
  }

  /**
   * @param option.traceAt - {@link LogOption} {@link defaultLogOption}
   * @param option.stackNumber - {@link LogOption} {@link defaultLogOption}
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

