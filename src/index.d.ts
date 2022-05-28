/**
 *      B A S E
 *
 * */
import { UnCaughtCondition, UncaughtEnumType, NotImplementedError, TypeMismatchError, InvalidUsage, UnExpectedRole } from "~/appCommon/base/baseExceptions";
/***
 *
 *    E X T E N D
 *    B A S E
 * */
import { AssertMsg, AssertionError, assert, assertMsg as _assertMsg } from "~/appCommon/extendBase/impls/utils/assert";
import { isRefImpl, asEnum, getAccessibleProperties, asCascadeClass, asUnWrappedVueRefMap, UnWrappedVueRef, TUnWrapVueRef, addStringMappingFromNumEnum, Is, InterfaceIs } from "~/appCommon/extendBase/impls/utils/typeInferernce";
/**
 *        M I X I N S
 *
 *
 * */
import { useBuiltIn } from "~/appCommon/base/builtinAddonsTypes";
export declare const is: InterfaceIs;
export declare const assertMsg: typeof _assertMsg;
export { AssertionError, AssertMsg, InvalidUsage, Is, NotImplementedError, TypeMismatchError, UnCaughtCondition, UncaughtEnumType, UnExpectedRole, addStringMappingFromNumEnum, asCascadeClass, asEnum, assert, asUnWrappedVueRefMap, getAccessibleProperties, isRefImpl, UnWrappedVueRef, useBuiltIn, TUnWrapVueRef, InterfaceIs, };
