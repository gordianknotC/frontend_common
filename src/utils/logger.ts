import { setupCurrentEnv, _currentEnv, Env } from "@/extension/extension_setup";
import { useColors } from "@/plugin/colorsPlugin";
import { Color, strip } from "colors";
import { assert } from "./assert";
import { final, LazyHolder } from "./lazy";

export type LogColor = keyof Color;

/** LogRecord 暫時用來除錯的型別 */
export type LogRecord = {
  allStacks: string[];
  stacksOnDisplay: string[];
  lBound: number;
  rBound: number;
  moduleName: string;
};
export type AllowedModule<M> = {
  moduleName: M;
  disallowedHandler: (level: ELevel) => boolean;
};

export type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;

export type AllowedLoggerByEnv<M extends string> = {
  production?: AllowedLogger<M>;
  release?: AllowedLogger<M>;
  develop: AllowedLogger<M>;
  test: AllowedLogger<M>;
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

const defaultLogOption = { traceBack: 3, stackNumber: 5 };

const colorCaster: Record<ELevel, (msg: string) => string> = {
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
  const renderedModuleName = (colorCaster[level] as any)(`[${moduleName}]`);
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

const LOGGER_MODE = final<SetLoggerAllowanceMode>();

export class Logger<M> implements LoggerMethods {
  static setCurrentEnv(env: Env) {
    setupCurrentEnv(env);
  }
  static isDisallowed(option: AllowedModule<any>, level: ELevel) {
    return !this.isAllowed(option, level);
  }
  static isAllowed(option: AllowedModule<any>, level: ELevel) {
    if (_currentEnv.value != "develop" && _currentEnv.value != "test") {
      if (level <= ELevel.info) return false;
    }
    const module = this.allowedModules[option.moduleName as any];
    const allowed = !module.disallowedHandler(level);
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
  static setLevelColors(option: Partial<typeof colorCaster>) {
    Object.assign(colorCaster, option);
  }

  private static allowedModules: AllowedLogger<any> = {} as any;

  private static addModule<M>(allowance: AllowedModule<M>) {
    Logger.allowedModules[allowance.moduleName as any] = allowance;
  }

  /** 設定什麼樣層級的 logger 允許被顯示 */
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

  private static _setLoggerAllowance<M extends string>(
    option: Partial<AllowedLogger<M>>
  ) {
    Logger.allowedModules = {};
    const a = {};
    Object.entries(option).forEach((pair) => {
      const [k, v] = pair as any as [M, AllowedModule<M>];
      Logger.addModule(v);
    });
  }

  /** 依據 env設定什麼樣層級的 logger 允許被顯示, 可透過
   * {@link setCurrentEnv} 改變當前 env 值
   */
  static setLoggerAllowanceByEnv<M extends string>(
    option: AllowedLoggerByEnv<M>
  ) {
    assert(
      () => false,
      "AssertionError: Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together"
    );
    console.log("******", LOGGER_MODE.value, _currentEnv.value);
    console.log("*********", LOGGER_MODE.value == undefined || LOGGER_MODE.value == "ByEnv");
    LOGGER_MODE.value ??= "ByEnv";
    const env = _currentEnv.value;
    const allowedLogger = option[env];
    this._setLoggerAllowance(allowedLogger);
  }

  static hasModule<M>(option: AllowedModule<M>) {
    return this.allowedModules[option.moduleName as any] != undefined;
  }

  _prevLog?: LogRecord;
  _allowance?: AllowedModule<M>;

  constructor(option: Pick<AllowedModule<M>, "moduleName">) {
    if (Logger.hasModule(option as any)) {
      this._allowance = Logger.allowedModules[option.moduleName];
      // todo: remind of user that module configuration never being override
    } else {
      useColors();
      this._allowance = Object.assign(
        {
          disallowedLevels: (level: ELevel) => {
            return false;
          },
        },
        {
          ...option,
        } as AllowedModule<M>
      );
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
