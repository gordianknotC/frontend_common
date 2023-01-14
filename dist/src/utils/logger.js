"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.ELevel = void 0;
function message(msg, traceAt = 2, stackNumber = 5) {
    const lines = new Error().stack.split("\n");
    const maxLines = lines.length;
    const stacks = lines.splice(Math.min(traceAt + 1, maxLines), stackNumber);
    console.log("lines:", maxLines, traceAt + 1, traceAt + 1 + stackNumber, Math.min(traceAt + 1, maxLines), Math.min(traceAt + 1 + stackNumber, maxLines), stacks.length);
    console.log(...msg, "\n" + stacks.join('\n'));
}
var ELevel;
(function (ELevel) {
    ELevel[ELevel["info"] = 0] = "info";
    ELevel[ELevel["log"] = 1] = "log";
    ELevel[ELevel["warn"] = 2] = "warn";
    ELevel[ELevel["current"] = 3] = "current";
    ELevel[ELevel["error"] = 4] = "error";
})(ELevel = exports.ELevel || (exports.ELevel = {}));
// fixme:
// untested:
class Logger {
    constructor(moduleName) {
        this.moduleName = moduleName;
        Logger.addModule(moduleName);
    }
    static addModule(name) {
        Logger.allowedModules.add(name);
    }
    static setModules(modules) {
        Logger.allowedModules.clear();
        modules.forEach((name) => {
            Logger.allowedModules.add(name);
        });
    }
    log(msg, traceAt = 2, stackNumber = 5) {
        if (Logger.allowedModules.has(this.moduleName))
            message(msg, traceAt, stackNumber);
    }
}
exports.Logger = Logger;
Logger.allowedModules = new Set();
//# sourceMappingURL=logger.js.map