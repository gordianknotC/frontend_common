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
export declare class Completer<T, M = T> {
    _meta?: M;
    isCompleted: boolean;
    /** 同 Promise.resolve, resolve {@link future} 本身*/
    complete: (value: T | PromiseLike<T>) => void;
    /** 同 Promise.reject, reject {@link future} 本身 */
    reject: (reason?: any) => void;
    /** 即 Promise 物件本身, 其 resolve / reject 方法分別為
     * {@link complete} / {@link reject}
     */
    future: Promise<T>;
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
    constructor(_meta?: M);
    private _onComplete?;
    onComplete(cb: (self: Completer<T, M>) => void): void;
}
