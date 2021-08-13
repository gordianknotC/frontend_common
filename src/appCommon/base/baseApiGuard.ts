import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {StatusCodes} from "http-status-codes";
import {TApiRedirectGuard} from "~/appCommon/base/guardianTypes";
import {Facade} from "~/appCommon/base/baseFacadeTypes";
import * as _ from "ramda";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {BaseAuthGuardHelper, BaseGeneralGuardHelper} from "~/appCommon/base/internalApiGuardHelper";
import { assert } from "../extendBase/impls/utils/assert";


export type RealAxiosError = AxiosError & {
  message?: string,
  name?: string,
  stack?: any,
}


// todo: 寫文件
export class BaseApiGuard {
  protected generalConfig: Optional<Record<StatusCodes | 0, TApiRedirectGuard[]>>;
  protected authConfig: Optional<Record<StatusCodes | 0, TApiRedirectGuard[]>>;

  /** 只記入 StatusCodes.OK, StatusCodes.NO_CONTENT*/
  protected async _responseGuard(response: AxiosResponse, setup: Record<StatusCodes | 0, TApiRedirectGuard[]>){
    const config = setup[Number(response.status!) as StatusCodes | 0];
    console.log("_responseGuard".bgBrightRed);

    if (response.status == StatusCodes.OK) {
      console.group(`response ok: ${response.config.url}`.greenBG);
      console.log(await config.first.responseHandler!(response));
      console.groupEnd();
      console.groupEnd();
      return Promise.resolve(response);
    } else  if (response.status === StatusCodes.NO_CONTENT) {
      console.warn(`no content: ${response.config.url}`);
      console.log(await config.first.responseHandler!(response));
      console.groupEnd();
      return Promise.reject(response);
    }else{
      console.warn(`non ok: ${response.config.url}`)
      console.groupEnd();
      return Promise.reject(response);
    }
  }

  async generalResponseGuard(response: AxiosResponse){
    return this._responseGuard(response, this.generalConfig!);
  }

  async authResponseGuard(response: AxiosResponse){
    return this._responseGuard(response, this.authConfig!);
  }

  protected visitStatusCodeForErrorResponse(
    error: RealAxiosError, matchedStatus: Optional<string>, setup: Record<StatusCodes | 0, TApiRedirectGuard[]>
  ){
    matchedStatus ??= "0";
    const statusCfg = setup![Number(matchedStatus) as (StatusCodes | 0)];
    const guard = statusCfg.firstWhere((_)=>(_.whereError?.(error) ?? false));
    assert(is.initialized(statusCfg), `Uncaught Api Status: ${matchedStatus}`);

    if (is.initialized(guard) && is.initialized(guard!.responseErrorHandler)){
      console.group(`reason: ${guard!.reason}`.bgGreen)
      console.groupEnd();
      return this.processErrorConfig(error, guard!);
    }else{
      try{
        assert(is.initialized(guard), `Api Guard Not Found on status: ${matchedStatus}, error: ${JSON.stringify(error)}`)
      } catch(e){
        console.log("statusCfg:", statusCfg);
        console.error(e);
      }
      console.groupEnd();
      return Promise.reject(error.response);
    }
  }

  protected async processErrorConfig(error: RealAxiosError, config: TApiRedirectGuard){
    const result = await config.responseErrorHandler!(error, error.config);
    const hasNoRedirectApiResponse = is.undefined(result);
    const hasRedirectConfig = is.not.undefined(config!.redirectAsLastResort);
    const facade = Facade.asProxy<any>();
    console.log("processErrorConfig, result: ", result, "config:", config);

    if (hasNoRedirectApiResponse){
      if (hasRedirectConfig){
        console.log("redirect to:".blueBG, config!.redirectAsLastResort);
        await facade.router.push(config!.redirectAsLastResort!);
      }else{
      }
      console.groupEnd();
      return Promise.reject(error.response);
    }else{
      console.groupEnd();
      return Promise.reject(result);
    }
  }

