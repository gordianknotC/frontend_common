/**
 *      B A S E
 *
 * */



import {
  UnCaughtCondition, UncaughtEnumType, NotImplementedError,
  TypeMismatchError, InvalidUsage, UnExpectedRole
} from "~/base/baseExceptions"




/***
 *
 *    E X T E N D
 *    B A S E
 * */

import {
  AssertMsg, AssertionError, assert,
} from "~/utils/assert";

import {
  isRefImpl, asEnum, getAccessibleProperties, asCascadeClass,
  asUnWrappedVueRefMap, UnWrappedVueRef, TUnWrapVueRef,
  addStringMappingFromNumEnum, Is, InterfaceIs,
} from "~/utils/typeInferernce";





/**
 *        M I X I N S
 *
 *
 * */
import {useBuiltIn} from "~/base/builtinAddonsTypes";
import {assertMsg as _assertMsg} from "~/utils/assert";
import {is as _is} from "~/utils/typeInferernce";

export const is: InterfaceIs = _is;
export const assertMsg: AssertMsg = _assertMsg;
export {
  AssertionError,
  AssertMsg,
  InvalidUsage,
  Is,
  NotImplementedError,
  TypeMismatchError,
  UnCaughtCondition,
  UncaughtEnumType,
  UnExpectedRole,
  //
  addStringMappingFromNumEnum,
  asCascadeClass,
  asEnum,
  assert,
  asUnWrappedVueRefMap,
  getAccessibleProperties,
  isRefImpl,
  UnWrappedVueRef,
  useBuiltIn,
  //
  TUnWrapVueRef,
  InterfaceIs,
}

