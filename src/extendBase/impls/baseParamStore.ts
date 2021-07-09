import {reactive, UnwrapRef} from "~/base/vueTypes";
import {watchAndStore, WatchStoreInstance} from "~/extendBase/impls/baseStorageService";
import {APP_CONFIGS} from "~/extendBase/appConfigs";
import {asCascadeClass, is} from "~/extendBase/impls/utils/typeInferernce";
import {assert} from "~/extendBase/impls/utils/assert";
import {TParamStoreState} from "~/extendBase/paramStoreTypes";
import {IParamStore, TUpdateFromRouteOption} from "~/base/baseParamStore";
import {TOptional} from "~/base/baseApiTypes";


type temp = {}
export class BaseParamStore implements  IParamStore<TParamStoreState> {
  protected storage: WatchStoreInstance<any>;
  preState: TOptional<TParamStoreState>;
  state: UnwrapRef<TParamStoreState>;
  stateKeys: Partial<(keyof TParamStoreState)>[];

  constructor(
    state: Omit<TParamStoreState, 'fullPath'>,
    propToStore: (keyof TParamStoreState)[]
  ){
    this.stateKeys = Object.keys(state) as Partial<(keyof TParamStoreState)>[];
    this.preState={} as any;
    this.state = reactive(state) as any;
    this.storage = watchAndStore({
      unwrapRef: this.state,
      storage: localStorage,
      loadOnInitialize: true,
      storeIdent: `${APP_CONFIGS!.APP_IDENT}AtUI`,
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
    console.log('updateFromRoute', option);

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
    console.log('updateFromRecord', record);
    Object.keys(record).forEach((_)=>{
      // @ts-ignore
      this.state[_] = record[_];
    });
  }

  clearAll(): void{
    this.storage.clearAll();
  }
}
