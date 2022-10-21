/**
 *      B A S E
 *
 * */
export { UnCaughtCondition, UncaughtEnumType, NotImplementedError, TypeMismatchError, InvalidUsage, UnExpectedRole } from "./base/baseExceptions";
/***
 *
 *    E X T E N D
 *    B A S E
 * */
export { AssertMsg, AssertionError, assert, } from "./utils/assert";
export { isRefImpl, asEnum, getAccessibleProperties, flattenInstance, asUnWrappedVueRefMap, UnWrappedVueRef, addStringMappingFromNumEnum, Is, } from "./utils/typeInference";
export type { TUnWrapVueRef, InterfaceIs, } from "./utils/typeInference";
/**
 *        M I X I N S
 *
 *
 * */
export { useBuiltIn, Obj, Arr } from "./base/builtinTypes";
export { assertMsg } from "./utils/assert";
export { is } from "./utils/typeInference";
export { IFacade, provideFacade, CommonMixin, injectDependency, injectFacade } from "./vueMixins/common";
export { LazyHolder } from "./utils/lazy";
