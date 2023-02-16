


<!--#-->
前端常用工具

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
- completer (假用 dart Completer 概念，類似 Promise, 只是將 resolve/reject 寫進物件中，可用於外部 resolve/reject Promise)
- logger
- a CRUD function for writing pseudo code api

# Table of Content
<!-- START doctoc -->
<!-- END doctoc -->

[s-provideDependency]: src/vueMixins/common.ts
[s-provideFacade]: src/vueMixins/common.ts
[s-queue]: src/utils/queue.ts
[s-completer]: src/utils/completer.ts
[s-logger]: src/utils/logger.ts
[s-logger.types]: src/utils/logger.types.ts
[s-test-queue]: __tests__/queue.test.ts
[s-test-completer]: __tests__/completer.test.ts
[s-test-logger]: __tests__/logger.test.ts
