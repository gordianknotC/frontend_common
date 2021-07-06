import {useBuiltIn} from "~/types/base/builtinAddonsTypes";
import {IBaseApiService, TOptional} from "~/types/base/baseApiTypes";
import {Router} from "vue-router";
import {IParamStore} from "~/types/base/baseParamStore";

const singletonContainer: Record<string, any> = {};
const nonSingletonContainer: Record<string, ()=>any> = {};
let facade: any;

export interface IFacade  {
  apiService: IBaseApiService;
  router: Router;
  paramStore: IParamStore<any>;
}



export class Facade{
  static inject<T extends Object>(name:string, singleton:boolean = true): T{
    if (singleton){
      const val = singletonContainer[name];
      assert(val !== undefined, `key name "${name.toString()}" not found in facade`)
      return val;
    }else{
      const val = nonSingletonContainer[name];
      assert(val !== undefined, `key name "${name.toString()}" not found in facade`)
      assert(val.constructor === Function, "Type Miss Match");
      return val();
    }
  }

  static provide<T>(providers: Partial<T>, singleton:boolean = true){
    useBuiltIn();
    if (singleton){
      assert(Object.keys(providers).length > 0, "Type Miss Matched");
      Object.keys(providers).forEach((prop) => {
        //@ts-ignore
        singletonContainer[prop] = providers[prop];
      });
    }else{
      assert(providers.constructor === Function, "Type Miss Matched");
      Object.keys(providers).forEach((prop) => {
        //@ts-ignore
        singletonContainer[prop] = providers[prop];
      });
    }
  }

  static asProxy<T extends Object>(): T{
    return facade ??= new Proxy<T>({} as T, {
      get: function (target, name) {
        return Facade.inject(name as any);
      }
    });
  }
}


function assert(condition: any, message?: string): asserts condition{
  if (!condition){
    throw new Error(`AssertionError: ${message ?? ""}`);
  }
}
