import {getOmitsBy, is} from "~/appCommon/extendBase/impls/utils/typeInferernce";

import {EStorageType, IStoreService} from "~/appCommon/base/jsonStoreServiceType";
import {StoreHelper} from "~/appCommon/base/storeHelper";
import {AtLeastOne, watch, watchEffect} from "~/appCommon/base/vueTypes";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {IBaseAppConfig} from "~/appCommon/base/baseAppConfigTypes";
import * as _ from "ramda";

const localStorage = window.localStorage;
const sessionStorage = window.sessionStorage;


/** 用於儲存非UI狀態
 *  UI 狀態使用 vuex plugin: vuejs-storage 自動儲存
 *  */
export class BaseStorageService<S> implements IStoreService<S> {
  readonly _helper: StoreHelper<S>;

  constructor(
    public key: string,
    public APP_CONFIGS: IBaseAppConfig<S>,
    onRead: (data: Optional<string>)=>Optional<string>,
    onWrite: (data: string) => string,
  ) {
    const self = this;
    this._helper = new StoreHelper({
      key: this.key,
      converter: function (val: string) {
        try{
          if (is.empty(val)){
            return self.userModelReader([])
          }else{
            const obj = JSON.parse(val);
            return self.userModelReader(_.toPairs(obj));
          }
        }catch(e){
          console.error("parse error:", val);
          throw e;
        }
      },
      defaults: JSON.stringify(this.APP_CONFIGS.DEFAULT_MODELS.USER),
      type: EStorageType.sessionStorage,
      onRead(data){
        try{
          return onRead(data);
        }catch(e){
          console.error(e);
          return data;
        }
      },
      onWrite(data){
        try{
          return onWrite(data);
        }catch(e){
          console.error(e);
          return data;
        }
      }
    });
  }

  /** 當 token 為空時設值 */
  setAuthDate(state: S){
    throw new NotImplementedError();
  }

  protected userModelReader(pairs: (string[])[]): S {
    const result: S = _.clone(this.APP_CONFIGS.DEFAULT_MODELS.USER) as any as S;
    pairs.forEach((pair) => {
      const key = pair.first as keyof S;
      result[key] = pair.last as any as S[keyof S];
    });

    this.setAuthDate(result);
    return result;
  }

  getUserData(): S {
    const staticData = this._helper.get(localStorage);
    const sessionData = this._helper.get(sessionStorage);
    const result = staticData as any as S;
    return (result ?? _.clone(this.APP_CONFIGS.DEFAULT_MODELS.USER)) as any as S;
  }

  setUserModel(model: Partial<S>): void {
    this._helper.set(JSON.stringify(model));
  }

  clearUserData(exceptionList?: Partial<keyof S>[]) {
    if (is.undefined(exceptionList) || is.empty(exceptionList)){
      this._helper.clear(undefined);
    }else {
      const userData = getOmitsBy(this.getUserData(), exceptionList!);
      this._helper.clear(undefined);
      this.setUserModel(userData);
    }
  }

  info() {
    const C = console;
    C.group(":::: webstorage ::::")
    C.group(" > localStroage:");
    C.groupEnd()
    C.group(" > sessionStorage:");
    C.info("userData", this.getUserData(), sessionStorage.getItem(this.key))
    C.groupEnd()
    C.groupEnd();
  }
}

type TWatchAndStorePicker<T> = {
  omits: Partial<keyof T>[],
  pick: Partial<keyof T>[],
}

type TWatchAndStore<T> = {
  unwrapRef: Partial<T>,
  defaults?: T,
  storage: Storage,
  storeIdent: string,
  loadOnInitialize: boolean,
  onLoadVal?: (key: string, value: any)=>void,
} & AtLeastOne<TWatchAndStorePicker<T>>



export class WatchAndStore<T extends object> {
  propsToWatch: (keyof T)[];

  constructor(public option: TWatchAndStore<T>){
    const {unwrapRef, omits, pick, storage, storeIdent, loadOnInitialize, defaults} = option;
    const keys: (keyof T)[] = Object.keys(unwrapRef) as (keyof T)[];
    this.propsToWatch = [];

    if (is.initialized(omits)){
      this.propsToWatch = keys.where((_)=> !omits!.includes(_ as any));

    }else if (is.initialized(pick)){
      this.propsToWatch = keys.where((_)=> pick!.includes(_ as any))
    }

    if (loadOnInitialize){
      this.propsToWatch.forEach((element) => {
        // note: 當存入的值為 undefined 或 JSON.parse 錯誤時 ...
        try{
          const val = this.getItem(element) ?? defaults?.[element as keyof typeof unwrapRef] ?? undefined;
          unwrapRef[element as keyof typeof unwrapRef] = val
          option.onLoadVal?.(element as string, val);
        }catch(e){
          unwrapRef[element as keyof typeof unwrapRef] = undefined;
        }
      });
    }

    this.propsToWatch.forEach((element) => {
      watch(()=>unwrapRef[element as keyof typeof unwrapRef], ()=>{
        const state = unwrapRef[element as keyof typeof unwrapRef];
        storage.setItem(`${storeIdent}_${element}`, JSON.stringify(state));
      })
    });
  }

  // untested:
  getPropKey(prop: keyof T){
    return `${this.option.storeIdent}_${prop}`;
  }

  // untested:
  getItem(prop: keyof T): Optional<T[keyof T]>{
    try{
      return JSON.parse(this.option.storage.getItem(this.getPropKey(prop)) as string);
    } catch(e){
      return undefined;
    }
  }

  // untested:
  clearAll(){
    this.propsToWatch.forEach((element) => {
      this.clearProp(element);
    })
  }

  // untested:
  clearProp(prop: keyof T){
    this.option.storage.removeItem(this.getPropKey(prop));
  }
}


/** 僅用於非敏感資料，如 UI 狀態，user data可能需要整包加密
 *  所以使用 json dump {@link WebStorageService} 方式
 * */
export function watchAndStore<T extends object>(option: TWatchAndStore<T>): WatchAndStore<T>{
  return new WatchAndStore(option);
}

