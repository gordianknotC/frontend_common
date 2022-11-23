/**
 *
 *      B A S E types
 *
 * */
export { UnCaughtCondition, UncaughtEnumType, NotImplementedError, TypeMismatchError, InvalidUsage, UnExpectedRole } from "./base/baseExceptions";
/***
 *
 *    B A S E EXT
 *
 * */
export { AssertMsg, AssertionError, assert, } from "./utils/assert";
export { isRefImpl, asEnum, getAccessibleProperties, flattenInstance, asUnWrappedVueRefMap, UnWrappedVueRef, addStringMappingFromNumEnum, Is, getOmitsBy } from "./utils/typeInference";
export type { TUnWrapVueRef, InterfaceIs, } from "./utils/typeInference";
/**
 *
 *        C O R E
 *
 * */
export { useBuiltIn, Obj, Arr } from "./base/builtinTypes";
export { assertMsg } from "./utils/assert";
export { is } from "./utils/typeInference";
export { IFacade, provideFacade, CommonMixin, injectDependency, injectFacade } from "./vueMixins/common";
export { LazyHolder, CallableDelegate as Callable } from "./utils/lazy";
export { setupComputed, setupRef, setupWatch, setupReactive } from "./extension/extension_setup";
