import {RouteLocationNormalized, Router} from "vue-router";
import {ComputedRef} from "~/types/base/vueTypes";
import {UnwrapRef} from "vue";
import {TOptional} from "~/types/base/baseApiTypes";

export
type TSearchReactOptions<S , P > = {
  initialState    : S,
  payloadGetter   : TSearchReactPayloadGetter<P>,
  onUpdate        : TSearchReactOnUpdate<P>,
  onBeforeRoute   : (payload: P) => RouteLocationNormalized,
  onPushRoute?    : (location: RouteLocationNormalized)=>Promise<TOptional<Router>>,
  outputField     : ComputedRef<string>,
  validationRule? : ComputedRef<string>,
}

export
type TSearchReactPayloadGetter<P> = ()=> P;

export
type TSearchReactOnUpdate<P> = (payload: P, cache?: any)=> Promise<any>;

export
interface ISearchReact<S, P> {
  state: UnwrapRef<S>;
  payloadGetter: TSearchReactPayloadGetter<P>;
  onUpdate: TSearchReactOnUpdate<P>;
  outputField: ComputedRef<string>;
  validationRule: ComputedRef<string>;
  onInput(value: string): Promise<void>;
}
