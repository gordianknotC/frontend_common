"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
class _Completer {
}
/** 借用 Dart Completer 概念
 * @typeParam T - Promise 返回型別
 * @typeParam M - meta 型別
 * @example
 * ```ts
   const futureQueue = [];
   function fetch(payload: any){
      const completer = new Completer();
      futureQueue.push(completer);
      ...
      return completer.future;
   }
   ...
   ...
   // futureQueue[0].resolve...
   // futureQueue[0].reject...
 ```
 */
class Completer {
    /**
     * @param _meta - 用來暫時代表 future 值的物件，也可作為 Completer
     * 本身的註解或額外資訊，如 request config / request header
     * @example
       ```ts
        const completer = new Completer<AxiosRequestConfig>({
          meta: requestConfig
        })
     * ```
     */
    constructor(_meta) {
        this._meta = _meta;
        this.future = new Promise((resolve, reject) => {
            this.complete = (val) => {
                resolve(val);
            };
            this.reject = (reason) => {
                reject(reason);
            };
        });
    }
}
exports.Completer = Completer;
//# sourceMappingURL=completer.js.map