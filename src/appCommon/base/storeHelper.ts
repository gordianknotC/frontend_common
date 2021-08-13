import {EStorageType, IStoreHelper} from "~/appCommon/base/jsonStoreServiceType";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {Optional} from "~/appCommon/base/baseApiTypes";

type TStoreParam<T> = {
  key: string;
  converter: (val: string) => T;
  defaults: string;
  type?: EStorageType;
  onRead?: (v: Optional<string>)=>Optional<string>;
  onWrite?: (v: string)=>string;
}

export class StoreHelper<T> implements IStoreHelper<T> {
  _cached?: T;
  readonly key: string;
  readonly _converter: (val: string) => T;
  readonly _defaults: string;
  readonly _onRead:  (data: Optional<string>)=> Optional<string>;
  readonly _onWrite: (data: string)=> string;
  constructor(param: TStoreParam<T>) {
    this.key = param.key;
    this._converter = param.converter;
    this._defaults = param.defaults;
    this._onRead = param.onRead ?? function(data){return data};
    this._onWrite = param.onWrite ?? function(data){return data};
  }

  private getVal(storage?: Storage): Optional<string>{
    storage ??= localStorage;
    const result =  storage.getItem(this.key);
    return this._onRead(result);
  }

  private setVal(key: string, val: string, storage: Storage) {
    storage.setItem(key, this._onWrite(val));
  }

  set(val: string, storage?: Storage): void {
    storage ??= localStorage;
    this.setVal(this.key, val, storage);
    this._cached = this._converter(val);
  }

  get(storage?: Storage): Partial<T> {
    storage ??= localStorage;
    if (is.not.initialized(this._cached)) {
      const val = this.getVal(storage);
      if (is.not.initialized(val)) {
        this.set(this._defaults);
        return this._converter(this._defaults);
      } else {
        return this._cached = this._converter(val!);
      }
    } else {
      return this._cached!;
    }
  }

  clear(storage?: Storage){
    storage ??= localStorage;
    storage.clear();
  }
}
