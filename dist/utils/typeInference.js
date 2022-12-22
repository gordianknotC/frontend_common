"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isnot = exports.is = exports.Is = exports.asMapFromNumberedEnum = exports.UnWrappedVueRef = exports.asUnWrappedVueRefMap = exports.getOmitsBy = exports.flattenInstance = exports.getAccessibleProperties = exports.asEnum = exports.isRefImpl = void 0;
const extension_setup_1 = require("../extension/extension_setup");
let refImplClassName = undefined;
/**
 * 判斷是否為 vue RefImpl
 * note: 暫時性解法
 *
 * - isRefImpl 判斷無法用 obj.constructor.name == RefImpl
 *   since constructor name will be mangled after production build.
 *  - this issue cannot be addressed even if we configure compress option as keep_classname,
 *
 **/
function isRefImpl(obj) {
    var _a;
    if (obj === null || obj === undefined)
        return false;
    // @ts-ignore
    refImplClassName !== null && refImplClassName !== void 0 ? refImplClassName : (refImplClassName = (0, extension_setup_1.ref)().constructor.name);
    return typeof obj == "object"
        && ((_a = obj === null || obj === void 0 ? void 0 : obj.constructor) === null || _a === void 0 ? void 0 : _a.name) === refImplClassName
        && Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).length == 2; // constructor, value
}
exports.isRefImpl = isRefImpl;
/**
 *
 * Create Enum Object
 * 將 object key 存入 value, value 存入 key
 * e.g.:
 * ```javascript
 *      object = {a: 1, b: 2}
 *      enumObj = asEnum(object)
 *      enumObj == {a: 1, b: 2, '2': 'a', '1': 'b'} // true
 *      Object.keys(object) // ['a', 'b']
 *      Object.keys(enumObj) // ['a','b']
 * ```
 *
 *    行為與 enum 相同，用於需要分開定義 enum 值與鍵的情境
 *    如同時需要存取 enum 的值，也需要 enum 的 key(label)
 *
 *    以下為與與enum的異同點
 *  ```ts
 *    enum EA{
 *      a = 1, b = 2
 *    }
 *
 *    const EB = asEnum({
 *      a: 1, b: 2
 *    })
 * ```
 *    ------------------------
 *    同:
 *      EA.a == EA.b == 1 // true
 *      EA.b == EB.b == 2 // true
 *      EA['1'] == 'a' == EB['1'] // true
 *      EA['2'] == 'b' == EB['2'] // true
 *    -------------------------
 *    異
 *      Object.keys(EA) // ['a', 'b', '1', '2']
 *      Object.keys(EB) // ['a', 'b']
 *
 * */
function asEnum(obj) {
    let result = Object.create({});
    let prototype = Object.getPrototypeOf(result);
    Object.keys(obj).forEach((_k) => {
        const key = _k;
        const val = obj[key];
        // @ts-ignore
        result[key] = val;
        // @ts-ignore
        prototype[val] = key;
    });
    return result;
}
exports.asEnum = asEnum;
const defaultAccessibleRule = (name) => {
    if (name == "constructor")
        return false;
    if (name.startsWith("_"))
        return false;
    return true;
};
function getAccessibleProperties(obj, isAvailable, results) {
    results !== null && results !== void 0 ? results : (results = new Set());
    isAvailable !== null && isAvailable !== void 0 ? isAvailable : (isAvailable = defaultAccessibleRule);
    let prototype = Object.getPrototypeOf(obj);
    Object.getOwnPropertyNames(prototype).forEach((_k) => {
        if (isAvailable(_k))
            results.add(_k);
    });
    // 底層
    if (Object.getPrototypeOf(prototype).constructor.name == "Object") {
        return results;
    }
    return getAccessibleProperties(prototype, isAvailable, results);
}
exports.getAccessibleProperties = getAccessibleProperties;
/**
 *  flattenInstance 平面化 class，用於 vue 寫 OOP
 *  vue 若傳入有繼承關係的類別（class)，其繼承關係會消失
 *  因為 vue 不會讀取 prototype 層的內容
 *
 *  如 A extends Base, 而
 *  - Base 有 methodBase, propBase, propX
 *  - A 有 propA, methodA, propX
 *  當我們將 instance A 傳給 vue 物件化後
 *  vue 會無視 methodBase, propBase, 因為 methodBase/propBase
 *  在 A 的 prototype 層
 *
 *  flattenInstance 作用為將可存取的所有 methods / property
 *  寫入當前的 class, 使得 A 繼承至 Base 的 methodBase, propBase 平面化至 A
 *
 *  @param rule 平面化規則，預設為
 *              constructor 不考慮
 *              method name 開頭為 "_" 不考慮
 * */