  protected async _errorResponseGuard(error: Optional<RealAxiosError>, setup: Record<StatusCodes | 0, TApiRedirectGuard[]>){
    /** 有 response */
    const isErrorResponse       = error && is.initialized(error.response);
    const isErrorWithNoResponse = error && is.initialized(error.message) && error.message.contains("Network Error");

    if (isErrorResponse) {
      const errorStatusKeys = Object.keys(setup).where((_)=> _ !== StatusCodes.OK.toString());
      const response = error!.response!;
      const matchedStatus = errorStatusKeys.firstWhere((_) => _ === response.status.toString()) ?? "0";
      console.log("generalErrorResponseGuard, isErrorResponse:", matchedStatus, "response:", response, "statusKeys:", errorStatusKeys, "setup:", setup)
      return this.visitStatusCodeForErrorResponse(error!, matchedStatus, setup);

    /** 無 response 如 network error */
    } else if (isErrorWithNoResponse) {
      console.log("Uncaught Response Error".red, error, error!.message.warn);
      console.groupEnd();
      const response: AxiosResponse = {
        config: error!.config,
        data: {
          message: error!.message,
          name: error!.name,
          stack: error!.stack
        },
        headers: error!.config.headers,
        status: 503,  // Network Error 算 503
        statusText: error!.message
      }
      return Promise.reject(response);

    /** uncaught */
    } else {
      // 斷網
      console.error("uncaught error");
      console.groupEnd();
      return Promise.reject(null);
    }
  }

  async generalErrorResponseGuard(error: Optional<RealAxiosError>){
    return this._errorResponseGuard(error, this.generalConfig!);
  }

  async authErrorResponseGuard(error: Optional<RealAxiosError>){
    return this._errorResponseGuard(error, this.authConfig!);
  }

  axiosGeneral!: ()=>AxiosInstance;
  axiosRefresh!: ()=>AxiosInstance;
  lastResponse: Optional<AxiosResponse>;
  authGuardHelper: BaseAuthGuardHelper;
  generalGuardHelper: BaseGeneralGuardHelper;

  constructor(options: {
    authGuardHelper: BaseAuthGuardHelper,
    generalGuardHelper: BaseGeneralGuardHelper,
    generalConfig: Record<StatusCodes|0, TApiRedirectGuard[]>,
    authConfig: Record<StatusCodes|0, TApiRedirectGuard[]>,
  }) {

    this.authGuardHelper = options.authGuardHelper;
    this.generalGuardHelper = options.generalGuardHelper;
    this.generalConfig = _.mergeRight(options.generalConfig, {
      [StatusCodes.OK]: [
        options.generalGuardHelper.statusOK(this)
      ] as TApiRedirectGuard[],

      [StatusCodes.NO_CONTENT]: [
        options.generalGuardHelper.statusNoContent (this)
      ] as TApiRedirectGuard[],

      [StatusCodes.UNAUTHORIZED]: [
        options.generalGuardHelper.unAuthorizedOfAccessTokenMissing(this),
        options.generalGuardHelper.unAuthorizedOfAccessTokenExpired(this),
        options.generalGuardHelper.unAuthorizedOfUserIsBlock(this),
        options.generalGuardHelper.unAuthorizedOfUserNotVerified(this),
        options.generalGuardHelper.unAuthorizedOfInvalidPermission(this)
      ] as TApiRedirectGuard[],

      /** statusOK / noContent 及錯誤之外的狀態*/
      0: [options.generalGuardHelper.statusUncaughtOK(this)]
    });

    this.authConfig = _.mergeRight(options.authConfig, {
      [StatusCodes.OK]: [
        options.authGuardHelper.statusOK(this)
      ] as TApiRedirectGuard[],

      [StatusCodes.NO_CONTENT]: [
        options.authGuardHelper.statusNoContent (this)
      ] as TApiRedirectGuard[],

      [StatusCodes.UNAUTHORIZED]: [
        options.authGuardHelper.unauthorized(this)
      ] as TApiRedirectGuard[],

      /** statusOK / noContent 及錯誤之外的狀態，即 status 200 開頭未被定義地方*/
      0: [options.authGuardHelper.statusUncaughtOK(this)]
    });
  }

  axiosInit(axiosGeneral: AxiosInstance, axiosRefresh: AxiosInstance){
    this.axiosGeneral = ()=>axiosGeneral;
    this.axiosRefresh = ()=>axiosRefresh;
  }

  updateAuthorizationToken() {
    const facade = Facade.asProxy<any>();
    this.axiosGeneral().defaults.headers.common["Authorization"] = facade.userStore.state.token ;
    this.axiosRefresh().defaults.headers.common["Authorization"] = facade.userStore.state.token ;
  };
}
