import {asCascadeClass, is} from "~/types/extendBase/impls/utils/typeInferernce";
import {IBaseApiService, IBaseResponseRestorer, TDataResponse} from "~/types/base/baseApiTypes";
import {facade} from "~/types/extendBase/facadeTypes";

export class PagerResponseRestorer implements IBaseResponseRestorer{
  restore(response: TDataResponse<any>): void {
    console.log('responseRestorers',response.pager,  is.initialized(response.pager))
    if (is.initialized(response.pager)){
      facade.paramReact.updateFromRecord((response).pager!);
    }else{
      facade.paramReact.updateFromRecord({page: 1, pages: 1});
    }
    facade.apiService.lastResponse = [];
  }
}