function flattenInstance(obj, overrideReadonly = false, rule, onError) {
    rule !== null && rule !== void 0 ? rule : (rule = defaultAccessibleRule);
    const properties = getAccessibleProperties(obj, rule);
    properties.forEach((property) => {
        const val = obj[property];
        try {
            if (typeof val == "function") {
                obj[property] = val.bind(obj);
            }
            else {
                obj[property] = val;
            }
        }
        catch (e) {
            if ((e.toString()).startsWith("TypeError: Cannot set property")) {
                if (overrideReadonly) {
                    let temp;
                    Object.defineProperty(obj, property, {
                        get() {
                            return temp !== null && temp !== void 0 ? temp : obj[property];
                        },
                        set(v) {
                            temp = v;
                        }
                    });
                }
                else {
                    throw e;
                }
            }
            else {
                throw e;
            }
        }
    });
}
exports.flattenInstance = flattenInstance;
/**
 * 同 lodash omitsBy
 * @param payload 輪入物件
 * @param omits 欲從輸入物件移除的 key
 * @returns
 *
 * @example
 * ```javascript
 * getOmitsBy({a:1, b:2}, ["a"])
 * ```
 */
function getOmitsBy(payload, omits) {
    const result = { ...payload };
    omits.forEach((e) => {
        //@ts-ignore
        delete result[e];
    });
    return result;
}
exports.getOmitsBy = getOmitsBy;
/**
 *  將 RefImpl (vue ref object) Map 轉為一般型別
 *  避免 template 與  script 使用上的不一致，如
 *
 *  labels = {
 *    name: computed(()=>'hello')
 *  }
 *
 *  1) 於 script 中使用時
 *    > labels.name.value == 'hello'
 *
 *  2) 於 template 中使用時
 *    - 若於 setup 階段 labels.name [返回]至 vue 進行 unwrap
 *      > labels.name.value  ----- 報錯
 *      > labels.name == 'hello'
 *    - 若於 setup 階段 labels.name [不返回]至 vue 進行 unwrap
 *      > labels.name == RefImpl{}
 *      > labels.name.value == 'hello'
 *
 *  只要 labels.name 被 vue 進行 unwrap 就會出現混亂的不一致
 *  asUnWrappedVueRefMap 用於將 整個 Map 物件中的所有 RefImpl
 *  轉為 Proxy, 適用於整個 Map 都是 readonly computed
 * */
function asUnWrappedVueRefMap(obj, keys) {
    return new Proxy({}, {
        get: function (target, name) {
            if (keys.includes(name)) {
                return obj[name].value;
            }
            return obj[name];
        }
    });
}
exports.asUnWrappedVueRefMap = asUnWrappedVueRefMap;
const SYMBOLS = {};
/**
 *   UnWrap 物件內所有的 RefImpl,將其真正的 getter setter
 *   轉發至 Symbol 中
 *  @see {@link asUnWrappedVueRefMap}
 **/
function UnWrappedVueRef(obj, keys) {
    const properties = is.undefined(keys)
        ? Object.keys(obj)
        : keys;
    properties.forEach((key) => {
        var _a;
        const val = obj[key];
        console.log("UnWrappedVueRef", val.constructor.name, val);
        // @ts-ignore
        if (isRefImpl(val)) {
            // @ts-ignore
            (_a = SYMBOLS[key]) !== null && _a !== void 0 ? _a : (SYMBOLS[key] = Symbol(key));
            // @ts-ignore
            obj[SYMBOLS[key]] = val;
            Object.defineProperty(obj, key, {
                // @ts-ignore
                get: () => obj[SYMBOLS[key]].value,
                // @ts-ignore
                set: (v) => obj[SYMBOLS[key]].value = v
            });
        }
    });
}
exports.UnWrappedVueRef = UnWrappedVueRef;
/**
 *     number enum 附予 string mapping 功能
 *     ex:
 *
 *     ENum = asMapFromNumberedEnum(enum {
 *         a = 1,
 *         b = 2,
 *     })
 *     Object.keys(ENum)
 *     > ['a', 'b']
 *
 *     ENum['a']
 *     > 1
 *
 *     ENum[1]
 *     > 'a'
 *
 * */
