


# 前端常用工具:

## 安裝
```bash
yarn add @gdknot/frontend_common
```
## documentation
```bash
yarn serve:doc
```
## Feature
- facade
- provider
- injector
- declare lazy loading object
- declare lazy loading function
- promise queue 
- completer (類似 Promise, 只是將 resolve/reject 寫進物件中)
- logger
- a CRUD function for writing pseudo code api

# Table of Content
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
table of content

- [前端常用工具:](#%E5%89%8D%E7%AB%AF%E5%B8%B8%E7%94%A8%E5%B7%A5%E5%85%B7)
  - [安裝](#%E5%AE%89%E8%A3%9D)
  - [documentation](#documentation)
  - [Feature](#feature)
- [Table of Content](#table-of-content)
- [Facade:](#facade)
  - [Provider Pattern](#provider-pattern)
    - [Dependency Provider(對應 dependency injector)](#dependency-provider%E5%B0%8D%E6%87%89-dependency-injector)
    - [Facade Provider (對應Facade Injector)](#facade-provider-%E5%B0%8D%E6%87%89facade-injector)
  - [Injector Pattern](#injector-pattern)
    - [InjectDependency](#injectdependency)
    - [InjectFacade](#injectfacade)
  - [應用於 App 上開發](#%E6%87%89%E7%94%A8%E6%96%BC-app-%E4%B8%8A%E9%96%8B%E7%99%BC)
    - [以 Domain Driven Design 為架構的 App 為例](#%E4%BB%A5-domain-driven-design-%E7%82%BA%E6%9E%B6%E6%A7%8B%E7%9A%84-app-%E7%82%BA%E4%BE%8B)
- [Lazy Loading:](#lazy-loading)
  - [lazyHolder - lazy loading for objects](#lazyholder---lazy-loading-for-objects)
    - [Example: 以Locale 為例](#example-%E4%BB%A5locale-%E7%82%BA%E4%BE%8B)
  - [CallableDelegate - lazy loading for functions](#callabledelegate---lazy-loading-for-functions)
    - [以注入 vue watch method 為例](#%E4%BB%A5%E6%B3%A8%E5%85%A5-vue-watch-method-%E7%82%BA%E4%BE%8B)
- [AsyncQueue:](#asyncqueue)
    - [queue](#queue)
    - [enqueue](#enqueue)
    - [dequeue](#dequeue)
    - [其他方法](#%E5%85%B6%E4%BB%96%E6%96%B9%E6%B3%95)
- [Completer:](#completer)
    - [特性](#%E7%89%B9%E6%80%A7)
- [Logger:](#logger)
    - [Feature](#feature-1)
    - [袑始化](#%E8%A2%91%E5%A7%8B%E5%8C%96)
    - [設置色彩](#%E8%A8%AD%E7%BD%AE%E8%89%B2%E5%BD%A9)
    - [設置允許的 Logger](#%E8%A8%AD%E7%BD%AE%E5%85%81%E8%A8%B1%E7%9A%84-logger)
- [Writing pseudo code for api - 測試API工具:](#writing-pseudo-code-for-api---%E6%B8%AC%E8%A9%A6api%E5%B7%A5%E5%85%B7)
  - [CRUD](#crud)
    - [Example](#example)
- [注入 ui framework reactive 方法:](#%E6%B3%A8%E5%85%A5-ui-framework-reactive-%E6%96%B9%E6%B3%95)
  - [Inject Reactive Method](#inject-reactive-method)
    - [Vue 為例](#vue-%E7%82%BA%E4%BE%8B)
    - [React 為例](#react-%E7%82%BA%E4%BE%8B)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[s-provideDependency]: src/vueMixins/common.ts
[s-provideFacade]: src/vueMixins/common.ts
[s-queue]: src/utils/queue.ts
[s-completer]: src/utils/completer.ts
[s-logger]: src/utils/logger.ts
[s-logger.types]: src/utils/logger.types.ts
[s-test-queue]: __tests__/queue.test.ts
[s-test-completer]: __tests__/completer.test.ts
[s-test-logger]: __tests__/logger.test.ts

---
# Facade:
籍用 [Facade design pattern](https://refactoring.guru/design-patterns/facade) 的概念，為App / Framework提供一個入口界面，這個入口界面依循相依分離原則，進一部使界面分離成為可能，其內部基本 design pattern 為一個 provider/injector design pattern 及為 facade 專門化的 provider/injector design pattern

__example__ 
```ts
//宣告 facade 界面
export type AppFacade = 
  FacadeMappers &
  FacadeDateSource &
  FacadeRepository &
  FacadePresentationStore &
  FacadeDomainService;

export const facade = IFacade<AppFacade>();

// inject facade 內容
provideFacade({
    deps: {
      ...mappers,
      ...dataSource,
      ...rep,
      ...presentation,
      ...services
    }, 
});
```


二種 pattern 區分如下：

1) 提供 [Dependency Provider](#dependency-provider%E5%B0%8D%E6%87%89-dependency-injector) design pattern，將 dependency以 ident 作為 key 植入 container
2) 提供 [Facade Provider](#facade-provider-%E5%B0%8D%E6%87%89facade-injector) design pattern，將 dependency 以 FACADE_KEY 作為 key 植入 container, 為App開發時提供一個入口，以存取所需的一切資料. 
  

## Provider Pattern
### Dependency Provider(對應 dependency injector)
#### provideDependency
[source][s-provideDependency] | 型別定義
```ts
type ProviderParams<T> = {
    deps: Partial<T>, 
    merge?: boolean, 
    ident?: string | symbol
};

/**
*  Dependency Provider
 * provide 方法，將 dependency 以 ident 作為 key 植入 container
 * @param option - {@link ProviderParams}
 * @see also {@link provideFacade}
 * */
function provideDependency<T>(option: ProviderParams<T>)
```
#### 不指定 Ident
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
#### 指定 Ident
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

#### without enabling merge
```ts
test("Simple test without enabling merge", ()=>{
  provideDependency({
    deps: {
      Elton: "Elton",
      John: "John",
      users: {
        EltonJohn: "EltonJohn"
      }
    }
  });
  const Elton = injectDependency("Elton");
  const John = injectDependency("John");
  const EltonJohn = injectDependency("users.EltonJohn");
  expect(Elton).toBe("Elton");
  expect(John).toBe("John");
  expect(EltonJohn).toBe("EltonJohn");
});
```

#### with enabling merge
```ts
provideDependency({
  deps: {
    Elton: "Elton",
    John: "John",
    users: {
      EltonJohn: "EltonJohn"
    }
  }
});

provideDependency({
  deps: {
    Curtis: "Curtis"
  },
  merge: true
});
const Elton = injectDependency("Elton");
const John = injectDependency("John");
const EltonJohn = injectDependency("users.EltonJohn");
const Curtis = injectDependency("Curtis");
expect(Elton).toBe("Elton");
expect(John).toBe("John");
expect(EltonJohn).toBe("EltonJohn");
expect(Curtis).toBe("Curtis");
```


### Facade Provider (對應Facade Injector)
[source][s-provideFacade] | 型別定義

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

#### 不合併 provide 物件 
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
#### 合併 provide 物件

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


## Injector Pattern
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



## 應用於 App 上開發
### 以 Domain Driven Design 為架構的 App 為例

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






---
# Lazy Loading:

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




---
# AsyncQueue:
Promise 實作駐列處理, 由以下成員組成
－ queue
用來代表每個等待處理或處理中的Promise請求，由 Array<[Completer](#Completer)<QueueItem>> 物件陣列 存放所有 Promise 駐列每個駐列成員為一個 [Completer](#Completer)<QueueItem>, [Completer](#Completer) 本身類似 Promise 物件，只是將 resolve / reject 方法直接存在 [Completer](#Completer) 物件裡, 只要使用者持有 Completer 物件，就能自行由外部呼叫 resolve 方法，不用侷限於 new Promise 的結構

- enqueue
- dequeue
- dequeueByResult
- clearQueue
- remove

__型別__ | [source][s-queue]
```ts
export type QueueItem<M=any> = {
  id: number|string;
  meta?: M;
  promise: () => Promise<any>;
  timestamp: number;
  timeout: NodeJS.Timeout;
};

export abstract class IAsyncQueue {
  abstract queue: ArrayDelegate<Completer<QueueItem>>;
  abstract get isEmpty(): boolean;
  abstract enqueue(
    id: number|string,
    promise: () => Promise<any>,
    timeout?: number
  ): Promise<any>;
  abstract dequeue(option: {id: number|string, removeQueue: boolean}): Promise<any>;
  abstract dequeueByResult(option: {id: number|string, result: any}): Promise<any>;
  abstract clearQueue(): void;
}
```
### queue
> queue 為 [Completer](#Completer)<QueueItem> 物件陣列, QueueItem 有以下屬性
```ts
export type QueueItem<M=any> = {
  /** id: QueueItem identifier */
  id: number|string;
  /** meta: 用以儲存額外資訊，如 request config / request header */
  meta?: M;
  /** promise: 用來取得QueueItem所承載的非同步資料 */
  promise: () => Promise<any>;
  /** timestamp: 用來計算 timeout */
  timestamp: number;
  /** timeout: timeout id */
  timeout: NodeJS.Timeout;
};
```

> completer 本身類似 Promise 物件, 只是多了以下屬性
[source][s-completer]
```ts
abstract class _Completer<T> {
  /** 用來暫時代表 future 值的物件，也可作為 Completer 本身的註解 */
  abstract _meta?: T
  /** 即 Promise 物件本身, 其 resolve / reject 方法分別為
   * {@link complete} / {@link reject} */
  abstract future: Promise<T>;
  /** 同 Promise.resolve, resolve {@link future} 本身*/
  abstract complete(value: T | PromiseLike<T>) : void;
  /** 同 Promise.reject, reject {@link future} 本身 */
  abstract reject(reason?: any): void;
}
```

當我們以 [Completer](#Completer) 存放 QueueItem 物件時便能於外部 resolve Promise,  而不用受限於 Promise 結構只能於自身建溝子進行 resolve，[Completer](#Completer)本身則作為一個容器，存放 Promise 物件及相應 reject/resolve 方法，以便於外部調用. 

### enqueue
> 將 Promise 請求包入 QueueItem 並推到 Queue 裡，並有以下二種選擇 (視 @param dequeueImmediately)
> -  同時執行 promise 非同部請求 via [dequeue](#dequeue) ，直到非同部請求 promise resolve 後， 使用者再次 [dequeue](#dequeue) 移除該列隊
> - 不立即執行 promise 非同部請求 [dequeue](#dequeue) ，直到使用者自行 [dequeue](#dequeue) 後，移除該列隊
  
__型別__:
```ts
/**
 * @param id - 請求 ID
 * @param promise - 處理非同部請求邏輯，待請求完成後，queue 生命周期完成移除
 * @param timeout - default 10 * 1000
 * @param meta - 使用者自定義註解
 * @param dequeueImmediately - enqueue 後馬上 dequeue，即執上 promise 直到 promise resolve 後
 */
  public enqueue(
    id: number|string,
    promise: () => Promise<any>,
    timeout: number = 10000,
    meta: any = {},
    dequeueImmediately: boolean = true,
  ): Promise<any>
```

__example__ | [source][s-test-queue]:
> 立即執行 promise 非同部請求
```ts
jest.spyOn(q, "dequeue");
q.enqueue(idC, async ()=>{
  return new Promise(async resolve =>{
    console.log("promise called")
    await wait(span);
    resolve({idC});
  });
});
expect(q.queue.length).toBe(1);
expect(q.dequeue).toBeCalledTimes(1); // promise called

await q.dequeue({id: idC, removeQueue});
expect(q.queue.length).toBe(0);
```
__example__
> 不立即執行 promise 非同部請求，直到使用者自行 {@link dequeue}
```ts
const removeQueue = false;
jest.spyOn(q, "dequeue");
q.enqueue(idC, async ()=>{
  return new Promise(async resolve =>{
    await wait(span);
    resolve({idC});
  });
}, removeQueue);
expect(q.queue.length).toBe(1);
expect(q.dequeue).toBeCalledTimes(0);

await q.dequeue({id: idC, removeQueue});
expect(q.queue.length).toBe(0);
expect(q.dequeue).toBeCalledTimes(1);
```


### dequeue
> 依所提供的 id 查找相應的 QueueItem，執行 QueueItem 裡的 Promise 請求並依
  option.removeQueue 決定是否移除 QueueItem, 預設 option.removeQueue 為 true

__型別__:
```ts
/**
 * @param option.id - 取得queue的id
 * @param option.removeQueue - 預設 true
 */
public async dequeue(option: {id: number, removeQueue?: boolean}): Promise<any>
```

__example__ | [source][s-test-queue]:
```ts
test("expect raise exception while it's queuing", async () => {
  let rA, rB, rC, rD;
  let [wA, wB, wC, wD] = [100, 200, 600, 800];
  const t = time();
  const removeQueue = true;
  const meta = {};

  jest.spyOn(q, "dequeue");
  q.enqueue(idA, async () => {
    return new Promise(async (resolve) => {
      await wait(wA);
      rA = { idA };
      resolve({ idA });
      console.log("resolve A");
    });
  });
  expect(q.queue.length).toBe(1);
  expect(q.dequeue).toBeCalledTimes(1);

  expect(
    q.enqueue(idB, async () => {
      return new Promise(async (resolve, reject) => {
        await wait(wB);
        reject("reject...");
        console.log("resolve B");
      });
    })
  ).rejects.toEqual("reject...");
  expect(q.queue.length).toBe(2);
  expect(q.dequeue).toBeCalledTimes(2);

  q.enqueue(idC, async () => {
    return new Promise(async (resolve) => {
      await wait(wC);
      rC = { idC };
      resolve({ idC });
      console.log("resolve C");
    });
  });
  expect(q.queue.length).toBe(3);
  expect(q.dequeue).toBeCalledTimes(3);

  await wait(wA + wB + wC + 30);
  // 雖然 dequeue, 但內部不移除，直到使用者 dequeue
  expect(q.queue.length).toBe(3);

  const resultA = await q.dequeue({ id: idA });
  expect(resultA).toEqual({ idA });
  expect(q.queue.length).toBe(2);

  const resultC = await q.dequeue({ id: idC });
  expect(resultC).toEqual({ idC });
  expect(q.queue.length).toBe(1);

  const resultB = await q.dequeue({ id: idB });
  expect(q.queue.length).toBe(0);
});
```


### 其他方法

#### dequeueByResult
> 別於 [dequeue](#dequeue) 執行 [enqueue](#enqueue) 傳入的 promise 方法，待 promise 請求 resolve 後移除 {@link QueueItem}, [dequeueByResult](#dequeueByResult) 則是不管 [enqueue](#enqueue) 所傳入的 promise 結果，直接取代其 result

__型別__:
```ts
  /**
   * @param option.id - 取得queue的id
   * @param option.removeQueue - 預設 true
   */
  public async dequeueByResult(option: {id: number, result: any}): Promise<any>
```

__example__ | [source][s-test-queue]:
```ts
const pendingId = "idA";
const pending = q.enqueue(pendingId, async ()=>{
  // 這裡 promise 不回傳結果，直接等待十秒後 timeout
  return waitForTimeOut(10 * 1000);
});
// 覆寫內容於是能將值返回, pending 狀態於是 resolved 
q.dequeueByResult({id: pendingId, result: {succeed: true}});
expect(pending).resolves.toEquals({succeed: true});
```
#### getQueueItem
```ts
  getQueueItem(id:number|string):Completer<QueueItem> | null{
    if (this.queue.length == 0)
      return null;
    return this.queue.firstWhere((_)=>_._meta!.id == id);
  }
```

#### enqueueWithoutId
```ts
/** 與  {@link enqueue} 相同，只是 id 自動生成 */
public enqueueWithoutId(
  promise: () => Promise<any>,
  timeout: number = 10000,
  meta: any = {},
  dequeueImmediately: boolean = true,
)
```

#### clearQueue
```ts
/**清除 {@link queue} */
public clearQueue(): void {
  for (let index = 0; index < this.queue.length; index++) {
    const item = this.queue[index];
    this.remove(item, true);
  }
}
```


---
# Completer:
Completer (借用Dart Completer概念), 將 Promise 物件寫進 Completer.future 中，並將 reject/resolve 方法也寫進 Completer 物件中，只要持有 Completer 物件便能待不確定的未來中執行 reject/resolve 方法以返回 Promise 結果， __使用時機： 希望於其他 scope resolve promise 物件__

### 特性
- 用於存放 Promise 物件
- 直接 expose resolve / reject 方法於 Completer 物件中, 用於外部 resolve/reject
- 提供註解屬性 meta

__型別__ | [source][s-completer]
```ts
abstract class _Completer<T> {
  /** 用來暫時代表 future 值的物件，也可作為 Completer 本身的註解 */
  abstract _meta?: T
  /** 即 Promise 物件本身, 其 resolve / reject 方法分別為
   * {@link complete} / {@link reject} */
  abstract future: Promise<T>;
  /** 同 Promise.resolve, resolve {@link future} 本身*/
  abstract complete(value: T | PromiseLike<T>) : void;
  /** 同 Promise.reject, reject {@link future} 本身 */
  abstract reject(reason?: any): void;
}
```
__example__
以meta 屬性為例
```ts
const completer = new Completer<AxiosRequestConfig>({
  meta: requestConfig
})
```

__example__
```ts
async function example(){
  const completer = new Completer({
    id: 123, 
    timeStamp: (new Date()).getTime(),
  });
  function fetch(){
    return completer.future;
  }
  const future = fetch();

  // 只要有 completer 物件就能夠在未來 resolve future
  completer.complete( axios.get(...) )
  console.log(await future);
}
```

__example__ | [source][s-test-completer]:
```ts
  const completer = new Completer();
  function fetch(): Promise<any>{
    // 這裡，completer.future 永遠不 resolve
    return completer.future;
  }
  const futureResult = fetch();
  await wait(400);
  // 因為永遠不 resolve 所以 futureResult 一直是 pending promise
  expect(typeof (futureResult.then)).toBe("function");
  expect((futureResult as any).value).toBeUndefined();
  // completer.future 被 resolve
  completer.complete({value: ""})
  expect(((await futureResult) as any).value).not.toBeUndefined();
```

__example__
如使用在 jest mocking test 中
```ts
const url = "/path/to/get";
const expectedFetched = {
  data: {username: "hello"}
};
const mockReturns = {
  "error_code": 401,
  "error_key": "Unauthorized",
  "error_name": "Unauthorized",
  "message": "Unauthorized",
};
const payload = {};
const completer = new Completer();
const wait = (helper.authHeaderUpdater!.processFulFill as any as jest.SpyInstance)
  .withImplementation(
    (config: AxiosRequestConfig<any>)=>{
      return config;
    }, async ()=>{
      return completer.future;
    }
  );
await helper.expectGetPassed(url,payload, mockReturns, expectedFetched);

// 在 complete 前, processFulFill 都會一直維持 mocking implementation
completer.complete({});
await wait;
// complete / wait 以後 恢復 implementation 
expect(helper.authGuard!.canProcessReject).toBeCalled();
expect(helper.authGuard!.canProcessFulFill).toBeCalled();
```





---
# Logger:
### Feature
- 針對 trace/debug/info/warn/current/error/fatal 設置不同色彩
  ![logger_image](/Users/knot1981/Documents/IdeasProject/commonJSBuiltin/docs/loggerA.png) 
  ![logger_image](/Users/knot1981/Documents/IdeasProject/commonJSBuiltin/docs/loggerB.png | width=250)
- logger 可設置 traceBack 由第幾個 stack 開始追蹤至第幾個結束
- 根據環境變數設置 overall log level
- 根據各別模組設置 log level

#### __型別__ | [source][s-logger]
```ts
abstract class LoggerMethods {
  abstract log(msg: any[], option?: LogOption): void;
  abstract trace(msg: any[], option?: LogOption): void;
  abstract info(msg: any[], option?: LogOption): void;
  abstract debug(msg: any[], option?: LogOption): void;
  abstract error(msg: any[], option?: LogOption): void;
  abstract fatal(msg: any[], option?: LogOption): void;
  abstract warn(msg: any[], option?: LogOption): void;
  abstract current(msg: any[], option?: LogOption): void;
}
```

#### __靜態方法__
```ts
abstract class LoggerStatic {
  abstract setCurrentEnv(envGetter: ()=>Env): void;
  abstract isDisallowed(option: AllowedModule<any>, level: ELevel): boolean;
  abstract  isAllowed(option?: AllowedModule<any>, level?: ELevel): boolean ;
  abstract toAllowedLogger<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M>;
  abstract setLevelColors(option: Partial<ColorConfig>): void;
  abstract  setLoggerAllowance<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M>;
  abstract setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>): Partial<RawAllowedLogger<M>>;
  abstract hasModule<M>(option: AllowedModule<M>):boolean;
  abstract clearModules(): void;
}
```

### 袑始化
始始化有以下二種方式, 這二種方式不得混用
 * 1) [setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv)
 * 2) [setLoggerAllowance](#setLoggerAllowance)
  
__[setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv)__
```ts
// logger.setup.ts
enum EModules {
  Test = "Test",
  Hobbits = "Hobbits",
}
const testModule = {
  moduleName: EModules.Test,
  disallowedHandler: (level) => false,
};
const newModule = {
  moduleName: EModules.Hobbits,
  disallowedHandler: (level) => false,
}

Logger.setCurrentEnv("develop")
const LogModules = Logger.setLoggerAllowance(LogModules)

// 使用：arbitrary.test.source.ts
const D = new Logger(LogModules.Test)
```

__[setLoggerAllowance](#setLoggerAllowance)__
```ts
  // logger.setup.ts
  enum EModules {
    Test = "Test",
    Hobbits = "Hobbits",
  }
  const testModule = {
    moduleName: EModules.Test,
    disallowedHandler: (level) => false,
  };
  const newModule = {
    moduleName: EModules.Hobbits,
    disallowedHandler: (level) => false,
  }
  Logger.setCurrentEnv("develop")
  const LogModules = Logger.setLoggerAllowanceByEnv({
    test: [],
    develop: [],
    release: [testModule, newModule]
  });

  // 使用：arbitrary.hobbits.source.ts
  const D = new Logger(LogModules.Hobbits)

  // 使用：arbitrary.test.source.ts
  const D = new Logger(LogModules.Test)
```


### 設置色彩 
__型別__ | [source][s-logger]
```ts
// 內部使用 Color 套件
const defaultColorCaster: Record<ELevel, (msg: string) => string> = {
  [ELevel.trace]: (msg) => msg.grey,
  [ELevel.debug]: function (msg: string): string {
    return msg.white;
  },
  [ELevel.info]: function (msg: string): string {
    return msg.blue;
  },
  [ELevel.warn]: function (msg: string): string {
    return msg.yellow;
  },
  [ELevel.current]: function (msg: string): string {
    return msg.cyan;
  },
  [ELevel.error]: function (msg: string): string {
    return msg.red;
  },
  [ELevel.fatal]: function (msg: string): string {
    return msg.bgBrightRed;
  },
};

static setLevelColors(option: Partial<typeof defaultColorCaster>) {
  Object.assign(colorCaster, option);
}
```

__example__
```ts
const option = defaultColorCaster;
Logger.setLevelColors(option);
```

### 設置允許的 Logger
有以下二種方式
- [setLoggerAllowance](#setLoggerAllowance)
  不考慮 env, 設定什麼樣層級的 logger 允許被顯示, 不得與 [setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv) 混用如混用會 raise AssertionError
- [setLoggerAllowanceByEnv](#setLoggerAllowanceByEnv)
  依據 env設定什麼樣層級的 logger 允許被顯示, 需要在 [setCurrentEnv](#setCurrentEnv) 後呼叫, 一樣不得與 [setLoggerAllowance](#setLoggerAllowance) 混用如混用會 raise AssertionError

#### setLoggerAllowance 
__型別__ | [source][s-logger]
```ts
/** 
* @typeParam M - 模組名
*/
export type AllowedModule<M> = {
  moduleName: M;
  disallowedHandler: (level: ELevel) => boolean;
};
export type AllowedLogger<M extends string> = Record<M, AllowedModule<M>>;

setLoggerAllowance<M extends string>(modules: AllowedModule<M>[]): RawAllowedLogger<M>{}
```

__example__ 
混用 setLoggerAllowanceByEnv - raise AssertionError

```ts
// 不考慮 env
Logger.setLoggerAllowance<EModules>([
  testModule, newLogModule
]);
const action = ()=> Logger.setLoggerAllowanceByEnv({
  test: [],
  develop: []
});
expect(action).toThrow();
expect(action).toThrowError("AssertionError");
```
#### AllowedModule
__型別__ | [source][s-logger.types]
```ts
export type AllowedModule<M> = {
  /** module identifier */
  moduleName: M;
  /** 判斷哪一層級的 {@link ELevel} 不被允許 */
  disallowedHandler: (level: ELevel) => boolean;
  /** 用來覆寫當前 log level, 預設為保持不變： (level)=>level */
  logLevelHandler?: (level: ELevel)=> ELevel;
};
```
__example__
```ts
enum EModules {
  Test = "Test",
  Hobbits = "Hobbits",
}
const testModule: AllowedModule = {
  moduleName: EModules.Test,
  // log level <= info 才被允許，換言之 trace / debug 不允許
  disallowedHandler: (l)=> l <= ELevel.info,
  // 不覆寫 log level, 如想將所有 log level 覆寫為 current:
  // logLevelHandler: (l)=>ELevel.current
  logLevelHandler: (l)=> l,
}
```


#### setLoggerAllowanceByEnv
__型別__ | [source][s-logger]
```ts
/** 
 * @see {@link AllowedLogger} 
 * @typeParam M - module name 
*/
export type AllowedLoggerByEnv<M extends string> = {
  production?: Partial<AllowedLogger<M>>;
  release?: Partial<AllowedLogger<M>>;
  develop: Partial<AllowedLogger<M>>;
  test: Partial<AllowedLogger<M>>;
};
setLoggerAllowanceByEnv<M extends string>(option: AllowedLoggerByEnv<M>){}
```

__example__
```ts
// 假定有以下二模組
enum EModules {
  Test = "Test",
  Hobbits = "Hobbits",
}
const ClientModule: AllowedModule<EModules> = {
  moduleName: EModules.Client,
  disallowedHandler: (level)=> false
}
const LogModules = defineAllowedLoggers([
  ClientModule,
  {...ClientModule, moduleName: EModules.AuthGuard},
  {...ClientModule, moduleName: EModules.RequestRep},
  {...ClientModule, moduleName: EModules.HeaderUpdater}
])
Logger.setLoggerAllowanceByEnv(LogModules)
```

__example__ | [source][s-test-logger]:
```ts
describe("Considering of using env", ()=>{
  let log: Logger<EModules>;
  function clear(env: Env, allowance: any[]){
    Logger.clearModules();
    setupCurrentEnv(env);
    Logger.setLoggerAllowanceByEnv(Object.assign({
      test: [],develop: []
    }, {
      [env]: allowance
    }) as any);
    log = new Logger(testModule);
  }

  beforeEach(()=>{
    clear("release", [testModule]);
  });

  test("setLoggerAllowanceByEnv - expect module not exists", () => {
    clear("test", [testModule]);
    setupCurrentEnv("develop");
    expect(_currentEnv.value).toBe("develop");
    console.log("allowedModules", (Logger as any).allowedModules)
    expect(Logger.hasModule(testModule)).toBeFalsy();
    Logger.clearModules();
  });

  test("setLoggerAllowanceByEnv - expect module exists", () => {
    expect(_currentEnv.value).toBe("release");
    expect(Logger.hasModule(testModule)).toBeTruthy();
    expect(log._allowance).toEqual(testModule);
  });

  test("trace logger, expect to be blocked since it's not dev mode", () => {
    expect(_currentEnv.value).toBe("release");
    expect(Logger.hasModule(testModule)).toBeTruthy();
    expect(log._allowance).toEqual(testModule);
    expect(Logger.isAllowed(log._allowance, ELevel.trace)).toBeFalsy();
  });

  test("warn logger, expect to be blocked since it's not dev mode", () => {
    function Temp() {
      function SubTemp() {
        log.warn(["hello world, it's testModule calling"], { stackNumber });
      }
      return SubTemp();
    }
    const stackNumber = 3;
    expect(_currentEnv.value).toBe("release");
    expect(Logger.hasModule(testModule)).toBeTruthy();
    expect(log._allowance).toEqual(testModule);
    expect(Logger.isAllowed(log._allowance, ELevel.warn)).toBeTruthy();
    Temp();
    expect(log._prevLog).not.toBeUndefined();
    expect(log._prevLog.stacksOnDisplay.length).toBe(stackNumber);
    expect(log._prevLog.stacksOnDisplay[0]).toContain("SubTemp");
    expect(log._prevLog.moduleName).toBe("Test");
  });
});
```


---
# Writing pseudo code for api - 測試API工具:

## CRUD

有時開發時程不允許寫單元測試，只好透過寫假Api餵假資料，CRUD 提供單一Api所需的 Create/Read/Update/Delete 所需的界面。


```ts
export type TSuccessResponse = {
    succeed: boolean;
};

export type TDataResponse<T> = {
    data: T;
    pager?: TPager | null | undefined;
};

/**
 * @param dataList 取得該列表所有資料
 * @param updater  更新該列表所有資料 
 * @param itemGen 依 identity 由列表資料取得該 item
 */
const CRUD = <T extends {id: string|number}>(
  dataList: TOptional<TDataResponse<any[]>>,
  updater:(data: any[])=>void,
  itemGen: (idx: number)=>T
): {
    add: (payload: T)=>Promise<TSuccessResponse>,
    del: (payload: T)=>Promise<TSuccessResponse>,
    edit: (payload: T)=>Promise<TSuccessResponse>,
    get: (payload?: TPagerPayload)=>Promise<TDataResponse<any[]>>,
  }
```

### Example
```ts
const api = {
    news: {
        ...CRUD<NewsItem>(
            DB.getNewsList!,
            data => {
                DB.getNewsList!.data = data;
            },
            idx => {
                const result: NewsItem = {
                    is_publish: true,
                    author: DB.users[range(0, DB.users.length - 1)].username!,
                    content: `${idx} - content`,
                    title: `Loream Ipsum-${idx} dolo sit amet`
                };
                return result;
            }
        )
    }
}

api.news.add(payload);
api.news.del(payload);
api.news.edit(payload);
api.news.get(pagerPayload)
```


---
# 注入 ui framework reactive 方法:
## Inject Reactive Method
設計上希望能夠不相依於任何一個 ui framework，因此需由外部注入相應的 reactive 方法，再於內部使用這個需要被使用者注入的 reactive 方法作為界面，以達到與 ui framework 相依分離，否於未注入前就使用，則會出現 **InvalidUsageError:** 錯誤。

### Vue 為例
1) 注入 vue computed method
2) 注入 vue reactive method
3) 注入 vue watch method
4) 注入 vue ref method
  
**Example:**
```typescript 
import {
  setupComputed,
  setupCurrentEnv,
  setupReactive,
  setupRef,
  setupWatch,
} from "../src/extension/extension_setup";

import {
  computed as RComputed,
  reactive as RReactive,
  ref as RRef,
} from "../src/extension/extension_setup";

import { ref, reactive, watch, computed } from "vue";

describe("ref setup", ()=>{
  beforeAll(() => {
    setupRef(ref);
    setupReactive(reactive);
    setupWatch(watch);
    setupComputed(computed);
    setupCurrentEnv("develop");
  });

  test("computed", ()=>{
    expect(RComputed(()=>13).value).toBe(13);
  });
  test("ref", ()=>{
    expect(RRef(13).value).toBe(13);
  });
  test("reactive", ()=>{
    expect(RReactive({value: 13}).value).toBe(13);
  });
});
```


### React 為例
> todo...