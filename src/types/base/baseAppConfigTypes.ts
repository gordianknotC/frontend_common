import {IAppReact, ILanguageService} from "~/types/extendBase/appReactTypes";
import {IRouterInterceptor} from "~/types/base/guardianTypes";
import {BaseStorageService} from "~/types/extendBase/impls/baseStorageService";
import {TUserState} from "~/types/extendBase/userReactTypes";
import {TExtraAppState} from "~/types/extendBase/facadeTypes";


export abstract class IBaseAppConfig<User>{
  abstract API_DOMAIN: string;
  abstract APP_IDENT: string;
  abstract isInProduction: boolean;
  abstract isInDevelopment: boolean;
  abstract DATE_TEMPLATE_FOR_QUERY: string;
  abstract DATE_TEMPLATE_FOR_UILABEL: string;
  abstract DEFAULT_MODELS: {
    AUTH_EXPIRATION_IN_DAYS: number;
    USER: User,
    LANGUAGE: string,
    THEME: string,
  } & any;
}

export type TAppSetupConfig ={
  userStoreService: BaseStorageService<TUserState>,
  languageService: ILanguageService,
  appReact: IAppReact<TExtraAppState>,
  routerInterceptor: IRouterInterceptor,
}
