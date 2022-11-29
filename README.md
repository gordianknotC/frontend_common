
# Facade:

# Provider Pattern  
1) 提供 Dependency Provider design pattern，將 dependency以 ident 作為 key 植入 container
2) 提供 Facade Provider design pattern，將 dependency 以 FACADE_KEY 作為 key 植入 container, 為App開發時提供一個入口，以存取所需的一切資料. 
3) 
## Facade Provider (對應Facade Injector)
```ts
type ProviderParams<T> = {
    deps: Partial<T>, 
    merge?: boolean, 
    ident?: string | symbol
};
/**
 *  @params deps dependency 物件值鍵對
 *  @params merge 是否對 provider 所提併的值鍵對進與 container 進行合併 
 *  @params ident 用以識別 container 取值所需要的 key
 *  */
function function provideFacade<T>(option: ProviderParams<T>)
```

### 不合併 provide 物件 
```ts
const merge = false;
provideFacade({
    deps: {
        source: {
            a: 1
        }
    }, 
    merge
});
// 覆寫
provideFacade({
    deps: {
        source: {
            b: 2
        }
    }, 
    merge
});
const facade = injectFacade();
assert(facade.source.a == undefined);
assert(facade.source.b == 2);
```
### 合併 provide 物件

```ts
const merge = true;
provideFacade({
    deps:{
        source: {
            a: 1
        }
    }, 
    merge
});

provideFacade({
    deps: {
        source: {b: 2},
        appended: {a: 1}
    },
    merge
}
const facade = injectFacade();
assert(facade.source.a == 1);
assert(facade.source.b == 2);
assert(facade.appended.a == 1);
```

## Dependency Provider(對應 dependency injector)
```ts
type ProviderParams<T> = {
    deps: Partial<T>, 
    merge?: boolean, 
    ident?: string | symbol
};
/**
 *  @params ident 用以識別 container 取值所需要的 key
 *  */
function provideDependency<T>(option: ProviderParams<T>)
```
### 不指定 Ident
```ts
const merge = true;
provideDependency({deps: {a: 1, source: {a: 2}}, merge});
provideDependency({deps: {b: 3, source: {b: 4}}, merge});
const a = injectDependency("a");
const aOfSource = injectDependency("source.a");
const b = injectDependency("b");
const bOfSource = injectDependency("source.b");
assert(a == 1);
assert(b == 3);
assert(aOfSource == 2);
assert(bOfSource == 4);
```
### 指定 Ident
```ts
provideDependency({deps: {a: 1, source: {a: 2}}, ident: "a"});
provideDependency({deps: {b: 3, source: {b: 4}}, ident: "b"});
const a = injectDependency("a", "a");
const aOfSource = injectDependency("source.a", "a");
const b = injectDependency("b", "a");
const bOfSource = injectDependency("source.b", "a");
assert(a == 1);
assert(b == undefined);
assert(aOfSource == 2);
assert(bOfSource == undefined);

```

# Injector Pattern
### InjectDependency
```ts
/**
 * Dependency Injector
 * @see {@link injectDependency} 
 * @param ident  
 * @param pathOrName
 */
function injectDependency<T>(pathOrName: string, ident=DEP_KEY): T；

```
### InjectFacade
```ts
/**
 * Dependency Injector
 * 注入 IFacade interface, 對應 provideFacade
  * @see {@link provideDependency}
 * @param ident  
 */
export function injectFacade<T>(ident=FACADE_KEY): T
```



# 實際 App 上的使用
> 以 Domain Driven Design 為架構的 App 為例

