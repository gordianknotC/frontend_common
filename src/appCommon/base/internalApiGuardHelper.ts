import {AppErrorCodes, TFuzzyResponse, Optional, TPager} from "~/appCommon/base/baseApiTypes";
import {RouteLocationRaw} from "vue-router";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {TApiRedirectGuard} from "~/appCommon/base/guardianTypes";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";
import {BaseApiGuard} from "~/appCommon/base/baseApiGuard";
import {getReasonPhrase, StatusCodes} from "http-status-codes";


export abstract class IBaseApiGuardHelper {
  abstract options: ApiGuardConfigOptions;

  abstract statusOK(guard: BaseApiGuard): TApiRedirectGuard;
  abstract statusNoContent(guard: BaseApiGuard): TApiRedirectGuard;
  abstract statusUncaughtOK(guard: BaseApiGuard): TApiRedirectGuard;

  abstract unauthorized(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfAccessTokenExpired(
    guard: BaseApiGuard,
  ): TApiRedirectGuard;
  abstract unAuthorizedOfAccessTokenMissing(
    guard: BaseApiGuard,
  ): TApiRedirectGuard;

  abstract unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard;
}

export type ApiGuardConfigOptions = {
  authTokenGetter: () => string,
  clearUserData: ()=> void,
  loginRoute: RouteLocationRaw,
  notifyError: (r: AxiosResponse) => void,
  notifyDownloading: (data: Record<string, string>) => void,
  notifyDownloaded: (r: AxiosResponse) => void,
  notifyDownloadFailed: (r: AxiosResponse) => void,
  notifySuccess: (r: AxiosResponse) => void,
  refreshAuthRequester: () => Promise<any>,
  refreshTokenGetter: () => string,
  userNotVerifiedRoute: RouteLocationRaw,
}



export class InternalApiGuardHelper implements IBaseApiGuardHelper {
  constructor(
    public options: ApiGuardConfigOptions
  ){
  }

  protected getStatusText(status: StatusCodes, name: string): string{
    if (is.undefined(status))
      return getReasonPhrase(status);
    return `${getReasonPhrase(status)} > ${name}:${status}`;
  }

  statusUncaughtOK(guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: "Uncaught OK Status",
      whereError(error: AxiosError): boolean {
        return error.response!.status! != StatusCodes.OK;
      },
      async responseHandler(response: AxiosResponse) {
        try{
          guard.lastResponse = response;
          console.warn(
            "uncaught http status:",
            response.status, response.statusText
          );
        }catch(e){
          console.error("Error on calling responseHandler, response:", response);
          throw e;
        }
      },
    }
  }

