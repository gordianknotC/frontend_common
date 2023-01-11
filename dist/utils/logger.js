"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.ELevel = void 0;
const extension_setup_1 = require("../extension/extension_setup");
const colorsPlugin_1 = require("../plugin/colorsPlugin");
const console_1 = require("console");
/**
TRACE.
DEBUG.
INFO.
WARN.
ERROR.
FATAL.
OFF.
 */
var ELevel;
(function (ELevel) {
    ELevel[ELevel["trace"] = 0] = "trace";
    ELevel[ELevel["debug"] = 1] = "debug";
    ELevel[ELevel["info"] = 2] = "info";
    ELevel[ELevel["warn"] = 3] = "warn";
    ELevel[ELevel["current"] = 4] = "current";
    ELevel[ELevel["error"] = 5] = "error";
    ELevel[ELevel["fatal"] = 6] = "fatal";
})(ELevel = exports.ELevel || (exports.ELevel = {}));
const defaultLogOption = { traceBack: 3, stackNumber: 5 };
const colorCaster = {
    [ELevel.trace]: (msg) => msg.grey,
    [ELevel.debug]: function (msg) {
        return msg.white;
    },
    [ELevel.info]: function (msg) {
        return msg.blue;
    },
    [ELevel.warn]: function (msg) {
        return msg.yellow;
    },
    [ELevel.current]: function (msg) {
        return msg.cyan;
    },
    [ELevel.error]: function (msg) {
        return msg.red;
    },
    [ELevel.fatal]: function (msg) {
        return msg.bgBrightRed;
    },
};
function message(moduleName, level, msg, traceBack = 2, stackNumber = 5) {
    const allStacks = new Error().stack.split("\n");
    const maxStackRecs = allStacks.length;
    const lBound = Math.min(traceBack + 1, maxStackRecs);
    const stacksOnDisplay = allStacks.splice(lBound, Math.min(stackNumber, maxStackRecs));
    const rBound = lBound + stacksOnDisplay.length;
    const renderedModuleName = colorCaster[level](`[${moduleName}]`);
    console.log(renderedModuleName, ...msg, "\n" + stacksOnDisplay.join("\n"));
    return {
        stacksOnDisplay,
        allStacks,
        lBound,
        rBound,
        moduleName,
    };
}
class LoggerMethods {
}
class Logger {
    constructor(option) {
        if (Logger.hasModule(option)) {
            this._allowance = Logger.allowedModules[option.moduleName];
            // todo: remind of user that module configuration never being override
        }
        else {
            (0, colorsPlugin_1.useColors)();
            this._allowance = Object.assign({
                disallowedLevels: (level) => {
                    return false;
                }
            }, {
                ...option
            });
            Logger.addModule(this._allowance);
        }
    }
    static setOverallAllowanceOnEnv() {
    }
    static isDisallowed(option, level) {
        return !this.isAllowed(option, level);
    }
    static isAllowed(option, level) {
        if (extension_setup_1._currentEnv.value != "develop" && extension_setup_1._currentEnv.value != "test") {
            if (level <= ELevel.info)
                return false;
        }
        const module = this.allowedModules[option.moduleName];
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
    static setLevelColors(option) {
        Object.assign(colorCaster, option);
    }
    static addModule(allowance) {
        Logger.allowedModules[allowance.moduleName] = allowance;
    }
    /** 設定什麼樣層級的 logger 允許被顯示 */
    static setLoggerAllowance(option) {
        Logger.allowedModules = {};
        const a = {};
        Object.entries(option).forEach((pair) => {
            const [k, v] = pair;
            Logger.addModule(v);
        });
    }
    static hasModule(option) {
        return this.allowedModules[option.moduleName] != undefined;
    }
    _messenger(msg, level, option) {
        var _a, _b;
        if (Logger.isAllowed(this._allowance, level)) {
            (0, console_1.assert)(() => this._allowance != undefined);
            console.log('invoke log:', ...msg);
            this._prevLog = message(this._allowance.moduleName, level, msg, (_a = option === null || option === void 0 ? void 0 : option.traceBack) !== null && _a !== void 0 ? _a : defaultLogOption.traceBack, (_b = option === null || option === void 0 ? void 0 : option.stackNumber) !== null && _b !== void 0 ? _b : defaultLogOption.stackNumber);
        }
    }
    // todo: 簡化
    /**
     * @param option.traceBack - {@link LogOption} 預設為2，由現在的 trace stack 中，回算幾個 traceBack 作為起點, 因為實作上的理由所以預設是3
     * @param option.stackNumber - {@link LogOption} 要顯示多少層的 error stacks
     */
    log(msg, option) {
        this._messenger(msg, ELevel.trace, option);
    }
    /** {@inheritdoc log} */
    trace(msg, option) {
        this._messenger(msg, ELevel.trace, option);
    }
    /** {@inheritdoc log} */
    debug(msg, option) {
        this._messenger(msg, ELevel.debug, option);
    }
    /** {@inheritdoc log} */
    info(msg, option) {
        this._messenger(msg, ELevel.info, option);
    }
    /** {@inheritdoc log} */
    warn(msg, option) {
        this._messenger(msg, ELevel.warn, option);
    }
    /** {@inheritdoc log} */
    current(msg, option) {
        this._messenger(msg, ELevel.current, option);
    }
    /** {@inheritdoc log} */
    error(msg, option) {
        this._messenger(msg, ELevel.error, option);
    }
    /** {@inheritdoc log} */
    fatal(msg, option) {
        this._messenger(msg, ELevel.fatal, option);
    }
}
exports.Logger = Logger;
Logger.allowedModules = {};
//# sourceMappingURL=logger.js.map