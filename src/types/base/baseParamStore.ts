
import {RouteLocation} from "vue-router";
import {UnwrapRef} from "vue";

export type TUpdateFromRouteOption ={
  route: RouteLocation,
  considerInterceptor?: boolean,
}

export abstract class IParamStore<S>{
  abstract state: UnwrapRef<S>
  abstract updateFromRoute(option: TUpdateFromRouteOption): void;
  abstract updateFromRecord(record: Record<string, any>): void;
  abstract clearAll(): void;
  abstract preStateInit(): void;
}

