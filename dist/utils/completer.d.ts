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
    complete: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    future: Promise<T>;
    constructor();
}
