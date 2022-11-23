import { merge } from "merge-anything";
import { computed, watch } from "../extension/extension_setup";
import { assert } from "../utils/assert";
export class CommonMixin {
    constructor() {
        this.vModelEvents = new Set();
    }
    asVModelFromProps(option) {
        const event = `update:${option.propName}`;
        this.vModelEvents.add(event);
        const ret = computed({
            get() {
                return option.props[option.propName];
            },
            set(v) {
                option.onChange(option.props[option.propName], v);
                option.emit(event, v);
            }
        });
        watch(() => option.props[option.propName], option.onChange);
        return ret;
    }
}
const container = {};
const FACADE_KEY = Symbol();
const DEP_KEY = Symbol();
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
export function provideFacade(providers, mergeObj = false, ident = FACADE_KEY) {
    var _a;
    (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
    if (!mergeObj) {
        Object.keys(providers).forEach((prop) => {
            container[ident][prop] = providers[prop];
        });
    }
    else {
        Object.keys(providers).forEach((prop) => {
            if (container[ident][prop]) {
                container[ident][prop] = merge(container[ident][prop], providers[prop]);
            }
            else {
                container[ident][prop] = providers[prop];
            }
        });
    }
}
/**
*  Dependency Provider
 * provide 方法，將 dependency以 ident 作為 key 植入 container
 * @see {@link provideFacade}
 * */
export const provideDependency = ((...args) => {
    var _a;
    return provideFacade(args[0], args[1], (_a = args[2]) !== null && _a !== void 0 ? _a : DEP_KEY);
});
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
export function injectDependency(pathOrName, ident = DEP_KEY) {
    if (pathOrName.contains(".")) {
        return accessByPath(pathOrName, container[ident]);
    }
    else {
        return container[ident][pathOrName];
    }
}
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
export function injectFacade(ident = FACADE_KEY) {
    return container[ident];
}
function routeObjectByPath(seg, obj) {
    const first = seg[0];
    const last = seg[1];
    if (last.length == 1) {
        return obj[first][last[0]];
    }
    else {
        return routeObjectByPath([last[0], last.splice(1)], obj[first]);
    }
}
function accessByPath(path, obj) {
    const segment = path.split(".");
    const pathObj = [segment[0], segment.splice(1)];
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
export function IFacade(ident = FACADE_KEY, option) {
    return new Proxy({}, {
        get: function (target, name) {
            var _a, _b;
            (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
            const facade = container[ident];
            const member = facade[name];
            assert(facade[name] !== undefined, `key name "${name.toString()}" not found in facade`);
            // note: 當傳入的型別為 function
            // 則視為傳入參照，以參照處理.
            if (typeof member === 'function' && ((_b = option === null || option === void 0 ? void 0 : option.transformFuncAsGetter) !== null && _b !== void 0 ? _b : false)) {
                return member();
            }
            return member;
        }
    });
}
//# sourceMappingURL=common.js.map