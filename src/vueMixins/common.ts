import {WritableComputedRef}    from "@vue/reactivity";
import {computed, watch} from "~/base/vueTypes";
import {assert} from "~/utils/assert";

export class CommonMixin {
  vModelEvents: Set<string>;
  constructor() {
    this.vModelEvents=new Set();
  }

  asVModelFromProps<R, T extends object=any>(option: {props: Readonly<T>, propName: keyof T, emit: any, onChange: (prev:R, val: R)=>void}): WritableComputedRef<R>{
    const event = `update:${option.propName}`;
    this.vModelEvents.add(event as any);
    const ret =  computed ({
      get(){
        return option.props[option.propName];
      },
      set(v: any){
        option.onChange(option.props[option.propName] as any, v);
        option.emit(event, v);
      }
    });
    watch(()=>option.props[option.propName], option.onChange as any);
    return ret;
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
