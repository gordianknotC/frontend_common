/** 借用 Dart Completer 概念
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
export declare class Completer<T> {
    _meta?: T;
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
     *                本身的註解
     */
    constructor(_meta?: T);
}
