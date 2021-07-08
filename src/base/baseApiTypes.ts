import {assert} from "~/extendBase/impls/utils/assert";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic} from "axios";
import {BaseApiGuard} from "~/base/baseApiGuard";

let errorcodes: TOptional<BaseErrorCodes>;

export class BaseErrorCodes {
  static setup(option:{
    ACCESS_TOKEN_MISSING?: number,
    ACCESS_TOKEN_EXPIRED?: number,
    DATA_MISSING?: number,
    INVALID_PERMISSION?: number,
    USER_IS_BLOCK?: number,
    USER_NOT_VERIFY?: number,
  }){
    errorcodes = new BaseErrorCodes();
    Object.keys(option).forEach((element) => {
      //@ts-ignore
      errorcodes[element] = option[element as keyof typeof option];
    });
  }

  static singleton(): BaseErrorCodes{
    assert(is.initialized(errorcodes), "errorcodes Initialized before setup!!");
    return errorcodes ??= new BaseErrorCodes();
  }

  ACCESS_TOKEN_MISSING=3101;
  ACCESS_TOKEN_EXPIRED=202;
  DATA_MISSING = 102;
  INVALID_PERMISSION=208;
  USER_IS_BLOCK=205;
  USER_NOT_VERIFY=206;
}


export type TPager = {
  page: number;
  pages: number;
  per_page: number;
  total: number;
};

export type TOptional<T> = T | undefined | null;

export type TErrorResponse = {
  error_code: number;
  error_key: string;
  error_msg: string;
  message: string;
};

export type TSuccessResponse = {
  succeed: boolean;
};

export type TDataResponse<T> = {
  data: T;
  pager?: TPager | null | undefined;
};

export type TResponse = Partial<TSuccessResponse & TDataResponse<any>>


export abstract class IBaseResponseRestorer{
  abstract restore(response: TDataResponse<any>): void;
}

export abstract class IBaseApiService{
  abstract isErrorResponse(result: any): boolean;
  abstract isSuccessResponse(response: TDataResponse<any> | TSuccessResponse | TErrorResponse):boolean;
  abstract lastResponse: any[];
  abstract restoreResponse(restorer: IBaseResponseRestorer): void;
}

export abstract class IInternalBaseApiService{
}

type TErrorCodeGuardOption={
  statusCode?: number,
  errorCode?: number,
  handler: ()=>Promise<any>;
}

type TErrorCodeGuardConfig = {
}

function title(config: AxiosRequestConfig): string {
  const method = config.method?.toUpperCase();
  switch (config.method?.toUpperCase()) {
    case 'GET':
      return `GET: ${config.url}`.bgBlue;
    case 'DELETE':
      return `DEL: ${config.url}`.bgRed;
    case 'POST':
      return `POST: ${config.url}`.bgGreen;
    case 'PUT':
      return `PUT: ${config.url}`.bgCyan;
  }
  return config.url ?? '';
}

class BaseApiService implements IInternalBaseApiService{
  constructor(
    public guard: BaseApiGuard
  ) {

  }
}

