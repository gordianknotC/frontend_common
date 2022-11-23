

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
export function LazyHolder<T extends object>(initializer: () => T): T {
  let instance: T;
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      instance ??= initializer();
      //@ts-ignore
      return instance[name];
    }
  }) as T;
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
export class CallableDelegate<CALLABLE extends Function> extends Function {
  constructor(
    public delegate: CALLABLE
  ) {
    super()    
    return new Proxy(this, {
      apply: (target, thisArg, args) => this.delegate(...args)
    })
  }
}