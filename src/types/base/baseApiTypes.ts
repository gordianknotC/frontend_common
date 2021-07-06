
let errorcodes: TOptional<ErrorCodes>;

export class ErrorCodes {
  static setup(option:{
    ACCESS_TOKEN_MISSING?: number,
    ACCESS_TOKEN_EXPIRED?: number,
    DATA_MISSING?: number,
    INVALID_PERMISSION?: number,
    USER_IS_BLOCK?: number,
    USER_NOT_VERIFY?: number,
  }){
    errorcodes = new ErrorCodes();
    Object.keys(option).forEach((element) => {
      //@ts-ignore
      errorcodes[element] = option[element as keyof typeof option];
    });
  }

  static singleton(): ErrorCodes{
    return errorcodes ??= new ErrorCodes();
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
