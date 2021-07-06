import {DateExt, useBuiltIn} from "~/types/base/builtinAddonsTypes";
import {useColors} from "~/types/colorsPlugin";
import {is} from "~/types/extendBase/impls/utils/typeInferernce";
import {IBaseAppConfig} from "~/types/base/baseAppConfigTypes";
import {TOptional} from "~/types/base/baseApiTypes";

export let APP_CONFIGS: TOptional<IBaseAppConfig<any>>;

export function appConfigInit<T>(config: IBaseAppConfig<T>){
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
