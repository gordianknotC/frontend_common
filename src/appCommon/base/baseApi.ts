import {Facade} from "~/appCommon/base/baseFacadeTypes";
import {
  IInternalBaseApiService,
  Optional,
  TFuzzyResponse,
  IBaseApiServiceMethods, AppErrorCodes
} from "~/appCommon/base/baseApiTypes";
import {UnCaughtCondition} from "~/appCommon/base/baseExceptions";
import {asCascadeClass, is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";
import {BaseApiGuard, RealAxiosError} from "~/appCommon/base/baseApiGuard";
import {StatusCodes} from "http-status-codes";
import {getAppConfigs} from "~/appCommon/extendBase/appConfigs";
import {ErrorCodes} from "vue";


function title(config: AxiosRequestConfig): string {
  const method = config.method?.toUpperCase();
  switch (config.method?.toUpperCase()) {
    case "GET":
      return `GET: ${config.url}`.bgBlue;
    case "DELETE":
      return `DEL: ${config.url}`.bgRed;
    case "POST":
      return `POST: ${config.url}`.bgGreen;
    case "PUT":
      return `PUT: ${config.url}`.bgCyan;
    case "PATCH":
      return `PATCH: ${config.url}`.bgBlack;
  }
  return config.url ?? "";
}


export function trace() {
  try {
    const error = `${new Error().stack}`;
    const trace = error.split("\n")
      .where((_)=>_.contains("./src")).slice(2).join("\n");
    console.log(trace);
  }catch(e){
  }
}



/** 修正 api response, 強制 response.data 為 Array
 *  1）當 response.data 為物件而非 array 時
 *  2）當 response.data 為 array 時
 *  3）1+2 但錯誤時
 * */
function rectifyResponseType(response: TFuzzyResponse): any{
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

export abstract class IResponseTypeResolver{
  abstract page(response: TFuzzyResponse): number;
  abstract pages(response: TFuzzyResponse): number;
  abstract error_code(response: TFuzzyResponse): number;
  abstract error_key(response: TFuzzyResponse): string;
  abstract error_msg(response: TFuzzyResponse): string;
  abstract succeed(response: TFuzzyResponse): boolean;
  abstract token(response: TFuzzyResponse): string;
  abstract data(response: TFuzzyResponse): Optional<any>;
}

let testCounter: Record<string, boolean> = {};

enum EStage{
  actual, simulation
}

/** 模擬測試用，如 auth expired */
class ApiServiceTestHelper{
  records: Record<string, EStage> = {};
  simulateAuthExpired(response: AxiosResponse): AxiosError{
    return {
      code: "",
      config: response.config,
      isAxiosError: false,
      message: "",
      name: "",
      request: response.request,
      response: {
        config: response.config,
        status: StatusCodes.UNAUTHORIZED,
        statusText: "UNAUTHORIZED",
        headers: response.headers,
        data: AppErrorCodes.singleton().getErrorResponse(AppErrorCodes.singleton().ACCESS_TOKEN_EXPIRED),
      },
      stack: undefined,
      toJSON(): object {
        return {};
      }
    };
  }

  initAsSimuResponse(response: AxiosResponse){
    const url = response.config.url!;
    this.records[url] ??= EStage.simulation;
  }
  removeSimuResponse(response: AxiosResponse){
    const url = response.config.url!;
    this.records[url] = EStage.actual;
  }

  isActualRequestStage(response: AxiosResponse){
    const url = response.config.url!;
    return this.records[url] === EStage.actual;
  }

  isSimulationRequestStage(response: AxiosResponse){
    const url = response.config.url!;
    return this.records[url] === EStage.simulation;
  }

  asAuthExpired(response: AxiosResponse){

  }
}

export class BaseApiService implements IInternalBaseApiService {
  resolver: IResponseTypeResolver;
  guard: BaseApiGuard;
  axiosGeneral: AxiosInstance;
  axiosAuth: AxiosInstance;
  testHelper: ApiServiceTestHelper;

  constructor(options: {
    resolver: IResponseTypeResolver,
    guard: BaseApiGuard,
    apiDomainGetter: ()=>string,
    timeout?: number
  }) {
    const self = this;
    this.resolver = options.resolver;
    this.guard = options.guard;
    this.testHelper = new ApiServiceTestHelper();

    this.axiosGeneral = axios.create({
      baseURL: options.apiDomainGetter(),
      timeout: options.timeout ?? 10000
    });

    this.axiosAuth = axios.create({
      baseURL: options.apiDomainGetter(),
      timeout: options.timeout ?? 10000
    });

    this.axiosAuth!.interceptors.request.use((config) => {
        this.updateAuthorizationToken();
        console.group(title(config));
        return config;
      }, (error: RealAxiosError) => {
        console.log(error);
        return Promise.reject(error);
      }
    )

    this.axiosAuth.interceptors.response.use(
      async (response) => {
        return self.guard!.authResponseGuard(response);
      },
      async (error: RealAxiosError) => {
        const facade = Facade.asProxy<any>();
        return self.guard.authErrorResponseGuard(error);
      }
    )


    this.axiosGeneral!.interceptors.request.use((config) => {
        this.updateAuthorizationToken();
        console.group(title(config));
        return config;
      }, (error: RealAxiosError) => {
        console.log(error);
        return Promise.reject(error);
      }
    )

    this.axiosGeneral.interceptors.response.use(
      async (response) => {
        /** response ok 以後才會執行，這裡不需要
         *  whereError / responseErrorHandler....
         * */
        console.log("response interceptr".bgBrightCyan);
        if (!getAppConfigs().SIMULATIONS.TEST_AUTH_EXPIRED)
          return self.guard.generalResponseGuard(response);

        /**
         *      S I M U L A T E
         *      Auth  Expired
         * */
        console.warn("SIMULATION");
        this.testHelper.initAsSimuResponse(response);
        if (this.testHelper.isSimulationRequestStage(response)){
          this.testHelper.removeSimuResponse(response);
          return self.guard.generalErrorResponseGuard(
            self.testHelper.simulateAuthExpired(response)
          );
        }else if (this.testHelper.isActualRequestStage(response)){
          return self.guard.generalResponseGuard(response);
        }else{
          throw new UnCaughtCondition();
        }
      },
      async (error: RealAxiosError) => {
        /** response error 以後才會執行，這裡需要
         *  whereError / responseErrorHandler....
         * */
        // return Promise.reject(error);
        console.log("error interceptr".bgBrightCyan);
        return self.guard.generalErrorResponseGuard(error);
      }
    )

    this.guard.axiosInit(this.axiosGeneral, this.axiosAuth);

    // 為了不需要特別 bind
    asCascadeClass(this);
  }

  protected updateAuthorizationToken() {
    const facade = Facade.asProxy<any>();
    this.axiosGeneral!.defaults.headers.common["Authorization"] = facade.userStore.state.token;
    this.axiosAuth!.defaults.headers.common["Authorization"] = facade.userStore.state.token;
  };

  protected post(url: string, data: Record<string, any>): Promise<any> {
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
        console.error(err);
      });
    });
  }

  protected postRefreshToken(url: string, data: Record<string, any>): Promise<any> {
    const facade = Facade.asProxy<any>();
    return new Promise((resolve, reject) => {
      this.axiosAuth({
        method: "post",
        url,
        data: data,
        headers: {
          Authorization: facade.userStore.state.token
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

  /**
   *  download 到底要用 post / get
   *  https://stackoverflow.com/questions/16355175/which-http-method-to-use-for-file-downloading
   *
   *  GET is for passively retrieving files, POST is for altering information
   *  on the server. This is as seen from the client, it doesn't matter what
   *  the server does or doesn't do in the process.
   *
   *  So unless you're altering some server state in the request: GET.
   * */
  protected dl<T>(url: string, data: Record<string, any> = {}, method: "post" | "get" = "get"): Promise<T> {
    this.updateAuthorizationToken();
    const duration = 200000;
    return new Promise((resolve, reject) => {
      this.guard.generalGuardHelper.options.notifyDownloading(data)
      this.axiosGeneral({
        method: method,
        url,
        params: data,
        responseType: "blob",
        timeout: duration,
      })
        .then(res => {
          resolve(res.data);
          this.guard.generalGuardHelper.options.notifyDownloaded(res)
        })
        .catch(err => {
          reject(err);
          console.error(err);
          this.guard.generalGuardHelper.options.notifyDownloadFailed(err)
        });
    });
  }

  protected get<T>(url: string, data: Record<string, any> = {}): Promise<T> {
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
          console.error(err);
        });
    });
  }

  protected put(url: string, data: Record<string, any>): Promise<any> {
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
          console.error(err);
        });
    });
  }

  protected patch(url: string, data: Record<string, any>): Promise<any> {
    this.updateAuthorizationToken();
    return new Promise((resolve, reject) => {
      this.axiosGeneral({
        method: "patch",
        url,
        data: data
      })
        .then(res => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
          console.error(err);
        });
    });
  }


  protected del(url: string, data: Record<string, any>): Promise<any> {
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
          console.error(err);
        });
    });
  }
}
