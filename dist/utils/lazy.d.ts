/** 用 Proxy 來實作 lazyLoading */
export declare function LazyHolder<T extends object>(initializer: () => T): T;
