import { Env } from "../extension/extension_setup";
import { Color } from "colors";
export declare type LogColor = keyof Color;
/** LogRecord 暫時用來除錯的型別 */
export declare type LogRecord = {
    allStacks: string[];
    stacksOnDisplay: string[];
    lBound: number;
    rBound: number;
    moduleName: string;
};
export declare type AllowedModule<M> = {
    moduleName: M;
    disallowedHandler: (level: ELevel) => boolean;
};
export declare type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;
export declare type AllowedLoggerByEnv<M extends string> = {
    production?: AllowedLogger<M>;
    release?: AllowedLogger<M>;
    develop: AllowedLogger<M>;
    test: AllowedLogger<M>;
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
declare const colorCaster: Record<ELevel, (msg: string) => string>;
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
export declare class Logger<M> implements LoggerMethods {
    static setCurrentEnv(env: Env): void;
    static isDisallowed(option: AllowedModule<any>, level: ELevel): boolean;
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
    static setLevelColors(option: Partial<typeof colorCaster>): void;
    private static allowedModules;
    private static addModule;
    /** 設定什麼樣層級的 logger 允許被顯示 */
    static setLoggerAllowance<M extends string>(option: Partial<AllowedLogger<M>>): void;
    private static _setLoggerAllowance;
    /** 依據 env設定什麼樣層級的 logger 允許被顯示, 可透過
     * {@link setCurrentEnv} 改變當前 env 值
     */
    static setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>): void;
    static hasModule<M>(option: AllowedModule<M>): boolean;
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
