/** 用 Proxy 來實作 lazyLoading */
export function LazyHolder(initializer) {
    let instance;
    return new Proxy({}, {
        get: function (target, name) {
            instance !== null && instance !== void 0 ? instance : (instance = initializer());
            //@ts-ignore
            return instance[name];
        }
    });
}
export class CallableDelegate extends Function {
    constructor(delegate) {
        super();
        this.delegate = delegate;
        return new Proxy(this, {
            apply: (target, thisArg, args) => this.delegate(...args)
        });
    }
}
//# sourceMappingURL=lazy.js.map