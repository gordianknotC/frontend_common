import {Optional} from "~/appCommon/base/baseApiTypes";

export enum EStorageType{
  sessionStorage,
  localStorage
}

export abstract class IStoreService<S> {
  abstract setUserModel(model: Partial<S>): void;
  abstract clearUserData(exceptionList?: Partial<keyof S>[]): void;
  abstract getUserData(): S;
  abstract info(): void;
  abstract setAuthDate(state: S): void;
}

export abstract class IStoreHelper<T> {
  abstract _cached?: T;
  abstract _converter: (val: string) => T;
  abstract _defaults: string;
  abstract _onRead:  (data: Optional<string>)=> Optional<string>;
  abstract _onWrite: (data: string)=> string;
  abstract key: string;
  abstract set(val: string, storage?: Storage): void;
  abstract get(storage?: Storage): Partial<T>;
  abstract clear(storage?: Storage): void;
}
