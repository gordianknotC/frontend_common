"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IFacade = exports.injectFacade = exports.injectDependency = exports.provideDependency = exports.provideFacade = exports.CommonMixin = void 0;
const merge_anything_1 = require("merge-anything");
const extension_setup_1 = require("~/extension/extension_setup");
const assert_1 = require("~/utils/assert");
class CommonMixin {
    constructor() {
        this.vModelEvents = new Set();
    }
    asVModelFromProps(option) {
        const event = `update:${option.propName}`;
        this.vModelEvents.add(event);
        const ret = (0, extension_setup_1._computed)({
            get() {
                return option.props[option.propName];
            },
            set(v) {
                option.onChange(option.props[option.propName], v);
                option.emit(event, v);
            }
        });
        (0, extension_setup_1._watch)(() => option.props[option.propName], option.onChange);
        return ret;
    }
}
exports.CommonMixin = CommonMixin;
const container = {};
const FACADE_KEY = Symbol();
const DEP_KEY = Symbol();
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
function provideFacade(option) {
    var _a;
    const { deps, merge: mergeObj, ident } = Object.assign({
        mergeObj: false,
        ident: FACADE_KEY
    }, option);
    (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
    if (!mergeObj) {
        Object.keys(deps).forEach((prop) => {
            container[ident][prop] = deps[prop];
        });
    }
    else {
        Object.keys(deps).forEach((prop) => {
            if (container[ident][prop]) {
                container[ident][prop] = (0, merge_anything_1.merge)(container[ident][prop], deps[prop]);
            }
            else {
                container[ident][prop] = deps[prop];
            }
        });
    }
}
exports.provideFacade = provideFacade;
/**
*  Dependency Provider
 * provide 方法，將 dependency以 ident 作為 key 植入 container
 * @see {@link provideFacade}
 * */
exports.provideDependency = ((option) => {
    var _a;
    (_a = option.ident) !== null && _a !== void 0 ? _a : (option.ident = DEP_KEY);
    return provideFacade(option);
});
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
function injectDependency(pathOrName, ident = DEP_KEY) {
    if (pathOrName.contains(".")) {
        return accessByPath(pathOrName, container[ident]);
    }
    else {
        return container[ident][pathOrName];
    }
}
exports.injectDependency = injectDependency;
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
function injectFacade(ident = FACADE_KEY) {
    return container[ident];
}
exports.injectFacade = injectFacade;
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
 * @param ident - symbol|string － 注入 container 中所代表的 key
 * @param option.transformFuncAsGetter - 是否要將注入的 function 轉為 getter method
 *
 * @example 基本使用
 * ```ts
 * // main.ts
 * export type AppFacade =
 * FacadeMappers &
 * FacadeDateSource &
 * FacadeRepository &
 * FacadePresentationStore &
 * FacadeDomainService;
 *
 * export const facade = IFacade<AppFacade>(); // 此時 facade 內容尚未 provide
 * assert(facade.data == undefined) // throw: key name "data" not found in facade
 *
 * provideFacade({data: {a: 1}}); // 將 data: {a: 1} 注入 facade interface
 * assert(facade.data.a == 1); // pass
 * ```
 *
 * @example option.transformFuncAsGetter
 * ```ts
 * const key1 = "1";
 * const key2 = "2";
 *
 * const facade = IFacade<AppFacade>(key1, {transformFuncAsGetter: false});
 * const facade2 = IFacade<AppFacade>(key2, {transformFuncAsGetter, true});
 * provideFacade({ident: key1, {data: ()=>"key1"}});
 * provideFacade({ident: key2, {data: ()=>"key2"}});
 *
 * assert(facade.data() == "key1");
 * assert(facade.data == "key2");
 * ```
 **/
function IFacade(ident = FACADE_KEY, option) {
    return new Proxy({}, {
        get: function (target, name) {
            var _a, _b;
            (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
            const facade = container[ident];
            const member = facade[name];
            (0, assert_1.assert)(facade[name] !== undefined, `key name "${name.toString()}" not found in facade`);
            // note: 當傳入的型別為 function
            // 則視為傳入參照，以參照處理.
            if (typeof member === 'function' && ((_b = option === null || option === void 0 ? void 0 : option.transformFuncAsGetter) !== null && _b !== void 0 ? _b : false)) {
                return member();
            }
            return member;
        }
    });
}
exports.IFacade = IFacade;
//# sourceMappingURL=common.js.map