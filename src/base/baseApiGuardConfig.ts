import {BaseErrorCodes, TDataResponse, TErrorResponse, TOptional, TPager} from "~/base/baseApiTypes";
import {RouteLocationRaw} from "vue-router";
import {AxiosError, AxiosRequestConfig, AxiosResponse} from "axios";
import {TApiRedirectGuard} from "~/base/guardianTypes";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import {NotImplementedError} from "~/base/baseExceptions";
import {BaseApiGuard} from "~/base/baseApiGuard";
import {getReasonPhrase, StatusCodes} from "http-status-codes";

export abstract class IBaseApiGuardConfig {
  abstract verifyRoute: TOptional<RouteLocationRaw>;
  abstract refreshAuthRequester: () => Promise<any>;
  abstract refreshTokenGetter: () => string;
  abstract authTokenGetter: () => string;
  abstract notifyError: (r: AxiosResponse) => void;

  abstract statusOK(guard: BaseApiGuard): TApiRedirectGuard;
  abstract statusNoContent(guard: BaseApiGuard): TApiRedirectGuard;
  abstract statusUncaughtOK(guard: BaseApiGuard): TApiRedirectGuard;

  abstract unauthorized(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfAccessTokenExpired(
    guard: BaseApiGuard,
  ): TApiRedirectGuard;

  abstract unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard;
  abstract unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard;
}


export class BaseApiGuardConfig implements IBaseApiGuardConfig {
  constructor(
    public authTokenGetter: () => string,
    public clearUserData: ()=> void,
    public loginRoute: TOptional<RouteLocationRaw>,
    public notifyError: (r: AxiosResponse) => void,
    public notifyDownloading: () => void,
    public notifyDownloaded: () => void,
    public notifySuccess: (r: AxiosResponse) => void,
    public refreshAuthRequester: () => Promise<any>,
    public refreshTokenGetter: () => string,
    public verifyRoute: TOptional<RouteLocationRaw>,
  ){
  }

  protected getStatusText(status: StatusCodes, errorCode?: number): string{
    if (is.undefined(errorCode))
      return getReasonPhrase(status);
    return `${getReasonPhrase(status)} > err:${errorCode}`;
  }

  statusUncaughtOK(guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: "Uncaught OK Status",
      async responseHandler(response: AxiosResponse) {
        guard.lastResponse = response;
        console.warn("uncaught http status:", response.status, response.statusText);
      },
    }
  }

  statusOK(guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: this.getStatusText(StatusCodes.OK),
      async responseHandler(response: AxiosResponse) {
        guard.lastResponse = response;
      },
    }
  }

  statusNoContent (guard: BaseApiGuard): TApiRedirectGuard {
    return {
      reason: this.getStatusText(StatusCodes.NO_CONTENT),
      async responseHandler(response: AxiosResponse) {
        guard.lastResponse = response;
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
    const EErrorCode = BaseErrorCodes.singleton();
    const self = this;
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, EErrorCode.ACCESS_TOKEN_EXPIRED) ,
      whereError(error) {
        const isDownloadBlob = is.type(error!.response!.data, "Blob");
        return is.not.undefined(error.response)
          && (
            isDownloadBlob
            || error!.response!.status === EErrorCode.ACCESS_TOKEN_EXPIRED
          );
      },
      /** 返回 null (Promise<void>）時，代表繼續傳遞之前的 response
       *  返回 非 null 時，代表以返回值替代之前傳遞的 response
       * */
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<void | TErrorResponse | TDataResponse<any>> {
        const originalRequest = error.config;
        const refreshToken = self.refreshTokenGetter();
        console.log('has refresh token? ', is.initialized(refreshToken));
        if (refreshToken) {
          await self.refreshAuthRequester();
          console.groupEnd();
          console.log('token refreshed! redirecting original request:', originalRequest);
          guard.updateAuthorizationToken();
          originalRequest.headers.Authorization = self.authTokenGetter();
          return guard.axiosGeneral!(originalRequest);
        }
      }
    }
  }

  unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = BaseErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, EErrorCode.USER_IS_BLOCK),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.status === EErrorCode.USER_IS_BLOCK
      },
      responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<void | TErrorResponse | TDataResponse<any>> {
        self.notifyError(error!.response!);
        return new Promise((resolve => resolve()))
      }
    };
  }

  unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = BaseErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, EErrorCode.USER_NOT_VERIFY),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.status === EErrorCode.USER_NOT_VERIFY
      },
      redirectAsLastResort: self.verifyRoute!,
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<void | TErrorResponse | TDataResponse<any>> {
        self.notifyError(error!.response!);
        return new Promise((resolve => resolve()))
      }
    };
  }

  unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard {
    const self = this;
    const EErrorCode = BaseErrorCodes.singleton();
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED, EErrorCode.INVALID_PERMISSION),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && error!.response!.status === EErrorCode.INVALID_PERMISSION
      },
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<void | TErrorResponse | TDataResponse<any>> {
        self.notifyError(error!.response!);
        return new Promise((resolve => resolve()))
      }
    };
  }


}


export class BaseGeneralApiGuardConfig extends BaseApiGuardConfig{
  unauthorized(guard: BaseApiGuard): TApiRedirectGuard{
    const self = this;
    return {
      reason: this.getStatusText(StatusCodes.UNAUTHORIZED),
      whereError(error: AxiosError): boolean {
        return is.not.undefined(error.response)
          && true;
      },
      redirectAsLastResort: self.loginRoute!,
      async responseErrorHandler(error: AxiosError, request: AxiosRequestConfig, ): Promise<void | TErrorResponse | TDataResponse<any>> {
        self.notifyError(error!.response!);
        self.clearUserData();
        return new Promise((resolve => resolve()));
      }
    };

  }
}


export class BaseAuthApiGuardConfig extends BaseApiGuardConfig{
  unAuthorizedOfAccessTokenExpired(guard: BaseApiGuard): TApiRedirectGuard {
    throw new NotImplementedError();
  }

  unAuthorizedOfInvalidPermission(guard: BaseApiGuard): TApiRedirectGuard {
    throw new NotImplementedError();
  }

  unAuthorizedOfUserIsBlock(guard: BaseApiGuard): TApiRedirectGuard {
    throw new NotImplementedError();
  }

  unAuthorizedOfUserNotVerified(guard: BaseApiGuard): TApiRedirectGuard {
    throw new NotImplementedError();
  }
}

