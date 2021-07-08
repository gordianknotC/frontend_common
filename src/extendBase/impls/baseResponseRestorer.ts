import {asCascadeClass, is} from "~/extendBase/impls/utils/typeInferernce";
import {IBaseApiService, IBaseResponseRestorer, TDataResponse} from "~/base/baseApiTypes";
import {Facade, IFacade} from "~/base/baseFacadeTypes";

export class PagerResponseRestorer implements IBaseResponseRestorer{
  restore(response: TDataResponse<any>): void {
    const facade = Facade.asProxy<IFacade>();
    console.log('responseRestorers',response.pager,  is.initialized(response.pager))
    if (is.initialized(response.pager)){
      facade.paramStore.updateFromRecord((response).pager!);
    }else{
      facade.paramStore.updateFromRecord({page: 1, pages: 1});
    }
    facade.apiService.lastResponse = [];
  }
}
