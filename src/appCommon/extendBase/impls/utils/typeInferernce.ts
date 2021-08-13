import {ComputedRef, toRef} from "vue";
import {RealAxiosError} from "~/appCommon/base/baseApiGuard";
import {AxiosResponse} from "axios";
import {Optional} from "~/appCommon/base/baseApiTypes";

let refImplClassName: string = undefined as any;

/**
 * fixme: 暫時性解法
 *
 * - isRefImple 判斷無法仗用 obj.constructor.name == RefImpl
 *   since constructor name will be mangled after production build.
 *
 *  - this issue cannot be addressed even if we configure compress option as keep_classname,
 *
 * */
export function isRefImpl(obj: any) {
  if (obj === null || obj === undefined)
    return false;

  // @ts-ignore
  refImplClassName ??= toRef("").constructor.name;

  return typeof obj == "object"
    && obj?.constructor?.name === refImplClassName
    && Object.keys(obj).length == 1
    && Object.keys(obj)[0] == "value";
}


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
export function asEnum<T extends (number | string), K extends string>(obj: { [key in K]: T }): { [key in K]: T } & { [key in T]: K } {
  let result = Object.create({}) as { [key in K]: T } & { [key in T]: K };
  let prototype = Object.getPrototypeOf(result);
  Object.keys(obj).forEach((_k) => {
    const key = _k as K;
    const val = obj[key] as T;
    // @ts-ignore
    result[key] = val;
    // @ts-ignore
    prototype[val] = key;
  })
  return result;
}

export function getAccessibleProperties(obj: any, results?: Set<string>): Set<string> {
  results ??= new Set();
  let prototype = Object.getPrototypeOf(obj);
  let isRoot = false;
  Object.getOwnPropertyNames(prototype).forEach((_k) => {
    if (_k == "constructor")
      return;
    results!.add(_k);
  });

  if (Object.getPrototypeOf(prototype).constructor.name == "Object") {
    return results;
  }
  return getAccessibleProperties(prototype, results);
}

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
export function asCascadeClass(obj: any) {
  const properties = getAccessibleProperties(obj);
  properties.forEach((property) => {
    const val = obj[property];
    if (typeof val == "function") {
      obj[property] = val.bind(obj);
    } else {
      obj[property] = val;
    }
  })
}

export function getOmitsBy<T>(payload: T, omits: Partial<keyof T>[]): Partial<T>{
  const result = {...payload}
  omits.forEach((e)=>{
    //@ts-ignore
    delete result[e];
  });
  return result;
}


type TRefsOfObj<T> = {
  [K in keyof T]: ComputedRef<T[K]> | T[K]
}

type TWrappedRefsOfObj<T> = {
  [K in keyof T]: T[K]
}


export type TUnWrapVueRef<T> = T;

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
export function asUnWrappedVueRefMap<T extends Object>(obj: TRefsOfObj<T>, keys: string[]): TWrappedRefsOfObj<T> {
  return new Proxy<T>({} as TWrappedRefsOfObj<T>, {
    get: function (target, name) {
      if (keys.contains(name as string)){
        return (obj[name as keyof typeof obj] as any).value;
      }
      return obj[name as keyof typeof obj];
    }
  })
}


const SYMBOLS: Record<string | symbol, string | symbol> = {};

/**
 *   UnWrap 物件內所有的 RefImpl,將其真正的 getter setter
 *   轉發至 Symbol 中
 **/
export function UnWrappedVueRef<T extends Object>(obj: T, keys?: Partial<keyof T>[]) {
  const properties: Partial<keyof T>[] = is.undefined(keys)
    ? Object.keys(obj) as Partial<keyof T>[]
    : keys!;
  properties.forEach((key) => {
    const val = obj[key as keyof typeof obj]
    console.log("UnWrappedVueRef", (val as any).constructor.name, val);

    // @ts-ignore
    if (isRefImpl(val)) {
      // @ts-ignore
      SYMBOLS[key] ??= Symbol(key);
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
export function addStringMappingFromNumEnum<N extends number,
  S extends string,
  K extends string>(
  numberEnum: { [Key in K]: N }
) {
  let result = Object.create({}) as { [key in K]: S } & { [key in K]: N };
  let prototype = Object.getPrototypeOf(result);
  Object.keys(numberEnum).forEach((_k) => {
    const key = _k as K;
    const val = numberEnum[key] as N;
    // @ts-ignore
    const isNumber = parseInt(key) == key;
    if (isNumber) {
      prototype[key] = val;
    } else {
      // @ts-ignore
      result[key] = val;
    }
  })
  return result;
}

const axiosKeys = ["data", "status", "statusText", "headers", "config"];

export class Is {
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
  type(val: Optional<any>, name: string): boolean {
    return (val?.constructor?.name == name);
  }

  true(val: any): boolean {
    return val === true;
  }

  array(val: any): boolean {
    if (typeof val === "object"){
      if (val.length === undefined || val.length === null){
        return false;
      }
      if (typeof val === "number"){
        return true;
      }
      return false;
    }
    return false;
  }

  string(val: any): boolean {
    return typeof val == "string";
  }

  number(val: any): boolean {
    return typeof val == "number";
  }

  // @param: countUndefinedString
  //         考處 string 值為 "undefined" 也算在內
  //
  undefined(val: any, countUndefinedString: boolean = false): boolean {
    if (countUndefinedString) {
      return typeof val == undefined || val == "undefined";
    }
    return val == undefined;
  }

  // @param: countNullString
  //         考處 string 值為 "null" 也算在內
  //
  null(val: any, countNullString: boolean = false): boolean {
    if (countNullString)
      return val === "null" || val == null;
    return val == null;
  }

  // 不是 null 也不是 undefined, 己初始化
  initialized(val: any): boolean {
    return !this.null(val) && !this.undefined(val);
  }

  // 是否為空，「不包含」0， true, false
  // 以下為 empty
  // - null
  // - undefined
  // - NaN
  // - empty string ("")
  // - {}
  // - []
  // 不包含
  // - false
  // - 0
  empty(val: any): boolean {
    if (val === undefined || val === null){
      return true;
    }
    if (val === 0 || val === false || val === true){
      return false;
    }
    if (typeof val === "object") {
      const propNames = Object.getOwnPropertyNames(val);
      if (propNames.includes("length"))
        return val.length === 0;

      if (val.constructor.name === "Object" && propNames.length == 0)
        return true;

      return false;
    } else {
      if (val) {
        return false;
      }
      return true;
    }
  }

  axiosResponse(e: any){
    if (this.initialized(e) && typeof e === "object" ){
      const keys = Object.keys(e);
      return axiosKeys.every((_)=> keys.contains(_));
    }
    return false;
  }

  // is.not
  get not(): IsNot {
    return isnot;
  }

  get mobile(): boolean{
    return Is._mobile ??= /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private static _mobile: boolean;
}

export const is: Is = new Is();


class IsNot {
  type(val: any, name: string): boolean {
    return !is.type(val, name);
  }

  undefined(val: any, countUndefinedString: boolean = false): boolean {
    return !is.undefined(val, countUndefinedString);
  }

  null(val: any, countNullString: boolean = false): boolean {
    return !is.null(val, countNullString);
  }

  initialized(val: any): boolean {
    return !is.initialized(val);
  }

  empty(val: any): boolean {
    return !is.empty(val);
  }

  array(val: any): boolean {
    return !is.array(val);
  }

  string(val: any): boolean {
    return !is.string(val);
  }
}

const isnot = new IsNot();
