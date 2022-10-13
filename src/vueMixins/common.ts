import {WritableComputedRef}    from "@vue/reactivity";
import { merge } from "merge-anything";
import {computed, watch} from "~/base/vueTypes";
import {assert} from "~/utils/assert";

export class CommonMixin {
  vModelEvents: Set<string>;
  constructor() {
    this.vModelEvents=new Set();
  }

  asVModelFromProps<R, T extends object=any>(
    option: {props: Readonly<T>, propName: keyof T, emit: any, onChange: (prev:R, val: R)=>void}): WritableComputedRef<R>
  {
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

const container: any = {};
const FACADE_KEY = Symbol();
export function injectFacade<T>(providers: Partial<T>, mergeObj: boolean = false) {
  container[FACADE_KEY] ??= {};
  if (!mergeObj){
    Object.keys(providers).forEach((prop) => {
      container[FACADE_KEY][prop] = providers[prop as keyof typeof providers] as any;
    });
  } else {
    Object.keys(providers).forEach((prop) => {
      if (container[FACADE_KEY][prop]){
        container[FACADE_KEY][prop] = merge(container[FACADE_KEY][prop], providers[prop as keyof typeof providers] as any)
      }else{
        container[FACADE_KEY][prop] = providers[prop as keyof typeof providers] as any;
      }
    });
  }
}

function getByPath(seg: [string, string[]], obj: any ): any{
  const first:string = seg[0];
  const last:string[] = seg[1];
  if (last.length == 1){
    return obj[first][last[0]];
  } else {
    return getByPath([last[0], last.splice(1) ], obj[first]);
  }
}

function pathRoute(path: string, obj: any){
  const segment = path.split(".");
  const pathObj: [string, string[]] = [segment[0], segment.splice(1)];
  return getByPath(pathObj, obj);
} 

export function IFacade<T extends Object>(): T {
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      container[FACADE_KEY] ??= {};
      const facade = container[FACADE_KEY];
        assert(facade[name as keyof T] !== undefined, `key name "${name.toString()}" not found in facade`);
        return facade[name as keyof T];
    }
  });
}
