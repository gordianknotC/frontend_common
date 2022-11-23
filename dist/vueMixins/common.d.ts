import { WritableComputedRef } from "@vue/reactivity";
export declare class CommonMixin {
    vModelEvents: Set<string>;
    constructor();
    asVModelFromProps<R, T extends object = any>(option: {
        props: Readonly<T>;
        propName: keyof T;
        emit: any;
        onChange: (prev: R, val: R) => void;
    }): WritableComputedRef<R>;
}
/**
 *  Dependency Provider
 *  provide 方法，將 dependency以 ident 作為 key 植入 container
 *
 *  @params providers 物件值鍵對
 *  @params mergeObj 是否對 provider 所提併的值鍵對進與 container 進行合併
 *  @params ident 用以識別 container 取值所需要的 key
 *
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
export declare function provideFacade<T>(providers: Partial<T>, mergeObj?: boolean, ident?: symbol): void;
/**
*  Dependency Provider
 * provide 方法，將 dependency以 ident 作為 key 植入 container
 * @see {@link provideFacade}
 * */
export declare const provideDependency: typeof provideFacade;
/**
 * Dependency Injector
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
export declare function injectDependency<T>(pathOrName: string, ident?: symbol): T;
/**
 * Dependency Injector
 * 注入 IFacade interface, 對應 provideFacade
 * @param ident
 * @returns
 *
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
export declare function injectFacade<T>(ident?: symbol): T;
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
export declare function IFacade<T extends Object>(ident?: symbol, option?: {
    transformFuncAsGetter: boolean;
}): T;
