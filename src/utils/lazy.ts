
export function LazyHolder<T extends object>(initializer: ()=>T): T {
  let instance: T;
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      instance ??= initializer();
      //@ts-ignore
      return instance[name];
    }
  }) as T;
}
