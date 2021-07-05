import en from '~/assets/i18n/en';
import cn from '~/assets/i18n/cn';
import hi from '~/assets/i18n/hi';

import {IBaseAppReact, IBaseLanguageService} from "~/types/base/baseAppReactTypes";
import {ComputedRef} from "~/types/base/vueTypes";


/** 所有 enum 往後加，不要插入, 怕可能有影響（localstorage)*/
export enum EAsideNav {
  payIn,
  payOut,
  withdrawal,
  deposit,
  settlements,
  capitalFlow,
  merchant,
  channel,
  group,
  home,
  report,
  channelOrder,
  merchantWallet,
  channelWallet,
  notification,
  dashboard,
  myInformation,
  wallet,
  bankAccount

  //
  // devSignIn,
  // devDeposit,
  // devWithdraw,
  // devDepositTicket,
  // devWithdrawTicket,
  // devSDKReadme,
  // devSDKProgram,
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

export abstract class IAppReact<Extra> extends IBaseAppReact<TLanguage, ETheme, Extra>{
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


/** en / tw / cn 類型檢查 */
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
