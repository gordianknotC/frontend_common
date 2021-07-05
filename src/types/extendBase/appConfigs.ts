import {DateExt, ObjectExt, useBuiltIn} from "~/types/base/builtinAddonsTypes";
import {useColors} from "~/types/colorsPlugin";
import {facade} from "~/types/extendBase/facadeTypes";
import {is} from "~/types/extendBase/impls/utils/typeInferernce";
import {numeralHelper} from "~/utils/numericHelper";
import {BaseAppConfig} from "~/types/extendBase/customConfig";

export class CustomConfig extends BaseAppConfig{}

const _CUSTOM_CONFIG = new CustomConfig();


export const APP_CONFIGS = _CUSTOM_CONFIG;

export function appConfigInit(){
  useBuiltIn();
  useColors();
  if (APP_CONFIGS.isInTestMode && APP_CONFIGS.EXPOSE_GLOBALS){
    //@ts-ignore
    window.facade = facade;
    //@ts-ignore
    window.APP_CONFIGS = APP_CONFIGS;
    //@ts-ignore
    window.is = is;
    //@ts-ignore
    window.DateExt = DateExt;
    //@ts-ignore
    window.numeralHelper = numeralHelper;
  }
}
