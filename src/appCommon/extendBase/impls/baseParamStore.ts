import {reactive, UnwrapRef} from "~/appCommon/base/vueTypes";
import {watchAndStore, WatchAndStore} from "~/appCommon/extendBase/impls/baseStorageService";
import {asCascadeClass, is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {assert} from "~/appCommon/extendBase/impls/utils/assert";
import {IParamStore, TUpdateFromRouteOption} from "~/appCommon/base/baseParamStore";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {getAppConfigs} from "~/appCommon/extendBase/appConfigs";

type temp = {}

type TParams = { name: string, fullPath: string};

export class BaseParamStore<T extends TParams> implements  IParamStore<T> {
  protected storage: WatchAndStore <any>;
  preState: Optional<T>;
  state: UnwrapRef<T>;
  stateKeys: Partial<(keyof T)>[];

  constructor(
    state: Omit<T, "fullPath">,
    propToStore: (keyof T)[]
  ){
    this.stateKeys = Object.keys(state) as Partial<(keyof T)>[];
    this.preState={} as any;
    this.state = reactive(state) as any;
    this.storage = watchAndStore({
      unwrapRef: this.state as any,
      storage: localStorage,
      loadOnInitialize: true,
      storeIdent: `${getAppConfigs()!.APP_IDENT}AtUI`,
      pick: propToStore
    });

    asCascadeClass(this);
  }

  preStateInit(){
    this.stateKeys.forEach((element) => {
      // @ts-ignore
      this.preState[element] = this.state[element];
    })
  }

  /** 由 router guard 呼叫
   *  用於同步 router.currentRoute.value 內的
   *  params/query 至 paramStore
   * */
  updateFromRoute(option: TUpdateFromRouteOption) {
    console.log("updateFromRoute", option);

    const route = option.route;
    let params = route.params;
    let query = route.query;
    if (option.considerInterceptor ?? true) {

    }

    this.preStateInit();
    Object.keys(params).forEach((_)=>{
      const val = params[_] as any;
      assert(is.string(_), `invalid params type, expect string type got ${typeof _}` );
      // @ts-ignore
      this.state[_] = val;
    });

    Object.keys(query).forEach((_)=>{
      const val = query[_] as any;
      assert(is.string(_), `invalid query type, expect string type got ${typeof _}` );
      // @ts-ignore
      this.state[_] = val
    });
    this.state.name = route.name as string;
    this.state.fullPath = option.route.fullPath;
  }

  updateFromRecord(record: Record<string, any>) {
    console.log("updateFromRecord", record);
    Object.keys(record).forEach((_)=>{
      // @ts-ignore
      this.state[_] = record[_];
    });
  }

  clearAll(): void{
    this.storage.clearAll();
  }
}
