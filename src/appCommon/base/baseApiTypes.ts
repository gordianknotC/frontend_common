import {assert} from "~/appCommon/extendBase/impls/utils/assert";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {BaseApiGuard} from "~/appCommon/base/baseApiGuard";
import {IResponseTypeResolver} from "~/appCommon/base/baseApi";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";

let appErrorCode: Optional<AppErrorCodes>;

export class AppErrorCodes {
  static setup(option:{
    ACCESS_TOKEN_MISSING?: number,
    ACCESS_TOKEN_EXPIRED?: number,
    DATA_MISSING?: number,
    INVALID_PERMISSION?: number,
    USER_IS_BLOCK?: number,
    USER_NOT_VERIFY?: number,
    errorResponseGetter: (errorCode: number)=> any,
  }){
    if (is.undefined(appErrorCode)){
      appErrorCode = new AppErrorCodes();
      Object.keys(option).forEach((element) => {
        //@ts-ignore
        appErrorCode[element] = option[element as keyof typeof option];
      });
      appErrorCode.getErrorResponse = option.errorResponseGetter;
    }
  }

  static singleton(): AppErrorCodes{
    assert(is.initialized(appErrorCode), "errorcodes Initialized before setup!!");
    return appErrorCode ??= new AppErrorCodes();
  }

  ACCESS_TOKEN_MISSING=203;
  ACCESS_TOKEN_EXPIRED=202;
  DATA_MISSING = 102;
  INVALID_PERMISSION=208;
  USER_IS_BLOCK=205;
  USER_NOT_VERIFY=206;
  getErrorResponse: (errorCode: number)=>any = (errorCode)=>{
    throw new NotImplementedError();
  };
}


export interface IBaseApiServiceMethods{
   updateAuthorizationToken(): void;
   post(url: string, data: Record<string, any>): Promise<any>;
   postRefreshToken(url: string, data: Record<string, any>): Promise<any>;
   dl<T>(url: string, data: Record<string, any>): Promise<T>;
   get<T>(url: string, data: Record<string, any>): Promise<T>;
   put(url: string, data: Record<string, any>): Promise<any>;
   del(url: string, data: Record<string, any>): Promise<any>;
}

export abstract class IInternalBaseApiService {
  abstract resolver: IResponseTypeResolver;
  abstract guard: BaseApiGuard;
  abstract axiosGeneral: AxiosInstance;
  abstract axiosAuth: AxiosInstance;


}

export abstract class IBaseApiService{
  abstract isErrorResponse(result: any): boolean;
  abstract isSuccessResponse(response: TFuzzyResponse):boolean;
}

export type TPager = {
  page: number;
  pages: number;
  per_page: number;
  total: number;
};

export type Optional<T> = T | undefined | null;
export type TFuzzyResponse = any



