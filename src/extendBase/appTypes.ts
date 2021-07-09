/*
import Vue, {App} from 'vue';

//warning: 為方便 import apiService 本應 import IApiService，以免 circular dependency
import {Router} from "vue-router";
import {AxiosStatic} from "axios";
import {IBaseAppStore, IBaseLanguageService} from "~/base/baseAppStoreTypes";
import {Facade} from "~/base/baseFacadeTypes";
import {ComputedRef} from "~/base/vueTypes";
import {IStoreService} from "~/base/jsonStoreServiceType";
import {IBaseUserStore} from "~/base/baseUserTypes";
import {TParamStoreState} from "~/extendBase/paramStoreTypes";
import {IRouterInterceptor} from "~/base/guardianTypes";
import {IParamStore} from "~/base/baseParamStore";
import {BaseApiService} from "~/base/baseApi";

export type TUserState =
  & {
  authorization_date: string
}



export const Language = {
  en : 'en',
  cn : 'zh-cn',
  'zh-cn': 'cn',
}

export type TLanguage = 'en' | 'zn-ch' | 'cn' ;

export enum ETheme {
  light = "light",
  dark = "dark",
}

export type TExtraAppState = {
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
}


/!** en / tw / cn 類型檢查 *!/
const messages: Record<string, typeof en> = {
  [Language.en]: en,
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
  apiService       : typeof BaseApiService,
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
