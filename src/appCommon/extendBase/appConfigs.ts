import {useColors} from "~/appCommon/plugin/colorsPlugin";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {IBaseAppConfig} from "~/appCommon/base/baseAppConfigTypes";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {assert} from "~/appCommon/extendBase/impls/utils/assert";

let _APP_CONFIGS: Optional<IBaseAppConfig<any>>;

export function getAppConfigs(): IBaseAppConfig<any>{
  assert(is.initialized(_APP_CONFIGS));
  return _APP_CONFIGS!;
}

export function appConfigInit<T>(config: IBaseAppConfig<T>): IBaseAppConfig<T>{
  _APP_CONFIGS = config;
  useColors();
  return _APP_CONFIGS;
}
