

/** 用 Proxy 來實作 lazyLoading */
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