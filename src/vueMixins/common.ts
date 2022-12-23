import {WritableComputedRef}    from "@vue/reactivity";
import { merge } from "merge-anything";
import { _computed, _reactive, _ref, _watch } from "~/extension/extension_setup";
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
    const ret =  _computed ({
      get(){
        return option.props[option.propName];
      },
      set(v: any){
        option.onChange(option.props[option.propName] as any, v);
        option.emit(event, v);
      }
    });
    _watch(()=>option.props[option.propName], option.onChange as any);
    return ret;
  }
}

const container: any = {};
const FACADE_KEY = Symbol();
const DEP_KEY = Symbol();

type ProviderParams<T> = {deps: Partial<T>, merge?: boolean, ident?: string | symbol};
/**
 *  Dependency Provider
 *  provide 方法，將 dependency以 ident 作為 key 植入 container
 * 
 *  @params deps 物件值鍵對
 *  @params mergeObj 是否對 provider 所提併的值鍵對進與 container 進行合併 
 *  @params ident 用以識別 container 取值所需要的 key
 *  @example
 *  ```ts
 *  const mergeObj = true;
 *  provideFacade({
 *    source: {
 *      a: 1
 *    }
 *  }, mergeObj)
 * 
 *  provideFacade({
 *    source: {
 *      b: 2
 *    },
 *    override: {a: 1}
 *  }, mergeObj);
 *  
 *  // 覆寫整個 override
 *  provideFacade({
 *    override: {b: 2} 
 *  }, false)
 * 
 *  const facade = injectFacade();
 *  assert(facade.source.a == 1);
 *  assert(facade.source.b == 2);
 *  assert(facade.override.a == undefined);
 *  assert(facade.override.b == 2);
 *  ```
 */
export function provideFacade<T>(option: ProviderParams<T>) {
  const {deps, merge: mergeObj, ident} = Object.assign({
    mergeObj: false, 
    ident: FACADE_KEY
  }, option);

  container[ident] ??= {};
  if (!mergeObj){
    Object.keys(deps).forEach((prop) => {
      container[ident][prop] = deps[prop as keyof typeof deps] as any;
      
    });
  } else {
    Object.keys(deps).forEach((prop) => {
      if (container[ident][prop]){
        container[ident][prop] = merge(container[ident][prop], deps[prop as keyof typeof deps] as any)
      }else{
        container[ident][prop] = deps[prop as keyof typeof deps] as any;
      }
    });
  }
}

/**
*  Dependency Provider
 * provide 方法，將 dependency以 ident 作為 key 植入 container
 * @see {@link provideFacade}
 * */
export const provideDependency = (<T>(option: ProviderParams<T>)=>{
  option.ident ??= DEP_KEY;
  return provideFacade(option);
}) as typeof provideFacade;

/**
 * Dependency Injector
 * @see {@link provideDependency}
 * @param pathOrName 可以 dot 作為 property accessor 如 "source.propA"
 * @param ident 
 * @returns 
 * 
 * @example
 * ```ts
 *  provideDependency({source: {a: 1}});
 *  const a = injectDependency("source.a");
 * ```
 */
export function injectDependency<T>(pathOrName: string, ident=DEP_KEY): T{
  if (pathOrName.contains(".")){
    return accessByPath(pathOrName, container[ident]) as T;
  }else{
    return container[ident][pathOrName] as T;
  }
}

/**
 * Dependency Injector
 * 注入 IFacade interface, 對應 provideFacade
 * @see {@link provideFacade}
 * @param ident 
 * @example
 * ```ts
 *  provideFacade({a: 1}, true);
 *  provideFacade({b: 2}, true);
 *  
 * const Facade = injectFacade();
 * assert(Facade.a == 1);
 * assert(Facade.b == 2);
 * ```
 */
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


/**
 *  Facade Interface 
 * 
 * @example
 * ```ts
 * // main.ts
 * export type AppFacade = 
 * FacadeMappers &
 * FacadeDateSource &
 * FacadeRepository &
 * FacadePresentationStore &
 * FacadeDomainService;
 * 
 * // 此時 facade 內容尚未 provide
 * export const facade = IFacade<AppFacade>();
 * assert(facade.data == undefined) // throw: key name "data" not found in facade
 * 
 * provideFacade({data: {a: 1}});
 * assert(facade.data.a == 1);
 * ```
 **/
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
