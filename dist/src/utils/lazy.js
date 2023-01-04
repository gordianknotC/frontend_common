"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallableDelegate = exports.LazyHolder = void 0;
/**
 * 用 Proxy 實作 lazyLoading
 * @param initializer
 * @returns
 * @example
 * ```ts
 * let dep = {value: undefined}
 * const lazy = LazyHolder(()=>dep);
 * const holder = {
 *    lazy
 * };
 *
 * function initialize(){
 *   dep = {value: 1};
 * }
 *
 * console.log(lazy.value) // undefined
 * initialize();
 * console.log(lazy.value) // 1;
 * ```
 */
function LazyHolder(initializer) {
    let instance;
    return new Proxy({}, {
        get: function (target, name) {
            instance !== null && instance !== void 0 ? instance : (instance = initializer());
            //@ts-ignore
            return instance[name];
        }
    });
}
exports.LazyHolder = LazyHolder;
/**
 * design pattern for Callable Object
 *
 * @example
 * ```ts
 * const a = new CallableDelegate(()=>console.log("called"));
 * a(); // called
 * a.delegate = ()=> console.log("called 2");
 * a(); // called 2
 * ```
 *
 */
class CallableDelegate extends Function {
    constructor(delegate) {
        super();
        this.delegate = delegate;
        return new Proxy(this, {
            apply: (target, thisArg, args) => this.delegate(...args)
        });
    }
}
exports.CallableDelegate = CallableDelegate;
//# sourceMappingURL=lazy.js.map