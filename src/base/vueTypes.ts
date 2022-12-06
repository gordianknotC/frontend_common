
export type {
  UnwrapRef, PropType, Prop , ComponentPropsOptions,
  Ref, ComputedRef, ToRefs, ReactiveEffect, UnwrapNestedRefs, ShallowUnwrapRef,
  WatchOptions, WatchCallback
} from "vue";


export type {
  RouteLocation, Router, RouterOptions,
  RouteRecord, RouteComponent, RouteMeta, RouteParams,
} from "vue-router"

export type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]
