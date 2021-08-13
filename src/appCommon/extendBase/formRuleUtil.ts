//@ts-ignore
import v8n from "v8n";
import {VForm} from "~/appCommon/types/vformTypes";
import emailValidator from 'email-validator';

import TFormRules = VForm.TFormRules;
import TFormRuleHandler = VForm.TFormRuleHandler;
import { assert } from "./impls/utils/assert";
import {mapObjIndexed} from "ramda";
import {computed} from "~/appCommon/base/vueTypes";

export enum EBaseValidationRules {
  allUserPattern = "allUserPattern",
  bail = 'bail',
  greater="greater",
  lesser="lesser",
  confirm = 'confirm',
  email = 'email',
  remark = 'remark',
  notEqual = "notEqual",
  optional = 'optional',
  phone = 'phone',
  pwdLength = "pwdLength",
  pwdPattern = "pwdPattern",
  required = 'required',
  searchLength = 'searchLength',
  nickLength = 'nickLength',
  userLength = "userLength",
  amountLength="amountLength",
  userPattern = "userPattern",
  decimalPattern="decimalPattern",
  intPattern="intPattern"
}
// 00311  12344
const PWD_PATTERN = /[a-zA-Z0-9#_\-]+/g;
const USER_PATTERN = /[a-zA-Z0-9\-]+/g;
const ALL_USER_PATTERN = /[a-zA-Z0-9_\-]+/g;
const DECIMAL_PATTERN = /([1-9][0-9\/.,]*[0-9]$)|([0-9])/g;
const INT_PATTERN = /([1-9][0-9,]*[0-9]$)|([0-9])/g;


v8n.extend({
  pattern(expect: RegExp) {
    return function (value: any) {
      if (expect.global) {
        const matches = [...value.matchAll(expect)];
        return matches.first[0].length == value.length;
        // console.log('1match pattern...', result);
        // return result;
      } else {
        return value.test(expect);
        // console.log('2match pattern...', result);
        // return result;
      }
    }
  }
})




/** 同樣適用於 vue_formula, 規則同於 vue_formula*/
const formRules = {
  /** 無 rule*/
  [EBaseValidationRules.optional](ctx, ...args: any) {
    return true;
  },
  /** 必填*/
  [EBaseValidationRules.required](ctx, ...args: any) {
    return v8n().not.empty().test(ctx.value);
  },
  /** 可容許多個錯誤 */
  [EBaseValidationRules.bail](ctx, ...args: any) {
    ctx.displayOption.showMultipleErrors = true;
    return true;
  },
  /** 大小寫英文數字(底線、減號、井號) 8-30字*/
  [EBaseValidationRules.pwdPattern](ctx, ...args: any[]) {
    return v8n()
      .pattern(PWD_PATTERN)
      .test(ctx.value);
  },
  /**8-30字*/
  [EBaseValidationRules.pwdLength](ctx, ...args: any[]) {
    return v8n()
      .length(8, 30)
      .test(ctx.value);
  },
  /** 當欄位名為 sampleField_confirm, 則可用來匹配 欄位名 sampleFIeld */
  [EBaseValidationRules.confirm](ctx, ...args: any[]) {
    const name      = ctx.name;
    const targetName = name.split('_confirm').first;
    const targetField =  ctx.model.getFieldByFieldName(targetName);
    const targetVal   = targetField.value;

    ctx.model.linkFields({
      master: {name: ctx.name as any, dataKey: ctx.dataKey},
      slave: {name: targetField.name, dataKey: targetField.dataKey}
    })

    console.log('name:', name, 'val:', ctx.value, 'targetName', targetName, 'targetVal:', targetVal, 'model:', ctx.model);
    return targetVal == ctx.value;
  },
  /** 用法和 confirm 一樣，只要找到 field name suffixed with _notEqual
   *  就代表其 prefix 為 notEqual 的比較對象
   * */
  [EBaseValidationRules.notEqual](ctx, ...args: any[]) {
    const name      = ctx.name;
    const targetName = name.split('_notEqual').first;
    const targetField =  ctx.model.getFieldByFieldName(targetName);
    const targetVal   = targetField.value;

    ctx.model.linkFields({
      master: {name: ctx.name as any, dataKey: ctx.dataKey},
      slave: {name: targetField.name, dataKey: targetField.dataKey}
    })

    console.log('name:', name, 'val:', ctx.value, 'targetName', targetName, 'targetVal:', targetVal, 'model:', ctx.model);
    return targetVal != ctx.value;
  },
  [EBaseValidationRules.email](ctx, ...args) {
    return emailValidator.validate(ctx.value);
  },
  [EBaseValidationRules.phone](ctx, ...args) {
    ctx.value = args[1].number;
    return args[1].isValid;
  },
  /** 大小寫英文數字減號 */
  [EBaseValidationRules.userPattern](ctx, ...args) {
    return v8n()
      .pattern(USER_PATTERN)
      .test(ctx.value);
  },

  [EBaseValidationRules.decimalPattern](ctx, ...args) {
    return v8n()
      .pattern(DECIMAL_PATTERN)
      .test(ctx.value);
  },

  [EBaseValidationRules.intPattern](ctx, ...args) {
    return v8n()
      .pattern(INT_PATTERN)
      .test(ctx.value);
  },

  [EBaseValidationRules.amountLength](ctx, ...args){
    return v8n()
      .length(4, 10)
      .test(ctx.value);
  },
  /** 大小寫英文數字減號（底線：助理帳號專用） */
  [EBaseValidationRules.allUserPattern](ctx, ...args) {
    return v8n()
      .pattern(ALL_USER_PATTERN)
      .test(ctx.value);
  },
  /**  5-30字*/
  [EBaseValidationRules.userLength](ctx, ...args) {
    return v8n()
      .length(5, 30)
      .test(ctx.value);
  },
  [EBaseValidationRules.nickLength](ctx, ...args) {
    return v8n()
      .length(1, 10)
      .test(ctx.value);
  },
  /**  3字*/
  [EBaseValidationRules.searchLength](ctx, ...args) {
    const val = ctx.value as string;
    const arr = val.toAsciiArray();
    return arr.length >= 3 || arr.length == 0;
  },
  [EBaseValidationRules.remark](ctx, ...rags) {
    return v8n()
      .length(0, 100)
      .test(ctx.value);
  },

  // untested:
  [EBaseValidationRules.greater](ctx, ...args: any[]) {
    const name      = ctx.name;
    const lidx = name.lastIndexOf("_lesser");
    const targetName = name.substring(0, lidx);
    const targetField =  ctx.model.getFieldByFieldName(targetName);
    const targetVal   = Number(targetField.value);

    ctx.model.linkFields({
      master: {name: ctx.name as any, dataKey: ctx.dataKey},
      slave: {name: targetField.name, dataKey: targetField.dataKey}
    })

    if (isNaN(Number(ctx.value))){
      console.log("ctx:", ctx);
      ctx.value = 0;
    }

    console.log(`${name}-${targetName}`, "targetName:", targetName, "targetVal:", targetVal, "value:", ctx.value, "targetVal < ctx.value", targetVal < ctx.value);
    return targetVal < ctx.value;
  },

  // untested:
  [EBaseValidationRules.lesser](ctx, ...args: any[]) {
    const name      = ctx.name;
    const lidx = name.lastIndexOf("_lesser");
    const targetName = name.substring(0, lidx);
    const targetField =  ctx.model.getFieldByFieldName(targetName);
    const targetVal   = Number(targetField.value);

    ctx.model.linkFields({
      master: {name: ctx.name as any, dataKey: ctx.dataKey},
      slave: {name: targetField.name, dataKey: targetField.dataKey}
    })

    if (isNaN(Number(ctx.value))){
      ctx.value = 0;
    }
    console.log(`${name}-${targetName}`, "targetVal:", targetVal, "value:", ctx.value, "targetVal > ctx.value", targetVal > ctx.value);
    return targetVal > ctx.value;
  },
} as TFormRules;

export const baseFormErrorMsg = mapObjIndexed(
  (index, key, val)=> computed(()=>`undefined validation message for rule: ${index}`),
  EBaseValidationRules
);


export function addRule<T extends string>(ruleName: T, handler: TFormRuleHandler, override: boolean = false): T{
  if (!override)
    assert(!Object.keys(EBaseValidationRules).any((_)=> _ === ruleName), `Rule: ${ruleName} already defined, to ignore this message set override to "true" explicitly`);
  formRules[ruleName] =  handler;
  return ruleName;
}

export function getFormRules(){
  return formRules;
}
