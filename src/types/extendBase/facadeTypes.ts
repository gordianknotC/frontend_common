/*
import Vue, {App} from 'vue';
import {Facade} from "~/types/base/baseFacadeTypes";

import {BaseApiRedirectGuard, IRouterInterceptor} from "~/types/base/guardianTypes";
import { IAppStore, ILanguageService} from "~/types/extendBase/appStoreTypes";
import {IStoreService} from "~/types/base/jsonStoreServiceType";
import {IUserStore, TUserState} from "~/types/extendBase/userStoreTypes";
import {IParamStore} from "~/types/base/baseParamStore";
import {TParamStoreState} from "~/types/extendBase/paramStoreTypes";

//warning: 為方便 import apiService 本應 import IApiService，以免 circular dependency
import {Router} from "vue-router";
import {
  IChangePasswordPayload,
  ILoginPayload, IMerchantSignUpPayload, IPostRequestMerchantMailPayload,
} from "@/types/apiTypes";

import BaseApi from "@/services/api";
import {IBaseUserStore} from "~/types/base/baseUserTypes";
import {ComputedRef} from "~/types/base/vueTypes";
import {AxiosStatic} from "axios";
import {IBaseAppStore, IBaseLanguageService} from "~/types/base/baseAppStoreTypes";
export const FACADE_KEY = Symbol();

export type TUserState = IAdminLoginRecord
  & IMerchantLogInRecord
  & IGetMerchantBalanceRecord
  & {
  authorization_date: string
}



export const Language = {
  en : 'en',
  cn : 'zh-cn',
  hi : "hi",
  'zh-cn': 'cn',
}

export type TLanguage = 'en' | 'zn-ch' | 'cn' | 'hi';

export enum ETheme {
  light = "light",
  dark = "dark",
}

export type TExtraAppState = {
  currentAsideNav: EAsideNav,
  openedNav: Record<EAsideNav, EAsideNav>,
  time?: Date,
}


type State    = TUserState;
type Login    = ILoginPayload;
type Update   = IChangePasswordPayload;
type Register = IMerchantSignUpPayload;
type Reset    = IPostRequestMerchantMailPayload;



export abstract class IUserStore<State, Login, Update, Register, Reset>
  extends IBaseUserStore<State, Login, Update, Register, Reset>
{
  abstract isMerchant: ComputedRef<boolean>;
  abstract isAdmin: ComputedRef<boolean>;
  abstract forgotPassword(payload: Reset): Promise<boolean>;
  abstract sendEmail(email: string) : Promise<boolean>;
  abstract updateBalance(): Promise<void>;
  abstract refreshAuth(axios?: AxiosStatic): Promise<boolean>;
}



export abstract class IAppStore<Extra> extends IBaseAppStore<TLanguage, ETheme, Extra>{
  abstract formErrors: ComputedRef<string>;
  abstract openedTabs: ComputedRef<{name: string, title: string}[]>;
  abstract currentTab: ComputedRef<{name: string, title: string}>;

  abstract navToRoute(nav: EAsideNav): {name: string, title: string};
  abstract routeNameToNav(routeName: string): EAsideNav;
  abstract setTab(nav: EAsideNav): void;
  abstract setTabAndRoute(nav: EAsideNav): void;

  abstract closeTab(nav: EAsideNav): void;
  // abstract toggleDLDialog(): void;
  // abstract showDLDialog():void;
  // abstract hideDLDialog():void;
}


/!** en / tw / cn 類型檢查 *!/
const messages: Record<string, typeof en> = {
  [Language.en]: en,
  [Language.cn]: cn,
  [Language.hi]: hi,
}


export abstract class ILanguageService
  extends IBaseLanguageService<TLanguage>
{
  get txt(): typeof en{
    return messages[this.language];
  }
}


/!**
*     Facade
*     提供 facade 界面資訊
**!/
export type TFacade = {
  apiRedirectGuard : BaseApiRedirectGuard,
  apiService       : typeof BaseApi,
  appStore         : IAppStore<TExtraAppState>,
  paramStore       : IParamStore<TParamStoreState>,
  routerInterceptor: IRouterInterceptor,
  userStoreServiceForMerchant : IStoreService<TUserState>,
  userStoreServiceForAdmin : IStoreService<TUserState>,
  languageService  : ILanguageService,
  userStore        : IUserStore<State, Login, Update, Register, Reset>,
  router:Router,
  app:App,
  trace:()=>void,
  vue:typeof Vue,
}

export const facade = Facade.asProxy<TFacade>();

*/
