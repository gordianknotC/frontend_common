import { ComputedRef } from "~/base/vueTypes";
/**
 * 判斷是否為 vue RefImpl
 * note: 暫時性解法
 *
 * - isRefImpl 判斷無法用 obj.constructor.name == RefImpl
 *   since constructor name will be mangled after production build.
 *  - this issue cannot be addressed even if we configure compress option as keep_classname,
 *
 **/
export declare function isRefImpl(obj: any): boolean;
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
export declare function asEnum<T extends (number | string), K extends string>(obj: {
    [key in K]: T;
}): {
    [key in K]: T;
} & {
    [key in T]: K;
};
export declare function getAccessibleProperties(obj: any, isAvailable?: (name: string) => boolean, results?: Set<string>): Set<string>;
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
export declare function flattenInstance(obj: any, overrideReadonly?: boolean, rule?: (name: string) => boolean, onError?: (err: string) => void): void;
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
export declare function getOmitsBy<T>(payload: T, omits: Partial<keyof T>[]): Partial<T>;
declare type TRefsOfObj<T> = {
    [K in keyof T]: ComputedRef<T[K]> | T[K];
};
declare type TWrappedRefsOfObj<T> = {
    [K in keyof T]: T[K];
};
export declare type TUnWrapVueRef<T> = T;
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
export declare function asUnWrappedVueRefMap<T extends Object>(obj: TRefsOfObj<T>, keys: string[]): TWrappedRefsOfObj<T>;
/**
 *   UnWrap 物件內所有的 RefImpl,將其真正的 getter setter
 *   轉發至 Symbol 中
 *  @see {@link asUnWrappedVueRefMap}
 **/
export declare function UnWrappedVueRef<T extends Object>(obj: T, keys?: Partial<keyof T>[]): void;
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
export declare function asMapFromNumberedEnum<N extends number, S extends string, K extends string>(numberEnum: {
    [Key in K]: N;
}): { [key in K]: S; } & { [key_1 in K]: N; };
export interface InterfaceIs {
    readonly not: InterfaceIs;
    readonly mobile: boolean;
    type(val: any | null | undefined, name: string): boolean;
    true(val: any): boolean;
    array(val: any): boolean;
    string(val: any): boolean;
    number(val: any): boolean;
    undefined(val: any, countUndefinedString?: boolean): boolean;
    null(val: any, countNullString?: boolean): boolean;
    initialized(val: any): boolean;
    empty(val: any): boolean;
    axiosResponse(e: any): boolean;
}
/**
 *
 */
export declare class Is implements InterfaceIs {
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
    type(val: any | null | undefined, name: string): boolean;
    true(val: any): boolean;
    array(val: any): boolean;
    string(val: any): boolean;
    number(val: any): boolean;
    /**
     * 判斷是否為 undefined, null, "undefined"
     * @param val
     * @param countUndefinedString 是否考處 string 值為 "undefined" 也算在內
     * @returns
     */
    undefined(val: any, countUndefinedString?: boolean): boolean;
    /**
     * 判斷是否為 undefined, null, "null"
     * @param val
     * @param countNullString 是否考處 string 值為 "null" 也算在內
     * @returns
     */
    null(val: any, countNullString?: boolean): boolean;
    /**
     * 不是 null 也不是 undefined, 己初始化
     * @param val
     * @returns
     */
    initialized(val: any): boolean;
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
    empty(val: any): boolean;
    axiosResponse(e: any): boolean;
    get not(): InterfaceIs;
    get mobile(): boolean;
    private static _mobile;
}
declare const is: InterfaceIs;
declare const isnot: InterfaceIs;
export { is, isnot };
