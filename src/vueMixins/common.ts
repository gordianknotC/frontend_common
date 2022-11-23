import {WritableComputedRef}    from "@vue/reactivity";
import { merge } from "merge-anything";
import { computed, reactive, ref, watch } from "~/extension/extension_setup";
import {assert} from "~/utils/assert";

export class CommonMixin {
  vModelEvents: Set<string>;
  constructor() {
    this.vModelEvents=new Set();
  }

  asVModelFromProps<R, T extends object=any>(
    option: {props: Readonly<T>, propName: keyof T, emit: any, onChange: (prev:R, val: R)=>void}): WritableComputedRef<R>
  {
    const event = `update:${option.propName as string}`;
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

export function provideFacade<T>(providers: Partial<T>, mergeObj: boolean = false, ident=FACADE_KEY) {
  container[ident] ??= {};
  if (!mergeObj){
    Object.keys(providers).forEach((prop) => {
      container[ident][prop] = providers[prop as keyof typeof providers] as any;
      
    });
  } else {
    Object.keys(providers).forEach((prop) => {
      if (container[ident][prop]){
        container[ident][prop] = merge(container[ident][prop], providers[prop as keyof typeof providers] as any)
      }else{
        container[ident][prop] = providers[prop as keyof typeof providers] as any;
      }
    });
  }
}

export function injectDependency<T>(pathOrName: string, ident=FACADE_KEY): T{
  if (pathOrName.contains(".")){
    return accessByPath(pathOrName, container[ident]) as T;
  }else{
    return container[ident][pathOrName] as T;
  }
}

export function injectFacade<T>(ident=FACADE_KEY): T {
  return container[ident] as T;
}

function routeObjectByPath(seg: [string, string[]], obj: any ): any{
  const first:string = seg[0];
  const last:string[] = seg[1];
  if (last.length == 1){
    return obj[first][last[0]];
  } else {
    return routeObjectByPath([last[0], last.splice(1) ], obj[first]);
  }
}

function accessByPath(path: string, obj: any){
  const segment = path.split(".");
  const pathObj: [string, string[]] = [segment[0], segment.splice(1)];
  return routeObjectByPath(pathObj, obj);
} 

export function IFacade<T extends Object>(ident=FACADE_KEY, option?: {transformFuncAsGetter: boolean}): T {
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      container[ident] ??= {};
      const facade = container[ident];
      const member = facade[name as keyof T];
      assert(facade[name as keyof T] !== undefined, `key name "${name.toString()}" not found in facade`);

      // note: 當傳入的型別為 function
      // 則視為傳入參照，以參照處理.
      if (typeof member === 'function' && (option?.transformFuncAsGetter ?? false)){
        return member();
      }
      return member;
    }
  });
}
