"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.ELevel = void 0;
const extension_setup_1 = require("../extension/extension_setup");
const colorsPlugin_1 = require("../plugin/colorsPlugin");
const assert_1 = require("./assert");
const lazy_1 = require("./lazy");
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
const EmptyLogOption = { test: {}, develop: {} };
const defaultLogOption = { traceBack: 3, stackNumber: 5 };
const defaultColorCaster = {
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
    const renderedModuleName = defaultColorCaster[level](`[${moduleName}]`);
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
let LOGGER_MODE = (0, lazy_1.final)();
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
class Logger {
    constructor(option) {
        if (Logger.hasModule(option)) {
            this._allowance = Logger.allowedModules[Logger.getEnv()][option.moduleName];
            // todo: remind of user that module configuration never being override
        }
        else {
            (0, colorsPlugin_1.useColors)();
            this._allowance = Object.assign({
                disallowedHandler: (level) => {
                    return false;
                },
            }, {
                ...option,
            });
            if (LOGGER_MODE.value == "IgnoreEnv")
                Logger.addModule(this._allowance);
        }
    }
    static setCurrentEnv(envGetter) {
        this.getEnv = envGetter;
    }
    static isDisallowed(option, level) {
        return !this.isAllowed(option, level);
    }
    /** 判斷 model 於當前 env 中，該 level 是否被允許
     * 如果是 dev mode (develop/test) 狀態下，預許不顯示 info 以下的 log
     */
    static isAllowed(option, level) {
        var _a;
        if (Logger.getEnv() != "develop" && Logger.getEnv() != "test") {
            if (level <= ELevel.info) {
                console.log("block allowance, since it's not dev mode");
                return false;
            }
        }
        const module = this.allowedModules[this.getEnv()][option.moduleName];
        (0, assert_1.assert)(() => module != undefined, `module: ${option.moduleName} not found, please`);
        const allowed = !((_a = module === null || module === void 0 ? void 0 : module.disallowedHandler(level)) !== null && _a !== void 0 ? _a : true);
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
    static setLoggerAllowance(option) {
        var _a;
        (0, assert_1.assert)(() => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "IgnoreEnv", "Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together");
        (_a = LOGGER_MODE.value) !== null && _a !== void 0 ? _a : (LOGGER_MODE.value = "IgnoreEnv");
        this._setLoggerAllowance(option);
    }
    /**
     * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
     */
    static setLoggerAllowanceByEnv(option) {
        var _a;
        (0, assert_1.assert)(() => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "ByEnv", "AssertionError: Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together");
        (_a = LOGGER_MODE.value) !== null && _a !== void 0 ? _a : (LOGGER_MODE.value = "ByEnv");
        const env = Logger.getEnv();
        Logger.allowedModules = Object.assign({ ...EmptyLogOption }, option);
    }
    static hasModule(option) {
        return this.allowedModules[this.getEnv()][option.moduleName] != undefined;
    }
    static clearModules() {
        this.allowedModules = { ...EmptyLogOption };
        LOGGER_MODE = (0, lazy_1.final)();
    }
    static addModule(allowance) {
        Logger.allowedModules[Logger.getEnv()][allowance.moduleName] = allowance;
    }
    static _setLoggerAllowance(option) {
        console.log("_setLoggerAllowance:", option);
        Logger.allowedModules = { ...EmptyLogOption };
        Object.entries(option).forEach((pair) => {
            const [k, v] = pair;
            Logger.addModule(v);
        });
        console.log("_setLoggerAllowance, allowedModules:", this.allowedModules);
    }
    _messenger(msg, level, option) {
        var _a, _b;
        if (Logger.isAllowed(this._allowance, level)) {
            (0, assert_1.assert)(() => this._allowance != undefined);
            console.log("invoke log:", ...msg);
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
Logger.allowedModules = {
    test: {}, develop: {}
};
Logger.getEnv = () => extension_setup_1._currentEnv.value;
//# sourceMappingURL=logger.js.map