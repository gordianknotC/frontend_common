import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {StatusCodes} from "http-status-codes";
import {TApiRedirectGuard} from "~/base/guardianTypes";
import {Facade} from "~/base/baseFacadeTypes";
import _ from "ramda";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import {TOptional} from "~/base/baseApiTypes";
import {BaseAuthApiGuardConfig, BaseGeneralApiGuardConfig} from "~/base/baseApiGuardConfig";


export class BaseApiGuard {
  private authStatusKeys: string[];
  private generalStatusKeys: string[];
  protected generalConfig: TOptional<Record<StatusCodes | "", TApiRedirectGuard[]>>;
  protected authConfig: TOptional<Record<StatusCodes | "", TApiRedirectGuard[]>>;

  async generalResponseGuard(response: AxiosResponse){
    const matched = this.authStatusKeys.firstWhere((_)=> _ === response.status.toString());
    const hasMatchedStatusHandler = is.not.undefined(matched);

    if (hasMatchedStatusHandler){
      const config = this.authConfig![matched! as (StatusCodes | "")];
      console.group(`${config.first.reason}: ${response.config.url}`.greenBG);

      await config.first.responseHandler!(response);
      console.groupEnd();
      console.groupEnd();
      return Promise.resolve(response);
    }else{
      await this.authConfig![""].first.responseHandler!(response)
      console.groupEnd();
      return Promise.resolve(response);
    }
  }

  protected processStatusConfig(error: AxiosError, matchedStatus: string){
    const allErrorConfig = this.authConfig![matchedStatus! as (StatusCodes | "")];
    const config = allErrorConfig.firstWhere((_)=>(_.whereError?.(error) ?? false));
    const hasErrorConfig = is.not.undefined(config);
    if (hasErrorConfig){
      return this.processErrorConfig(error, config!);
    }else{
      console.warn("uncaught response error:", error.response!.status, error.response!.statusText)
    }
    console.groupEnd();
    return Promise.reject(error.response);
  }

  protected async processErrorConfig(error: AxiosError, config: TApiRedirectGuard){
    const result = await config!.responseErrorHandler!(error, error.config);
    const hasNoRedirectApiResponse = is.undefined(result);
    const hasRedirectConfig = is.not.undefined(config!.redirectAsLastResort);
    const facade = Facade.asProxy<any>();

    if (hasNoRedirectApiResponse){
      if (hasRedirectConfig){
        console.log('redirect to:'.blueBG, config!.redirectAsLastResort);
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

  async generalErrorResponseGuard(error: TOptional<AxiosError>){
    if (error) {
      const response          = error.response!;
      const matchedStatus     = this.authStatusKeys.firstWhere((_)=> _ === response.status.toString());
      const hasStatusConfig   = is.not.undefined(matchedStatus);

      if (hasStatusConfig) {
        return this.processStatusConfig(error!, matchedStatus!);
      }else{
        const config = this.authConfig![""].first;
        await config.responseHandler!(response)
      }
      console.groupEnd();
      return Promise.reject(error.response);
    } else {
      // 斷網
      console.groupEnd();
      return Promise.reject(null);
    }
  }

  lastResponse: TOptional<AxiosResponse>;
  axiosGeneral: TOptional<AxiosInstance>;
  axiosRefresh: TOptional<AxiosInstance>;
  authConfigHelper: BaseAuthApiGuardConfig;
  generalConfigHelper: BaseGeneralApiGuardConfig;

  constructor(options: {
    authConfigHelper: BaseAuthApiGuardConfig,
    generalConfigHelper: BaseGeneralApiGuardConfig,
    generalGuard: Record<StatusCodes | "", TApiRedirectGuard[]>,
    authGuard: Record<StatusCodes | "", TApiRedirectGuard[]>,
    axiosGeneral: TOptional<AxiosInstance>,
    axiosRefresh: TOptional<AxiosInstance>,
  }) {
    this.generalConfig = options.generalGuard;
    this.authConfig = options.authGuard;
    this.axiosGeneral = options.axiosGeneral;
    this.axiosRefresh = options.axiosRefresh;
    this.authConfigHelper = options.authConfigHelper;
    this.generalConfigHelper = options.generalConfigHelper;

    _.mergeRight(options.generalGuard, {
      [StatusCodes.OK]: [
        options.generalConfigHelper.statusOK(this)
      ] as TApiRedirectGuard[],

      [StatusCodes.NO_CONTENT]: [
        options.generalConfigHelper.statusNoContent (this)
      ] as TApiRedirectGuard[],

      [StatusCodes.UNAUTHORIZED]: [
        options.generalConfigHelper.unAuthorizedOfAccessTokenExpired(this),
        options.generalConfigHelper.unAuthorizedOfUserIsBlock(this),
        options.generalConfigHelper.unAuthorizedOfUserNotVerified(this),
        options.generalConfigHelper.unAuthorizedOfInvalidPermission(this)
      ] as TApiRedirectGuard[],

      /** statusOK / noContent 及錯誤之外的狀態，即 status 200 開頭未被定義地方*/
      "": [options.generalConfigHelper.statusUncaughtOK(this)]
    });

    _.mergeRight(options.authGuard, {
      [StatusCodes.OK]: [
        options.authConfigHelper.statusOK(this)
      ] as TApiRedirectGuard[],

      [StatusCodes.NO_CONTENT]: [
        options.authConfigHelper.statusNoContent (this)
      ] as TApiRedirectGuard[],

      [StatusCodes.UNAUTHORIZED]: [
        options.authConfigHelper.unauthorized(this)
      ] as TApiRedirectGuard[],

      /** statusOK / noContent 及錯誤之外的狀態，即 status 200 開頭未被定義地方*/
      "": [options.authConfigHelper.statusUncaughtOK(this)]
    });

    this.authStatusKeys     = Object.keys(options.authGuard!)
    this.generalStatusKeys  = Object.keys(options.generalGuard);
  }

  updateAuthorizationToken() {
    const facade = Facade.asProxy<any>();
    this.axiosGeneral!.defaults.headers.common["Authorization"] = facade.userReact.state.token ;
    this.axiosRefresh!.defaults.headers.common["Authorization"] = facade.userReact.state.token ;
  };
}
