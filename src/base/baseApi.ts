import {Facade} from "~/base/baseFacadeTypes";
import {IInternalBaseApiService, TDataResponse, TErrorResponse, TSuccessResponse} from "~/base/baseApiTypes";
import {UnCaughtCondition} from "~/base/baseExceptions";
import {PagerResponseRestorer} from "~/extendBase/impls/baseResponseRestorer";
import {is} from "~/extendBase/impls/utils/typeInferernce";
import axios, {AxiosInstance, AxiosRequestConfig} from "axios";
import {BaseApiGuard} from "~/base/baseApiGuard";


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


export function trace() {
  try {
    const error = `${new Error().stack}`;
    const trace = error.split('\n')
      .where((_)=>_.contains('./src')).slice(2).join('\n');
    console.log(trace);
  }catch(e){
  }
}


export const responseRestorers = {
  pager: new PagerResponseRestorer()
}

/** 修正 api response, 強制 response.data 為 Array
 *  1）當 response.data 為物件而非 array 時
 *  2）當 response.data 為 array 時
 *  3）1+2 但錯誤時
 * */
function rectifyResponseType(response: TDataResponse<any> | TSuccessResponse | TErrorResponse): any{
  const facade = Facade.asProxy<any>();
  if (is.undefined(response) || is.empty(response)){
    console.error(new UnCaughtCondition());
    return response;
  }
  if (facade.apiService.isErrorResponse(response)){
  }else if (facade.apiService.isSuccessResponse(response)){
  }else if (is.type((response as any).data, "Object")){
    (response as any).data = [(response as any).data];
  }else if (is.type((response as any).data, "Array")){
  }
  return response;
}


export class BaseApiService implements IInternalBaseApiService {
  guard: BaseApiGuard;
  axiosGeneral: AxiosInstance;
  axiosToken: AxiosInstance;

  constructor(options: {
    guard: BaseApiGuard,
    apiDomainGetter: ()=>string,
    timeout?: number
  }) {

    const self = this;
    this.guard = options.guard;

    this.axiosGeneral = axios.create({
      baseURL: options.apiDomainGetter(),
      timeout: options.timeout ?? 10000
    });

    this.axiosToken = axios.create({
      baseURL: options.apiDomainGetter(),
      timeout: options.timeout ?? 10000
    });

    this.axiosToken!.interceptors.request.use((config) => {
        this.updateAuthorizationToken();
        console.group(title(config));
        return config;
      }, (error) => {
        console.log(error);
        return Promise.reject(error);
      }
    )

    this.axiosToken.interceptors.response.use(
      async (response) => {
        return self.guard!.generalResponseGuard(response);
      },
      async (error: any) => {
        const facade = Facade.asProxy<any>();
        return self.guard.generalErrorResponseGuard(error);
      }
    )


    this.axiosGeneral!.interceptors.request.use((config) => {
        this.updateAuthorizationToken();
        console.group(title(config));
        return config;
      }, (error) => {
        console.log(error);
        return Promise.reject(error);
      }
    )

    this.axiosGeneral.interceptors.response.use(
      async (response) => {
        return self.guard.generalResponseGuard(response);
      },
      async (error: any) => {
        const facade = Facade.asProxy<any>();
        return self.guard.generalErrorResponseGuard(error);
      }
    )
  }

  updateAuthorizationToken() {
    const facade = Facade.asProxy<any>();
    this.axiosGeneral!.defaults.headers.common["Authorization"] = facade.userReact.state.token;
    this.axiosToken!.defaults.headers.common["Authorization"] = facade.userReact.state.token;
  };

  post(url: string, data: Record<string, any>): Promise<any> {
    this.updateAuthorizationToken();
    return new Promise((resolve, reject) => {
      this.axiosGeneral({
        method: "post",
        url,
        data: data
      }).then(res => {
        resolve(res.data);
      }).catch(err => {
        reject(err);
        console.log(err);
      });
    });
  }

  postToken(url: string, data: Record<string, any>): Promise<any> {
    const facade = Facade.asProxy<any>();
    return new Promise((resolve, reject) => {
      this.axiosToken({
        method: "post",
        url,
        data: data,
        headers: {
          Authorization: facade.userReact.state.token
        }
      })
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  dl<T>(url: string, data: Record<string, any> = {}): Promise<T> {
    this.updateAuthorizationToken();
    const duration = 200000;
    return new Promise((resolve, reject) => {
      this.guard.generalConfigHelper.notifyDownloading()
      // const pending = ElMessage.info({
      //   type: "info",
      //   showClose: true,
      //   duration: duration,
      //   dangerouslyUseHTMLString: true,
      //   message: `<div id="dlMessage">${facade.languageService.txt.downloading} ...</div>`,
      //   customClass:"dlMessage",
      //   iconClass:"el-icon-loading"
      // });
      this.axiosGeneral({
        method: "get",
        url,
        params: data,
        responseType: "blob",
        timeout: duration,
      })
        .then(res => {
          resolve(res.data);
          this.guard.generalConfigHelper.notifyDownloaded()
        })
        .catch(err => {
          reject(err);
          console.log(err);
          this.guard.generalConfigHelper.notifyDownloaded()
        });
    });
  }

  get<T>(url: string, data: Record<string, any> = {}): Promise<T> {
    this.updateAuthorizationToken();
    return new Promise((resolve, reject) => {
      this.axiosGeneral({
        method: "get",
        url,
        params: data
      })
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
          console.log(err);
        });
    });
  }

  put(url: string, data: Record<string, any>): Promise<any> {
    this.updateAuthorizationToken();
    return new Promise((resolve, reject) => {
      this.axiosGeneral({
        method: "put",
        url,
        data: data
      })
        .then(res => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }

  del(url: string, data: Record<string, any>): Promise<any> {
    this.updateAuthorizationToken();
    return new Promise((resolve, reject) => {
      this.axiosGeneral({
        method: "delete",
        url,
        data: data
      })
        .then(res => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
          console.log(err);
        });
    });
  }
}
