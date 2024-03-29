

---
<!--#-->

以 proxy實作 lazy loading for objects, 及 lazy loading for functions，用於許多需要相依分離或需要考慮啓動時序問題的情境，其核心類似 Provider/Injector design pattern 及 Delegate design pattern，分為物件LazyHolder 及 Callable Delegate
- Object lazy holder
- Callable Delegate  

## lazyHolder - lazy loading for objects

__實作__
```ts
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
```

### Example: 以Locale 為例
以下為例，引用 i18n 時，不用考慮到 createI18n 是否已經初始化，可以在 createI18n 初始化前就引用 i18n, 而不會產生相依問題。

**locale.ts**
```ts
//locale.ts
const Eng = {
    welcome: "welcome",
}
let _i18n;
// lazy loading
const i18n = lazyHolder<Locale<typeof Eng>>(()=>{
    return _i18n ??= createI18n();
});

// 當物件取用後(存取相關屬性，以下例而言是 property t)，才初始化
i18n.t("welcome");
```

**app_store.ts**
```ts
//app_store.ts
class AppStore{
    constructor(private i18n);
    get currentLanguage(): string{
        return this.i18n.locale.value;
    }
}
const appStore = new AppStore(i18n);
```


## CallableDelegate - lazy loading for functions
__實作__
```ts
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
```
### 以注入 vue watch method 為例
```ts
// 這裡只宣告 watchMethod 的介面，及空的 instance，內容還沒有注入
// 因此會報錯 "watch method used before initialized"
let watchMethod=new CallableDelegate(()=>{
    throw new Error("watch method used before setup");
});
// 可以在程式中任意引用 watch 變數，即便 watchMethod 還沒初始化 
export const watch = watchMethod;

// 提供方法 初始化 watchMethod
function setupWatch(watchConstructor: any){
    watchMethod.delegate = watchConstructor;
}
```

