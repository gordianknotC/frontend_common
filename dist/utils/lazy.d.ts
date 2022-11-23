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
 *
 * ```
 */
export declare function LazyHolder<T extends object>(initializer: () => T): T;
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
export declare class CallableDelegate<CALLABLE extends Function> extends Function {
    delegate: CALLABLE;
    constructor(delegate: CALLABLE);
}
