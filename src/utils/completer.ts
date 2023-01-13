import { randomUUID } from "crypto";
import { ArrayDelegate, Arr } from "..";

abstract class _Completer<T, M=T> {
  abstract _meta?: M;
  abstract future: Promise<T>;
  abstract complete(value: T | PromiseLike<T>): void;
  abstract reject(reason?: any): void;
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
export class Completer<T, M=T> {
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
  constructor(public _meta?: M) {
    this.future = new Promise((resolve: any, reject: any) => {
      this.complete = (val: T) => {
        resolve(val);
      };
      this.reject = (reason) => {
        reject(reason);
      };
    });
  }
}
