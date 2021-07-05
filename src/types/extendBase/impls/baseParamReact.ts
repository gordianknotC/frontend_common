import {reactive, UnwrapRef} from "~/types/base/vueTypes";
import {watchAndStore} from "~/types/extendBase/impls/baseStorageService";
import {APP_CONFIGS} from "~/types/extendBase/appConfigs";
import {asCascadeClass, is} from "~/types/extendBase/impls/utils/typeInferernce";
import {assert} from "~/types/extendBase/impls/utils/assert";
import {TParamReactState} from "~/types/extendBase/paramReactTypes";
import {IParamReact, TUpdateFromRouteOption} from "~/types/base/baseParamReact";
import {TOptional} from "~/types/base/baseApiTypes";

export class BaseParamReact implements  IParamReact<TParamReactState> {
  preState: TOptional<TParamReactState>;
  state: UnwrapRef<TParamReactState>;
  stateKeys: Partial<(keyof TParamReactState)>[];
  constructor(
    state: Omit<TParamReactState, 'fullPath'>,
    propToStore: (keyof TParamReactState)[]
  ){
    this.stateKeys = Object.keys(state) as Partial<(keyof TParamReactState)>[];
    this.preState={} as any;
    this.state = reactive(state) as any;

    watchAndStore({
      unwrapRef: this.state,
      storage: localStorage,
      loadOnInitialize: true,
      storeIdent: `${APP_CONFIGS.APP_IDENT}AtUI`,
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
   *  params/query 至 paramReact
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
}
