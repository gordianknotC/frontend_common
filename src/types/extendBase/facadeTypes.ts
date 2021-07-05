import Vue, {App} from 'vue';
import {Facade} from "~/types/base/baseFacadeTypes";

import {BaseApiRedirectGuard, IRouterInterceptor} from "~/types/base/guardianTypes";
import {EAsideNav, IAppReact, ILanguageService} from "~/types/extendBase/appReactTypes";
import {IStoreService} from "~/types/base/jsonStoreServiceType";
import {IUserReact, TUserState} from "~/types/extendBase/userReactTypes";
import {IParamReact} from "~/types/base/baseParamReact";
import {TParamReactState} from "~/types/extendBase/paramReactTypes";

//warning: 為方便 import apiService 本應 import IApiService，以免 circular dependency
import {Router} from "vue-router";
import {
  IChangePasswordPayload,
  ILoginPayload, IMerchantSignUpPayload, IPostRequestMerchantMailPayload,
} from "@/types/apiTypes";

import BaseApi from "@/services/api";
export const FACADE_KEY = Symbol();

type State    = TUserState;
type Login    = ILoginPayload;
type Update   = IChangePasswordPayload;
type Register = IMerchantSignUpPayload;
type Reset    = IPostRequestMerchantMailPayload;

export type TExtraAppState = {
  currentAsideNav: EAsideNav,
  openedNav: Record<EAsideNav, EAsideNav>,
  time?: Date,
}

/**
*     Facade
*     提供 facade 界面資訊
**/
export type TFacade = {
  apiRedirectGuard : BaseApiRedirectGuard,
  apiService       : typeof BaseApi,
  appReact         : IAppReact<TExtraAppState>,
  paramReact       : IParamReact<TParamReactState>,
  routerInterceptor: IRouterInterceptor,
  userStoreServiceForMerchant : IStoreService<TUserState>,
  userStoreServiceForAdmin : IStoreService<TUserState>,
  languageService  : ILanguageService,
  userReact        : IUserReact<State, Login, Update, Register, Reset>,
  router:Router,
  app:App,
  trace:()=>void,
  vue:typeof Vue,
}

export const facade = Facade<TFacade>();

