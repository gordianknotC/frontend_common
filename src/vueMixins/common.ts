import {WritableComputedRef}    from "@vue/reactivity";
import {computed} from "~/base/vueTypes";
import {assert} from "~/utils/assert";
type TEmitFn<E> = (event: E, ...args: any[])=>void;

export class CommonMixin {
  vModelEvents: Set<string>;
  constructor() {
    this.vModelEvents=new Set();
  }

  asVModelFromProps<R, T extends object=any>(props: Readonly<T>, propName: keyof T, emit: TEmitFn<any>): WritableComputedRef<R>{
    const event = `update:${propName}`;
    this.vModelEvents.add(event as any);
    return computed ({
      get(){
        return props[propName];
      },
      set(v: any){
        emit(event, v);
      }
    })
  }
}

const container = {};
const FACADE_KEY = Symbol();
export function injectFacade<T>(providers: Partial<T>){
  //@ts-ignore
  container[FACADE_KEY] ??= {};
  Object.keys(providers).forEach((prop) => {
    //@ts-ignore
    container[FACADE_KEY][prop] = providers[prop];
  });
}

export function IFacade<T extends Object>(mapping?: T): T {
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      // @ts-ignore
      const facade = container[FACADE_KEY];
      assert(facade[name as keyof T] !== undefined, `key name "${name.toString()}" not found in facade`)
      return facade[name as keyof T];
    }
  });
}
