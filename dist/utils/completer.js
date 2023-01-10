"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Completer = void 0;
class _Completer extends Promise {
}
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
class Completer {
    constructor() {
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
// export function Completer<T>(): Promise<T> & _Completer<T> {
//   let completer = {value:  undefined} as any;
//   completer.value = new Promise<T>((resolve, reject) => {
//     console.log("tobe called !!!!!!", completer);
//     completer.value.resolve = resolve;
//     completer.value.reject = reject;
//   }) as _Completer<T>;
//   return completer.value;  
// }
//# sourceMappingURL=completer.js.map