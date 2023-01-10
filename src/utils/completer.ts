
abstract class _Completer<T> extends Promise<T> {
  abstract resolve(value: T | PromiseLike<T>) : void;
  abstract reject(reason?: any): void;
  // constructor() {
  //   const newExecutor = (resolve: any, reject: any)=>{
  //     this.resolve = (val: T)=>{
  //       resolve(val);
  //     };
  //     this.reject = (reason)=>{
  //       reject(reason);
  //     };
  //   };
  //   super(newExecutor);
  // }
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
 export class Completer<T>  {
  complete:(value: T | PromiseLike<T>) => void;
  reject:(reason?: any) => void;
  future: Promise<T>;
  constructor() {
    this.future= new Promise((resolve: any, reject: any)=>{
      this.complete = (val: T)=>{
        resolve(val);
      };
      this.reject = (reason)=>{
        reject(reason);
      };
    })
  }
}

// export function Completer<T>(): Promise<T> & _Completer<T> {
//   let completer = {value:  undefined} as any;
//   completer.value = new Promise<T>((resolve, reject) => {
//     console.log("tobe called !!!!!!", completer);
//     completer.value.resolve = resolve;
//     completer.value.reject = reject;
//   }) as _Completer<T>;
//   return completer.value;  
// }
