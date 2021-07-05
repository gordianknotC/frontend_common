import {TUserState} from "~/types/extendBase/userReactTypes";
import {DateExt, useBuiltIn} from "~/types/base/builtinAddonsTypes";
import {ETheme, Language, TLanguage} from "~/types/extendBase/appReactTypes";
import {IBaseAppConfig} from "~/types/base/baseAppConfigTypes";
import {EUserRole} from "~/types/base/baseUserTypes";


/// fixme: 外部擴展

/**
 *      SERVER_DOMAIN, DEVELOPMENT_DOMAIN
 *      由 vue.config.js 讀入
 *      SERVER_DOMAIN 由後端 server 設定
 *      如前端欲由本機進行 SERVER_DOMAIN 測試需於 terminal
 *      自行設定 server_domain
 *
 *      > API_HOST=http://xxx.domain.xxx
 * */

const USER: TUserState = {
  pay_in_balance: 0,
  pay_out_balance: 0,
  deposit_pending_balance: 0,
  withdraw_pending_balance: 0,
  authorization_date: "",
  brand_name: "",
  email: "",
  id: 0,
  is_verify: false,
  is_authorized: false,
  phone: "",
  project_id: 0,
  refresh_token: "",
  remark: "",
  return_url: "",
  role: EUserRole.MERCHANT,
  secret_key: "",
  token: "",
  username: "",
}

export class BaseAppConfig implements IBaseAppConfig<TUserState>{
  API_DOMAIN:string = process.env.VUE_APP_API_HOST!;
  DATE_TEMPLATE_FOR_QUERY = 'YYYYMMDD';
  DATE_TEMPLATE_FOR_UILABEL = "YYYY/MM/DD";
  APP_IDENT = 'GoldenDragon';
  USE_LAKH = false;
  EXPORT_TYPE = 2;
  DL_TEMPLATE = {
    SUBFILE_TYPE: "xlsx",
    ADMIN_SETTLEMENT: "admin_settlement_{start_date}_{end_date}_{channel_id}_{page}.{subtype}",
    ADMIN_PAYOUT    : "admin_payOut_{start_date}_{end_date}_{status}_{channel}_{page}.{subtype}",
    ADMIN_PAYIN     : "admin_payIn_{start_date}_{end_date}_{status}_{channel}_{page}.{subtype}",
    MERC_SETTLEMENTS: "merchant_settlement_{start_date}_{end_date}_{page}.{subtype}",
    MERC_CAPITALFLOW: "merchant_capitalFlow_{start_date}_{end_date}_{type}_{page}.{subtype}",
    MERC_PAYOUT     : "merchant_payOut_{start_date}_{end_date}_{status}_{channel}_{page}.{subtype}",
    MERC_PAYIN      : "merchant_payIn_{start_date}_{end_date}_{status}_{channel}_{page}.{subtype}",
    MERC_REPORT     : "merchant_report_{start_date}_{end_date}_{page}.{subtype}"
  };
  DEFAULT_MODELS = {
    INPUT_SEARCH_DATE: "20200101",
    TABLE_SEARCH_DATE: ()=> DateExt.THIS_WEEK,
    LANGUAGE: Language.en as TLanguage,
    THEME: ETheme.light,
    PAGE_INFO: {
      PER_PAGE: 10,
      INITIAL_PAGE: 1,
    },
    USER ,
    AUTH_EXPIRATION_IN_DAYS: 1,
  }
  SDK_LANGUAGES = [
    "python", "java", "csharp", "php"
  ];
  EXPOSE_GLOBALS= true;
  DEBOUNCE = {
    INPUT: 300,
  }
  SIMULATIONS = {
    PSEUDO: {
      TRANSACTION: false,
      MEMBER_LIST: false,
      PAGER: true,
    }
  }
  SHOW_SEARCH_OPTIONS: boolean = false;
  get isInDevelopment(){
    return true;
  }
  get isInProduction(){
    return false;
  }
  get isInTestMode(){
    return process.env.VUE_APP_ENV! === "default";
  }
}

