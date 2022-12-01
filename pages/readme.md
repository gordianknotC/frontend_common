
<!--#-->

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
- a CRUD function for writing pseudo code api

# Table of Content
- [Facade:](#facade)
- [Provider Pattern](#provider-pattern)
  - [Facade Provider (對應Facade Injector)](#facade-provider-對應facade-injector)
    - [不合併 provide 物件](#不合併-provide-物件)
    - [合併 provide 物件](#合併-provide-物件)
  - [Dependency Provider(對應 dependency injector)](#dependency-provider對應-dependency-injector)
    - [不指定 Ident](#不指定-ident)
    - [指定 Ident](#指定-ident)
- [Injector Pattern](#injector-pattern)
    - [InjectDependency](#injectdependency)
    - [InjectFacade](#injectfacade)
  - [應用於 App 上開發](#應用於-app-上開發)
- [Lazy Loading:](#lazy-loading)
  - [lazyHolder - lazy loading for objects except function](#lazyholder---lazy-loading-for-objects-except-function)
    - [description](#description)
    - [以Locale 為例](#以locale-為例)
  - [CallableDelegate - lazy loading for functions](#callabledelegate---lazy-loading-for-functions)
    - [以實作 vue watch method 為例](#以實作-vue-watch-method-為例)
- [Writing pseudo code for api - 測試API工具:](#writing-pseudo-code-for-api---測試api工具)
- [Writing pseudo code for api - 測試API工具](#writing-pseudo-code-for-api---測試api工具-1)
  - [CRUD](#crud)
    - [Example](#example)


