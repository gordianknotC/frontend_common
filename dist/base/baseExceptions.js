"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnExpectedError = exports.InvalidUsageError = exports.NotImplementedError = exports.TypeMismatchError = exports.UnCaughtCondition = exports.UncaughtEnumType = void 0;
class UncaughtEnumType extends Error {
    constructor(val, _enum) {
        super(`UncaughtEnumType ${val}, expect one of ${Object.keys(_enum)}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.UncaughtEnumType = UncaughtEnumType;
class UnCaughtCondition extends Error {
    constructor(msg) {
        super(`UnCaughtCondition ${msg ? ":" + String(msg) : ""}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.UnCaughtCondition = UnCaughtCondition;
class TypeMismatchError extends Error {
    constructor(provided, expected) {
        super(`type error: expected: ${expected}, provided: ${provided}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.TypeMismatchError = TypeMismatchError;
class NotImplementedError extends Error {
    constructor(msg) {
        super(`NotImplementedError ${msg ? ":" + String(msg) : ""}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.NotImplementedError = NotImplementedError;
class InvalidUsageError extends Error {
    constructor(msg) {
        super(`InvalidUsageError: ${msg}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.InvalidUsageError = InvalidUsageError;
class UnExpectedError extends Error {
    constructor(msg) {
        super(`UnExpectedError ${msg ? ":" + String(msg) : ""}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.UnExpectedError = UnExpectedError;
//# sourceMappingURL=baseExceptions.js.map