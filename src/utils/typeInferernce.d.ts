import { ComputedRef } from "vue";
/**
 * fixme: 暫時性解法
 *
 * - isRefImple 判斷無法仗用 obj.constructor.name == RefImpl
 *   since constructor name will be mangled after production build.
 *
 *  - this issue cannot be addressed even if we configure compress option as keep_classname,
 *
 * */
export declare function isRefImpl(obj: any): boolean;
/**
 *  description
 *    將 object key 存入 value, value 存入 key
 *    e.g.:
 *      object = {a: 1, b: 2}
 *      enumObj = asEnum(object)
 *      enumObj == {a: 1, b: 2, '2': 'a', '1': 'b'} // true
 *      Object.keys(object) // ['a', 'b']
 *      Object.keys(enumObj) // ['a','b']
 *
 *
 *    行為與 enum 相同，用於需要分開定義 enum 值與鍵的情境
 *    如同時需要存取 enum 的值，也需要 enum 的 key(label)
 *
 *    以下為與與enum的異同點
 *
 *    enum EA{
 *      a = 1, b = 2
 *    }
 *
 *    const EB = asEnum({
 *      a: 1, b: 2
 *    })
 *
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
export declare function getAccessibleProperties(obj: any, results?: Set<string>): Set<string>;
/**
 *  vue 若傳入有繼承關係的類別（class)，其繼承關係會消失
 *  平面化 class，用於 vue 寫 OOP
 *
 *  如 A extends Base
 *  Base 有 methodBase, propBase, propX
 *  而 A 有 propA, methodA, propX
 *  vue 會無視 methodBase, propBase
 *
 *  asCascadeClass 作用為將可存取的所有 methods / property
 *  寫入當前的 class, 使得 A 繼承至 Base 的
 *  methodBase, propBase 平面化至 A
 *
 * */
export declare function asCascadeClass(obj: any): void;
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
 **/
export declare function UnWrappedVueRef<T extends Object>(obj: T, keys?: Partial<keyof T>[]): void;
/**
 *
 *     number enum 附予 string mapping 功能
 *     ex:
 *
 *     ENum = addStringMappingFromNumEnum(enum {
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
export declare function addStringMappingFromNumEnum<N extends number, S extends string, K extends string>(numberEnum: {
    [Key in K]: N;
}): { [key in K]: S; } & { [key_1 in K]: N; };
export interface InterfaceIs {
    readonly not: InterfaceIs;
    readonly mobile: boolean;
    /**
     * 用於 type class, 有 constructor name 無法分辦
     *   1) generic class
     *   2) 非 class object (沒有 constructor name者）
     *      小心使用
     *   e.g:
     *    > is.type([], "Object") // false 讀 constructor.name
     *    > is.type([], "Array")  // true 讀 constructor.name
     *    > is.type({}, "Object") // true 讀 constructor.name
     *
     * */
    type(val: any | null | undefined, name: string): boolean;
    true(val: any): boolean;
    array(val: any): boolean;
    string(val: any): boolean;
    number(val: any): boolean;
    undefined(val: any, countUndefinedString?: boolean): boolean;
    null(val: any, countNullString: boolean): boolean;
    initialized(val: any): boolean;
    empty(val: any): boolean;
    axiosResponse(e: any): boolean;
}
export declare class Is implements InterfaceIs {
    /**
     * 用於 type class, 有 constructor name 無法分辦
     *   1) generic class
     *   2) 非 class object (沒有 constructor name者）
     *      小心使用
     *   e.g:
     *    > is.type([], "Object") // false 讀 constructor.name
     *    > is.type([], "Array")  // true 讀 constructor.name
     *    > is.type({}, "Object") // true 讀 constructor.name
     *
     * */
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
    get not(): InterfaceIs;
    get mobile(): boolean;
    private static _mobile;
}
declare const is: InterfaceIs;
declare const isnot: InterfaceIs;
export { is, isnot };