**main.ts**
```ts
/**
 * Facade
 * 提供 APP 入口界面，實際上的相依則以 provideFacade 以注入的方式
 * 注入 container 中，其運作方式 同 DI pattern
 * 
 * AppFacade 用來定義 Facade 的型別，以供 typescript 辨示 
 * */
export type AppFacade = 
  FacadeMappers &
  FacadeDateSource &
  FacadeRepository &
  FacadePresentationStore &
  FacadeDomainService;

/**
 * facade 用來存取 Domain Driven Design 架構中的 data source / domain / presentation，這裡只定義型別，進行界面分離， IFacade 內部會以 lazyloading 的方式宣告，直到 facade 第一次實際被使用時，才會進行存取。
 */
export const facade = IFacade<AppFacade>();

const executeAndLog = (msg: string, cb: ()=>void)=>{
  console.group("", `----------${msg}---------`);
  cb();
  console.groupEnd();
}

/**
 *  設定 App 所需要的相依注入
 * */
(function setupDependencies() {
  "use strict";
  console.group("===============JinHao INFO================")
  executeAndLog("APP_PLUGIN", ()=>setupAppPlugins(app, facade));
  // ---------------
  // data source 注入
  executeAndLog("DATE_SERVICES", ()=>setupDataCoreServices(app, facade));
  executeAndLog("MAPPERS", ()=>setupMappers(app, facade));
  executeAndLog("REPOS", ()=>setupRepositories(app, facade));
  // -----------
  // domain 注入
  executeAndLog("DOMAIN_SERVICES", ()=>setupDomainServices(app, facade));
  // ----------------
  // presentation 注入
  executeAndLog("VIEW_STORES", ()=>setupPresentationStores(app, facade, true));
  app.mount("#app");
  executeAndLog("VIEW_STORES", ()=>setupPresentationStores(app, facade, false));
  console.groupEnd();
})();

```

**mappers/index**
```ts
export type FacadeMappers = {
  data: {
    mappers: {
      user: BaseModelMapper<UserEntity, UserDomainModel>;
      announcement: BaseModelMapper<AnnouncementEntity, AnnouncementDomainModel>;
    };
  };
};

export function setupMappers(app: App<Element>, facade: AppFacade) {
  const mergeObject = true;
  provideFacade(
    {
      data: {
        mappers: {
          user: userMapper(),
          announcement: annMapper()
        }
      }
    },
    mergeObject
  );
}
```

**repositories/index**
```ts
export type FacadeRepository = {
  data: {
    repo: {
      user: TUserRepository,
      announcement: TAnnouncementRepository,
      reset: ()=>void
    };
  };
};

// todo: index repositories 統一注入
export function setupRepositories(app: App<Element>, facade: AppFacade) {
  const mergeObject = true;
  const client = facade.data.remoteClient;

  /** repository 設定，注入 */
  const userMapper = facade.data.mappers.user;
  const user = new UserRepositoryImpl(client, userMapper);

  const announcementMapper = facade.data.mappers.announcement;
  const announcement = new AnnouncementRepositoryImpl(client, announcementMapper);
  
  provideFacade({
      data: {
        repo: {
          user,
          announcement,
          reset: ()=>{
            appLocalStorageMgr().clear();
          }
        }
      }
    },
    mergeObject
  );
}
```

**vue或其他地方使用時**
```ts
facade.data.remoteClient....
facade.data.repo...
facade....
```

# Lazy Loading:

## lazyHolder - lazy loading for objects except function
### description
以 proxy實作 物件 lazy loading
```ts
function LazyHolder<T extends object>(initializer: () => T): T 
```

### 以Locale 為例
以下為例，引用 i18n 時，不用考慮到 createI18n 是否已經初始化，可以在 createI18n 初始化前就引用 i18n, 而不會產生相依問題。

**locale.ts**
```ts
const Eng = {
    welcome: "welcome",
}
let _i18n;
// lazy loading
const i18n = lazyHolder<Locale<typeof Eng>>(()=>{
    return _i18n ??= createI18n();
});

// 當物件取用後(存取相關屬性，以下例而言是 property t)，才袑始化
i18n.t("welcome");
```

**app_store.ts**
```ts
class AppStore{
    constructor(private i18n);
    get currentLanguage(): string{
        return this.i18n.locale.value;
    }
}
const appStore = new AppStore(i18n);
```


## CallableDelegate - lazy loading for functions
```ts
export class CallableDelegate<CALLABLE extends Function> extends Function {
  constructor(
    public delegate: CALLABLE
  );
}
```
### 以實作 vue watch method 為例
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

