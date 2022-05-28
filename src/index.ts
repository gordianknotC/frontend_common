/**
 *      B A S E
 *
 * */



import {
  UnCaughtCondition, UncaughtEnumType, NotImplementedError,
  TypeMismatchError, InvalidUsage, UnExpectedRole
} from "~/appCommon/base/baseExceptions"


import {
  VForm,
} from "~/appCommon/types/vformTypes"


/***
 *
 *    E X T E N D
 *    B A S E
 * */

import {
  AssertMsg, AssertionError, assert,
  assertMsg as _assertMsg,
} from "~/appCommon/extendBase/impls/utils/assert";

import {
  isRefImpl, asEnum, getAccessibleProperties, asCascadeClass,
  asUnWrappedVueRefMap, UnWrappedVueRef, TUnWrapVueRef,
  addStringMappingFromNumEnum, Is,
  is as _is,
} from "~/appCommon/extendBase/impls/utils/typeInferernce";





/**
 *        M I X I N S
 *
 *
 * */
import {
  CommonMixin
} from "~/appCommon/vueMixins/common";
import {BaseFormContext, BaseFormImpl, BaseFormModel} from "~/appCommon/extendBase/baseFormImpl";
import {useBuiltIn} from "~/appCommon/base/builtinAddonsTypes";
export const is: Is = _is;
export const assertMsg: typeof _assertMsg = _assertMsg;

export {
  BaseFormImpl,
  BaseFormModel,
  BaseFormContext,
  AssertionError,
  AssertMsg,
  CommonMixin,
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
  VForm,
}