  statusOK(guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: this.getStatusText(StatusCodes.OK, "OK"),
      async responseHandler(response: AxiosResponse) {
        guard.lastResponse = response;
      },
    }
  }

  statusNoContent (guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: this.getStatusText(StatusCodes.NO_CONTENT,  "NO_CONTENT"),
      async responseHandler(response: AxiosResponse) {
        guard.lastResponse = response;
        /// fixme: 實作 response.data.data 映射
        if (is.array(response.data?.data)) {
        } else {
          response.data ??= {
            data: [],
            pager: {page: 1, pages: 1, total: 0} as TPager
          }
          response.data.data ??= [];
          response.data.pager ??= {page: 1, pages: 1, total: 0} as TPager;
        }
      }
    }
  }

  unauthorized(guard: BaseApiGuard): TApiRedirectGuard{
    throw new NotImplementedError();
  }

  unAuthorizedOfAccessTokenExpired(
    guard: BaseApiGuard,
  ): TApiRedirectGuard {
    const EErrorCode = AppErrorCodes.singleton();
    const self = this;
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED,  "ACCESS_TOKEN_EXPIRED") ,
      whereError(error) {
        const isDownloadBlob = is.type(error?.response?.data, "Blob");
        const result = is.not.undefined(error.response)
          && (
            isDownloadBlob
            || error!.response!.data.error_code === EErrorCode.ACCESS_TOKEN_EXPIRED
          );
        console.log("unAuthorizedOfAccessTokenExpired, blob:", isDownloadBlob, "result:", result);
        return result;
      },
      /** 返回 null (Promise<void>）時，代表繼續傳遞之前的 response
       *  返回 非 null 時，代表以返回值替代之前傳遞的 response
       * */
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        try{
          const originalRequest = error.config;
          const refreshToken = self.options.refreshTokenGetter();
          const hasRefreshToken = is.initialized(refreshToken) && is.not.empty(refreshToken);
          console.log("unAuthorizedOfAccessTokenExpired refresh token? ", hasRefreshToken);
          if (hasRefreshToken) {
            console.log("start refreshing token");
            await self.options.refreshAuthRequester();
            console.groupEnd();
            console.log("token refreshed! redirecting original request:", originalRequest);
            guard.updateAuthorizationToken();
            originalRequest.headers.Authorization = self.options.authTokenGetter();
            return guard.axiosGeneral()(originalRequest);
          }
        }catch(e){
          console.error(e);
          throw e;
        }
      }
    }
  }

  unAuthorizedOfAccessTokenMissing(
    guard: BaseApiGuard,
  ): TApiRedirectGuard {
    const EErrorCode = AppErrorCodes.singleton();
    const self = this;
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED,  "ACCESS_TOKEN_MISSING") ,
      whereError(error) {
        const result = is.not.undefined(error.response)
          && (error!.response!.data.error_code === EErrorCode.ACCESS_TOKEN_MISSING);
        console.log("unAuthorizedOfAccessTokenMissing, result:", result);
        return result;
      },
      /** 返回 null (Promise<void>）時，代表繼續傳遞之前的 response
       *  返回 非 null 時，代表以返回值替代之前傳遞的 response
       * */
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        return;
      }
    }
  }


  unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = AppErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED,  "USER_IS_BLOCK"),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.data.error_code === EErrorCode.USER_IS_BLOCK
      },
      responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        self.options.notifyError(error!.response!);
        return new Promise((resolve => resolve(error)))
      }
    };
  }

  unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = AppErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, "USER_NOT_VERIFY"),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.data.error_code === EErrorCode.USER_NOT_VERIFY
      },
      redirectAsLastResort: self.options.userNotVerifiedRoute!,
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        self.options.notifyError(error!.response!);
        return new Promise((resolve => resolve(error)))
      }
    };
  }

  unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = AppErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, "INVALID_PERMISSION"),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.data.error_code === EErrorCode.INVALID_PERMISSION
      },
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        self.options.notifyError(error!.response!);
        return new Promise((resolve => resolve(error)))
      }
    };
  }
}


export class BaseGeneralGuardHelper extends InternalApiGuardHelper{
  unauthorized(guard: BaseApiGuard): TApiRedirectGuard{
    const self = this;
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, "UNAUTHORIZED"),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && true;
      },
      redirectAsLastResort: self.options.loginRoute!,
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<TFuzzyResponse> {
        self.options.notifyError(error!.response!);
        self.options.clearUserData();
        return new Promise((resolve => resolve(error)));
      }
    };
  }
}

export class BaseAuthGuardHelper extends BaseGeneralGuardHelper{
  unAuthorizedOfAccessTokenMissing(guard: BaseApiGuard): TApiRedirectGuard {
    return super.unAuthorizedOfAccessTokenMissing(guard);
  }

  unAuthorizedOfAccessTokenExpired(guard: BaseApiGuard): TApiRedirectGuard {
    return super.unAuthorizedOfAccessTokenExpired(guard);
  }

  unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard {
    return super.unAuthorizedOfInvalidPermission(guard);
  }

  unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard {
    return super.unAuthorizedOfUserIsBlock(guard);
  }

  unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard {
    return super.unAuthorizedOfUserNotVerified(guard);
  }
}

