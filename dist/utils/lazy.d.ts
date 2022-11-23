/** 用 Proxy 來實作 lazyLoading */
export declare function LazyHolder<T extends object>(initializer: () => T): T;
export declare class CallableDelegate<CALLABLE extends Function> extends Function {
    delegate: CALLABLE;
    constructor(delegate: CALLABLE);
}
