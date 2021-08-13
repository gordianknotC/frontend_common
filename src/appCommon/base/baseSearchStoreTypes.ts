import {RouteLocationNormalized, Router} from "vue-router";
import {ComputedRef} from "~/appCommon/base/vueTypes";
import {UnwrapRef} from "vue";
import {Optional} from "~/appCommon/base/baseApiTypes";

export
type TSearchStoreOptions<S , P > = {
  initialState    : S,
  payloadGetter   : TSearchStorePayloadGetter<P>,
  onUpdate        : TSearchStoreOnUpdate<P>,
  onBeforeRoute   : (payload: P) => RouteLocationNormalized,
  onPushRoute?    : (location: RouteLocationNormalized)=>Promise<Optional<Router>>,
  outputField     : ComputedRef<string>,
  validationRule? : ComputedRef<string>,
}

export
type TSearchStorePayloadGetter<P> = ()=> P;

export
type TSearchStoreOnUpdate<P> = (payload: P, cache?: any)=> Promise<any>;

export
interface ISearchStore<S, P> {
  state: UnwrapRef<S>;
  payloadGetter: TSearchStorePayloadGetter<P>;
  onUpdate: TSearchStoreOnUpdate<P>;
  outputField: ComputedRef<string>;
  validationRule: ComputedRef<string>;
  onInput(value: string): Promise<void>;
}
