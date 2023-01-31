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
        this._isCompleted = false;
        this._isRejected = false;
        this.future = new Promise((resolve, reject) => {
            this.complete = (val) => {
                var _a;
                console.log("Completer resolve:", val, "resolve:", resolve);
                resolve(val);
                this._isCompleted = true;
                (_a = this._onComplete) === null || _a === void 0 ? void 0 : _a.call(this, this);
            };
            this.reject = (reason) => {
                var _a;
                console.log("Completer reject:", reason, "reject:", reject);
                reject(reason);
                this._isRejected = true;
                (_a = this._onReject) === null || _a === void 0 ? void 0 : _a.call(this, this);
            };
        });
    }
    get isCompleted() {
        return this._isCompleted;
    }
    ;
    get isRejected() {
        return this._isRejected;
    }
    ;
    onComplete(cb) {
        this._onComplete = cb;
    }
    onReject(cb) {
        this._onReject = cb;
    }
}
exports.Completer = Completer;
//# sourceMappingURL=completer.js.map