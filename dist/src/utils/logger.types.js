"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMethods = exports.ELevel = void 0;
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
class LoggerMethods {
}
exports.LoggerMethods = LoggerMethods;
class LoggerStatic {
}
//# sourceMappingURL=logger.types.js.map