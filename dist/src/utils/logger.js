function message(msg, traceBack = 2, stackNumber = 5) {
    const lines = new Error().stack.split("\n");
    const maxLines = lines.length;
    const stacks = lines.splice(Math.min(traceBack + 1, maxLines), stackNumber);
    console.log("lines:", maxLines, traceBack + 1, traceBack + 1 + stackNumber, Math.min(traceBack + 1, maxLines), Math.min(traceBack + 1 + stackNumber, maxLines), stacks.length);
    console.log(...msg, "\n" + stacks.join('\n'));
}
export var ELevel;
(function (ELevel) {
    ELevel[ELevel["info"] = 0] = "info";
    ELevel[ELevel["log"] = 1] = "log";
    ELevel[ELevel["warn"] = 2] = "warn";
    ELevel[ELevel["current"] = 3] = "current";
    ELevel[ELevel["error"] = 4] = "error";
})(ELevel || (ELevel = {}));
export class Logger {
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
    log(msg, traceBack = 2, stackNumber = 5) {
        if (Logger.allowedModules.has(this.moduleName))
            message(msg, traceBack, stackNumber);
    }
}
Logger.allowedModules = new Set();
//# sourceMappingURL=logger.js.map