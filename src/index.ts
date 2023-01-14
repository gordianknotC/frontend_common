"use strict";

export {
  _computed,
  _ref,
  _reactive,
  _watch,
} from "~/extension/extension_setup";
export type {
  UnwrapRef,
  PropType,
  Prop,
  ComponentPropsOptions,
  Ref,
  ComputedRef,
  ToRefs,
  ReactiveEffect,
  UnwrapNestedRefs,
  ShallowUnwrapRef,
  WatchOptions,
  WatchCallback,
  RouteLocation,
  Router,
  RouterOptions,
  RouteRecord,
  RouteComponent,
  RouteMeta,
  RouteParams,
  AtLeastOne,
} from "~/base/vueTypes";

/**
 *
 *      B A S E types
 *
 * */

export {
  UnCaughtCondition,
  UncaughtEnumType,
  NotImplementedError,
  TypeMismatchError,
  InvalidUsageError,
  UnExpectedError,
} from "~/base/baseExceptions";

/***
 *
 *    U T I L S
 *
 * */

export { AssertMsg, AssertionError, assert } from "~/utils/assert";

export {
  isRefImpl,
  asEnum,
  getAccessibleProperties,
  flattenInstance,
  asUnWrappedVueRefMap,
  UnWrappedVueRef,
  asMapFromNumberedEnum as addStringMappingFromNumEnum,
  Is,
  getOmitsBy,
} from "~/utils/typeInference";

export type { 
  TUnWrapVueRef, InterfaceIs
 } from "~/utils/typeInference";
export type { 
  QueueItem, 
  /** @deprecated use IAsyncQueue instead */
  IAsyncQueue as IQueue, 
  IAsyncQueue,
  IQueueConsumer 
} from "~/utils/queue";
export { 
  /** @deprecated use AsyncQueue instead */
  AsyncQueue as Queue, 
  AsyncQueue, SequencedQueueConsumer
 } from "~/utils/queue";
export { Completer } from "~/utils/completer";

/**
 *
 *        C O R E
 *
 * */
export { Obj, Arr, ArrayDelegate, ObjDelegate } from "~/base/builtinTypes";
export { assertMsg } from "~/utils/assert";
export { is } from "~/utils/typeInference";
export {
  IFacade,
  provideFacade,
  CommonMixin,
  injectDependency,
  provideDependency,
  injectFacade,
} from "~/vueMixins/common";
export type {
  ProviderParams
} from "~/vueMixins/common";
export { LazyHolder, CallableDelegate as Callable } from "~/utils/lazy";
export {
  setupComputed,
  setupRef,
  setupWatch,
  setupReactive,
  setupCurrentEnv,
} from "~/extension/extension_setup";

export {
  Logger,
} from "~/utils/logger";

export type {
  LogRecord,
  LogOption,
  ColorNames,
  AllowedModule,
  AllowedLoggerByEnv,
  RawAllowedLogger,
  RawAllowedLoggerByEnv,
  ColorConfig,
  LoggerAllowanceMode
} from "~/utils/logger.types";

export type {
  ELevel,
} from "~/utils/logger.types";

