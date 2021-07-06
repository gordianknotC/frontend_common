import {RouteLocation, RouteLocationNormalized, RouteLocationRaw, Router, RouteRecord} from "vue-router";
import {is} from "~/types/extendBase/impls/utils/typeInferernce";
import {AxiosRequestConfig, AxiosResponse, AxiosStatic} from "axios";
import {RouteLocationObject} from "~/types/base/vueTypes";
import {TDataResponse, TErrorResponse, TOptional} from "~/types/base/baseApiTypes";
import {Facade, IFacade} from "~/types/base/baseFacadeTypes";

export type TApiCaller<T> = () => Promise<T>;
export type TKeeperOption = {
  keeper: IParamKeeper,
  clearAfterRoute?: boolean,
}

export enum ERedirectReason{
  accessTokenExpired="accessTokenExpired",
  noAuthToken="noAuthToken",
  unVerifiedUser="unVerifiedUser"
}

export enum EApiForwardingStage{
  none,
  forwarding,
}



export class Doer{
  constructor(
    public action: (input: any)=>void
  ){}
}

export class CalleeHolder{
  key: symbol;
  keeper: TOptional<IParamKeeper>;
  url: TOptional<string>;
  constructor(
    public call: TApiCaller<any>,
  ){
    this.key = Symbol();
  }
}

export abstract class IParamKeeper {
  abstract params: string[];
  abstract query: string[];
  abstract and(keeper: IParamKeeper): IParamKeeper;
}

export abstract class IRouterInterceptor {
  abstract readonly lastRoute: TOptional<RouteRecord>;
  abstract install(router: Router): void
}

export abstract class IBaseRouterGuard{
  abstract nextGuard: TOptional<IBaseRouterGuard>
  abstract canGoNext(to: RouteLocationNormalized): boolean;
  abstract redirectTo(to: RouteLocationNormalized): RouteLocationObject;
  /**
   * return undefined for allowing next route
   * return location for blocking current route and redirect it.
   *
   * */
  guard(to: RouteLocationNormalized): TOptional<RouteLocationObject>{
    console.log('guard:', to, 'canGoNext:', this.canGoNext(to));
    if (this.canGoNext(to)){
      if (is.initialized(this.nextGuard))
        return this.nextGuard!.guard(to);
      return undefined;
    }else{
      return this.redirectTo(to);
    }
  }
}

export type TRedirectGuard = {
  reason: string;
  errorCodes: number[];
  // canGoNext(): boolean;
  redirectAsLastResort: RouteLocationRaw;
  handler(
    error: TErrorResponse,
    axios: AxiosStatic,
    request: AxiosRequestConfig,
    prevRequest: AxiosRequestConfig
  ): Promise<TErrorResponse | TDataResponse<any>>;
}



export class BaseApiRequestChain{
  _chains: BaseApiRequestChain[];

  get stage(): EApiForwardingStage{
    if (this._chains.length == 1)
      return EApiForwardingStage.none;
    return EApiForwardingStage.forwarding;
  }

  get next(): TOptional<BaseApiRequestChain> {
    if (this._chains.last === this)
      return undefined;
    return this._chains[this._chains.indexOf(this) + 1];
  }

  get prev(): TOptional<BaseApiRequestChain> {
    if (this._chains.first === this)
      return undefined;
    return this._chains[this._chains.indexOf(this) - 1];
  }

  get isRoot(): boolean{
    return this === this.root;
  }

  get root(): BaseApiRequestChain{
    return this._chains.first;
  }

  constructor(
    public request: AxiosRequestConfig,
  ) {
    this._chains = [this];
  }

  add(member: BaseApiRequestChain){
    member._chains = this._chains;
    this._chains.add(member);
  }

  isSameRequest(request: AxiosRequestConfig): boolean{
    return this.request.url === request.url;
  }
}

//
// abstract / implmentation
// IBaseName / BaseImpl
export abstract class BaseApiRedirectGuard{
  static REDIRECT_GUARDS: Set<BaseApiRedirectGuard> = new Set();
  static addRedirectGuards(guards: Set<BaseApiRedirectGuard>){
    guards.forEach((v)=>{
      BaseApiRedirectGuard.REDIRECT_GUARDS.add(v);
    });
  }

  protected chain: TOptional<BaseApiRequestChain>;

  protected get stage(): EApiForwardingStage{
    if (is.undefined(this.chain))
      return EApiForwardingStage.none;
    return this.chain!.stage;
  };

  protected constructor(
    public config: TRedirectGuard[]
  ){}

  /** 重設當前 chain，由 user 呼叫，如直接由 apiService 呼叫 **/
  feedExternalRequest(request: AxiosRequestConfig){
    this.chain = new BaseApiRequestChain(request);
  }

  /** 由 axios interceptor 內部呼叫，不經由 apiService **/
  feedInternalRequest(request: AxiosRequestConfig){
    if (is.initialized(this.chain) &&  !this.chain!.isSameRequest(request))
      this.chain!.add(new BaseApiRequestChain(request));
  }

  private async getRedirectResult(
    request: AxiosRequestConfig,
    rule: TRedirectGuard,
    errorResponse: TErrorResponse,
    axios: AxiosStatic,
  ): Promise<any> {
    const facade = Facade.asProxy<IFacade>();
    const prevRequest = (this.chain?.prev ?? this.chain?.root)?.request;
    let result:any = errorResponse;

    if (is.initialized(this.chain) && !this.chain!.isSameRequest(request)){
      console.group(`REDIRECT - ${request.url}`.bgBlue)
      console.log('errorCodes     :'.brightBlue, rule.errorCodes, errorResponse.error_code, this.chain);
      console.log('redirect reason:'.brightBlue, rule.reason);

      result =  await rule.handler(errorResponse, axios, request, prevRequest!);
      console.log('result         :'.brightBlue, result)
      console.groupEnd();

      if (facade.apiService.isErrorResponse(result))
        return Promise.reject(result);
    }else {
      console.log('block same route:', prevRequest?.url, request.url);
      if (facade.router.currentRoute.value.name !== (rule.redirectAsLastResort as any).name ){
        await facade.router.push(rule.redirectAsLastResort);
      }
    }

    return result;
  }

  async feedErrorResponse(axios: AxiosStatic, error: {response: AxiosResponse<TErrorResponse>}): Promise<any>{
    console.log('error:', error);
    console.log('response:', error.response);
    const facade = Facade.asProxy<IFacade>();
    const errorResponse = error.response.data;
    if (is.initialized(this.chain)){
      for (let i = 0; i < this.config.length; i++) {
        const rule = this.config[i];
        if (rule.errorCodes.includes(errorResponse.error_code)){
          const request     = this.chain!.request;
          const prevRequest = (this.chain!.prev ?? this.chain!.root).request;
          if (this.chain!.stage === EApiForwardingStage.forwarding){
            console.log('forwarding, rule:', rule.errorCodes, rule.reason);
            if (this.chain!.isSameRequest(prevRequest)) {
              const fromRoute = facade.router.currentRoute.value.fullPath;
              const toRoute = (rule.redirectAsLastResort as RouteLocation).fullPath;
              if (fromRoute != toRoute) {
                console.log('redirectAsLastResort: ', rule.redirectAsLastResort);
                await facade.router.push(rule.redirectAsLastResort);
                return Promise.reject(errorResponse);
              }
            }else{
              console.log('1');
              return this.getRedirectResult(request, rule, errorResponse, axios);
            }
          }else{
            console.log('2');
            return this.getRedirectResult(request, rule, errorResponse, axios);
          }
        }
      }
    }
    console.log('3');
    return Promise.reject(errorResponse);
  }
}

