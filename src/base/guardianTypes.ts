import {RouteLocation, RouteLocationNormalized, RouteLocationRaw, Router, RouteRecord} from "vue-router";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {RouteLocationObject} from "~/base/vueTypes";
import {TDataResponse, TErrorResponse, TOptional} from "~/base/baseApiTypes";

export enum ERedirectReason{
  accessTokenExpired="accessTokenExpired",
  noAuthToken="noAuthToken",
  unVerifiedUser="unVerifiedUser"
}

export enum EApiForwardingStage{
  none,
  forwarding,
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


export enum EApiGuardType{
  general, auth
}



export type TApiRedirectGuard = {
  reason?: string;
  redirectAsLastResort?: RouteLocationRaw;
  /**
   *  用於截取 response error 以判定下一部異常處理該該向何處,
   *  當 return true 時， 會將程式流程傳至 @link {TApiRedirectGuard.responseHandler},
   *  當 return false時， 程式流程會讀取後續的異常處理設定
   *
   *  @param error - AxiosError
   * */
  whereError?(error: AxiosError):boolean;
  responseHandler?(
    response: AxiosResponse
  ): Promise<any>;
  /**
   *  用於處理當 api response 發生內外部錯誤時。
   *  --------------------------------------------------------
   *  @param error   - axios error
   *  @param request - 指向 request config
   *  @return
   *    返回 null (Promise<void>）時，代表繼續傳遞之前的 response
   *    返回 非 null 時，代表以返回值替代之前傳遞的 response
  * */
  responseErrorHandler?(
    error: AxiosError,
    request: AxiosRequestConfig,
  ): Promise<TErrorResponse | TDataResponse<any> | void>;
}

