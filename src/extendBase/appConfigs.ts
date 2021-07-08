import {DateExt, useBuiltIn} from "~/base/builtinAddonsTypes";
import {useColors} from "~/colorsPlugin";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import {IBaseAppConfig} from "~/base/baseAppConfigTypes";
import {TOptional} from "~/base/baseApiTypes";

export let APP_CONFIGS: TOptional<IBaseAppConfig<any>>;

export function appConfigInit<T>(config: IBaseAppConfig<T>){
  APP_CONFIGS = config;
  useBuiltIn();
  useColors();
  if (APP_CONFIGS!.isInTestMode && APP_CONFIGS!.EXPOSE_GLOBALS){
    //@ts-ignore
    window.facade = facade;
    //@ts-ignore
    window.APP_CONFIGS = APP_CONFIGS;
    //@ts-ignore
    window.is = is;
    //@ts-ignore
    window.DateExt = DateExt;
  }
}