function asMapFromNumberedEnum(numberEnum) {
    let result = Object.create({});
    let prototype = Object.getPrototypeOf(result);
    Object.keys(numberEnum).forEach((_k) => {
        const key = _k;
        const val = numberEnum[key];
        // @ts-ignore
        const isNumber = parseInt(key) == key;
        if (isNumber) {
            prototype[key] = val;
        }
        else {
            // @ts-ignore
            result[key] = val;
        }
    });
    return result;
}
exports.asMapFromNumberedEnum = asMapFromNumberedEnum;
const axiosKeys = ["data", "status", "statusText", "headers", "config"];
/**
 *
 */
class Is {
    /**
     * 用於 typed class, 即有 constructor name 者，無法分辦以下情況
     *   1) generic class
     *   2) 非 class object (沒有 constructor name者）
     *   e.g:
     *    > is.type([], "Object") // false 讀 constructor.name
     *    > is.type([], "Array")  // true 讀 constructor.name
     *    > is.type({}, "Object") // true 讀 constructor.name
     *
     * @param val
     * @param name
     * @returns
     */
    type(val, name) {
        var _a;
        return (((_a = val === null || val === void 0 ? void 0 : val.constructor) === null || _a === void 0 ? void 0 : _a.name) == name);
    }
    true(val) {
        return val === true;
    }
    array(val) {
        return Array.isArray(val);
    }
    string(val) {
        return typeof val == "string";
    }
    number(val) {
        return typeof val == "number";
    }
    /**
     * 判斷是否為 undefined, null, "undefined"
     * @param val
     * @param countUndefinedString 是否考處 string 值為 "undefined" 也算在內
     * @returns
     */
    undefined(val, countUndefinedString = false) {
        if (countUndefinedString) {
            return typeof val == undefined || val == "undefined";
        }
        return val == undefined;
    }
    /**
     * 判斷是否為 undefined, null, "null"
     * @param val
     * @param countNullString 是否考處 string 值為 "null" 也算在內
     * @returns
     */
    null(val, countNullString = false) {
        if (countNullString)
            return val === "null" || val == null;
        return val == null;
    }
    /**
     * 不是 null 也不是 undefined, 己初始化
     * @param val
     * @returns
     */
    initialized(val) {
        return !this.null(val) && !this.undefined(val);
    }
    /**
    *
    * 是否為空，「不包含」0， true, false
    * 以下為 empty
    *  - null
    *  - undefined
    *  - NaN
    *  - empty string ("")
    *  - {}
    *  - []
    *  不包含
    *  - false
    *  - 0
    * @param val
    * @returns
     */
    empty(val) {
        if (val === undefined || val === null) {
            return true;
        }
        if (val === 0 || val === false || val === true) {
            return false;
        }
        if (typeof val === "object") {
            const propNames = Object.getOwnPropertyNames(val);
            if (propNames.includes("length"))
                return val.length === 0;
            if (val.constructor.name === "Object" && propNames.length == 0)
                return true;
            return false;
        }
        else {
            if (val) {
                return false;
            }
            return true;
        }
    }
    axiosResponse(e) {
        if (this.initialized(e) && typeof e === "object") {
            const keys = Object.keys(e);
            return axiosKeys.every((_) => keys.includes(_));
        }
        return false;
    }
    // is.not
    get not() {
        return isnot;
    }
    get mobile() {
        var _a;
        return (_a = Is._mobile) !== null && _a !== void 0 ? _a : (Is._mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
}
exports.Is = Is;
const is = new Is();
exports.is = is;
class IsNot {
    constructor() {
        this.not = is;
    }
    type(val, name) {
        return !is.type(val, name);
    }
    undefined(val, countUndefinedString = false) {
        return !is.undefined(val, countUndefinedString);
    }
    null(val, countNullString = false) {
        return !is.null(val, countNullString);
    }
    initialized(val) {
        return !is.initialized(val);
    }
    empty(val) {
        return !is.empty(val);
    }
    array(val) {
        return !is.array(val);
    }
    string(val) {
        return !is.string(val);
    }
    get mobile() {
        return !is.mobile;
    }
    axiosResponse(e) {
        return !is.axiosResponse(e);
    }
    number(val) {
        return !is.number(val);
    }
    true(val) {
        return !is.true(val);
    }
}
const isnot = new IsNot();
exports.isnot = isnot;
//# sourceMappingURL=typeInference.js.map