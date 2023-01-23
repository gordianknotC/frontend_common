"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const extension_setup_1 = require("../extension/extension_setup");
const colorsPlugin_1 = require("../plugin/colorsPlugin");
const assert_1 = require("./assert");
const lazy_1 = require("./lazy");
const logger_types_1 = require("./logger.types");
const EmptyLogOption = { test: {}, develop: {} };
/**
 * @property traceAt - 由現在的位置({@link message})向前 traceAt 多少行, 因實作因素預設3
 * @property stackNumber - 由現在的 Stack 向前保留多少個 stack，預設5
 */
const defaultLogOption = { traceAt: 3, stackNumber: 5 };
/** 預設 logger color */
const defaultColorCaster = {
    [logger_types_1.ELevel.trace]: (msg) => msg.grey,
    [logger_types_1.ELevel.debug]: function (msg) {
        return msg.white;
    },
    [logger_types_1.ELevel.info]: function (msg) {
        return msg.blue;
    },
    [logger_types_1.ELevel.warn]: function (msg) {
        return msg.yellow;
    },
    [logger_types_1.ELevel.current]: function (msg) {
        return msg.cyan;
    },
    [logger_types_1.ELevel.error]: function (msg) {
        return msg.red;
    },
    [logger_types_1.ELevel.fatal]: function (msg) {
        return msg.bgBrightRed;
    },
};
function message(moduleName, level, msg, traceAt = 2, stackNumber = 5) {
    const allStacks = new Error().stack.split("\n");
    const maxStackRecs = allStacks.length;
    const lBound = Math.min(traceAt + 1, maxStackRecs);
    const stacksOnDisplay = allStacks.splice(lBound, Math.min(stackNumber, maxStackRecs));
    const message = msg;
    const rBound = lBound + stacksOnDisplay.length;
    const renderedModuleName = defaultColorCaster[level](`[${moduleName}]`);
    console.log(renderedModuleName, ...msg, "\n" + stacksOnDisplay.join("\n"));
    return {
        stacksOnDisplay,
        allStacks,
        lBound,
        rBound,
        moduleName,
        message,
    };
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
class Logger {
    constructor(option) {
        if (!option) {
            return;
        }
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
        Logger.getEnv = envGetter;
    }
    static isDisallowed(option, level) {
        return !this.isAllowed(option, level);
    }
    /** 判斷 model 於當前 env 中，該 level 是否被允許
     * 如果是 dev mode (develop/test) 狀態下，預許不顯示 info 以下的 log
     */
    static isAllowed(option, level) {
        var _a, _b;
        if (!option)
            return false;
        level !== null && level !== void 0 ? level : (level = logger_types_1.ELevel.trace);
        if (Logger.getEnv() != "develop" && Logger.getEnv() != "test") {
            if (level <= logger_types_1.ELevel.info) {
                console.info("block allowance, since it's not dev mode");
                return false;
            }
        }
        const module = (_a = this.allowedModules[Logger.getEnv()]) === null || _a === void 0 ? void 0 : _a[option.moduleName];
        if (!module) {
            console.warn(`module: ${option.moduleName} not found, please setLoggerAllowance first! For more info "https://github.com/gordianknotC/frontend_common#%E8%A2%91%E5%A7%8B%E5%8C%96"`);
            return false;
        }
        const allowed = !((_b = module.disallowedHandler(module.logLevelHandler(level))) !== null && _b !== void 0 ? _b : true);
        return allowed;
    }
    static toAllowedLogger(modules) {
        const result = {};
        modules.forEach((module) => {
            var _a;
            (_a = module.logLevelHandler) !== null && _a !== void 0 ? _a : (module.logLevelHandler = (level) => level);
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
    static setLevelColors(option) {
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
    static setLoggerAllowance(modules) {
        var _a;
        (0, assert_1.assert)(() => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "IgnoreEnv", "Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together");
        const allowedLogger = this.toAllowedLogger(modules);
        (_a = LOGGER_MODE.value) !== null && _a !== void 0 ? _a : (LOGGER_MODE.value = "IgnoreEnv");
        Logger.allowedModules = { ...EmptyLogOption };
        Object.entries(allowedLogger).forEach((pair) => {
            const [k, v] = pair;
            Logger.addModule(v);
        });
        return allowedLogger;
    }
    /**
     * 依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 {@link setCurrentEnv} 後呼叫
     */
    static setLoggerAllowanceByEnv(option) {
        var _a;
        (0, assert_1.assert)(() => LOGGER_MODE.value == undefined || LOGGER_MODE.value == "ByEnv", "AssertionError: Do not mix use of setLoggerAllowance and setLoggerAllowanceByEnv together");
        (_a = LOGGER_MODE.value) !== null && _a !== void 0 ? _a : (LOGGER_MODE.value = "ByEnv");
        const newOption = {};
        Object.entries(option).forEach((pair) => {
            const [env, v] = pair;
            newOption[env] = this.toAllowedLogger(v);
        });
        Logger.allowedModules = Object.assign({ ...EmptyLogOption }, newOption);
        return (0, lazy_1.LazyHolder)(() => { var _a; return (_a = this.allowedModules[Logger.getEnv()]) !== null && _a !== void 0 ? _a : {}; });
    }
    static hasModule(option) {
        return this.allowedModules[Logger.getEnv()][option.moduleName] != undefined;
    }
    static clearModules() {
        this.allowedModules = { ...EmptyLogOption };
        LOGGER_MODE = (0, lazy_1.final)();
    }
    static addModule(allowance) {
        Logger.allowedModules[Logger.getEnv()][allowance.moduleName] = allowance;
    }
    _messenger(msg, level, option) {
        var _a, _b;
        if (Logger.isAllowed(this._allowance, level)) {
            (0, assert_1.assert)(() => this._allowance != undefined);
            this._prevLog = message(this._allowance.moduleName, level, msg, (_a = option === null || option === void 0 ? void 0 : option.traceAt) !== null && _a !== void 0 ? _a : defaultLogOption.traceAt, (_b = option === null || option === void 0 ? void 0 : option.stackNumber) !== null && _b !== void 0 ? _b : defaultLogOption.stackNumber);
        }
    }
    /**
     * @param option.traceAt - {@link LogOption} {@link defaultLogOption}
     * @param option.stackNumber - {@link LogOption} {@link defaultLogOption}
     */
    log(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.trace, option);
    }
    /** {@inheritdoc log} */
    trace(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.trace, option);
    }
    /** {@inheritdoc log} */
    debug(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.debug, option);
    }
    /** {@inheritdoc log} */
    info(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.info, option);
    }
    /** {@inheritdoc log} */
    warn(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.warn, option);
    }
    /** {@inheritdoc log} */
    current(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.current, option);
    }
    /** {@inheritdoc log} */
    error(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.error, option);
    }
    /** {@inheritdoc log} */
    fatal(msg, option) {
        this._messenger(msg, logger_types_1.ELevel.fatal, option);
    }
}
exports.Logger = Logger;
Logger.allowedModules = {
    test: {}, develop: {}
};
Logger.getEnv = () => extension_setup_1._currentEnv.value;
//# sourceMappingURL=logger.js.map