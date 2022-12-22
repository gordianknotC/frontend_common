"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnExpectedRole = exports.InvalidUsage = exports.NotImplementedError = exports.TypeMismatchError = exports.UnCaughtCondition = exports.UncaughtEnumType = void 0;
class UncaughtEnumType extends Error {
    constructor(val, _enum) {
        super(`UncaughtEnumType ${val}, expect one of ${Object.keys(_enum)}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.UncaughtEnumType = UncaughtEnumType;
class UnCaughtCondition extends Error {
    constructor() {
        super("UnCaughtCondition");
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
    constructor() {
        super("NotImplementedError");
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.NotImplementedError = NotImplementedError;
class InvalidUsage extends Error {
    constructor() {
        super("InvalidUsage");
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.InvalidUsage = InvalidUsage;
class UnExpectedRole extends Error {
    constructor() {
        super("UnExpectedRole");
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.UnExpectedRole = UnExpectedRole;
//# sourceMappingURL=baseExceptions.js.map