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