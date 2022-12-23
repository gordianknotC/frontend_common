export declare class UncaughtEnumType extends Error {
    constructor(val: any, _enum: any);
}
export declare class UnCaughtCondition extends Error {
    constructor(msg?: string);
}
export declare class TypeMismatchError extends Error {
    constructor(provided: any, expected: string);
}
export declare class NotImplementedError extends Error {
    constructor(msg?: string);
}
export declare class InvalidUsageError extends Error {
    constructor(msg: string);
}
export declare class UnExpectedError extends Error {
    constructor(msg: string);
}
