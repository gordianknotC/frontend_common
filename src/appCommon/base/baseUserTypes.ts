import {ComputedRef} from "~/appCommon/base/vueTypes";
import {UnwrapRef} from "vue";
import {Optional, TFuzzyResponse} from "~/appCommon/base/baseApiTypes";

export enum EFlashType {
  success = "success",
  warning = "warning",
  info = "info",
  error = "error"
}

export enum EUserRole {
  ADMIN=11,
  ADMIN_HELPER=12,
  MERCHANT=21,
}


type TMapping<S> = {
  dataKey: keyof S
}

export type TCommonUserStateProps<Extra={}> = {
  token: string;
  username: string;
  refresh_token: string;
  phone: Optional<string>;
  email: Optional<string>;
  is_verify: boolean;
} & Extra;

export type StateMapping<S, Extra={}> = Record<keyof TCommonUserStateProps<Extra>, TMapping<S>>;

export type TStateMappingConfig<S, Login, Update, Reset, Register, ExtraFields={}> = {
  mappings            : StateMapping<S, {}>,
  authExpirationInDays: number,
  defaultUser       : S,
  writeUserData     : (data: S)=> void;
  readUserData      : ()=> S;

  refreshAuthRequest: ()=>Promise<any>;
  updatePwdRequest  : (payload: Update)=>Promise<TFuzzyResponse>;
  loginRequest      : (payload: Login)=>Promise<TFuzzyResponse>;
  registerRequest   : (payload: Register)=>Promise<TFuzzyResponse>;
  resetPwdRequest   : (payload: Reset)=>Promise<TFuzzyResponse>;
  userInfoRequest?  : ()=>Promise<any>;

  notifySuccess     : ()=> void;
  notifyError       : (e: any)=>void;
  /** following attributes generated programmatically from mappings*/
} &  ExtraFields;

export type TWrappedStateMappingConfig<S, Login, Update, Reset, Register, ExtraFields={}> = {
  authorization_date: string;
  token: string;
  username: string;
  refresh_token: string;
  is_authorized: boolean;
  /** 用於是否驗證*/
  isVerified: boolean;
  phone: Optional<string>;
  email: Optional<string>;
} & TStateMappingConfig<S, Login, Update, Reset, Register, ExtraFields>;

export abstract class IBaseUserStore<
  S,
  LoginPayload,
  UpdatePayload,
  RegisterPayload=any,
  ResetPayload=any,
  ExtraFields={},
  > {
  abstract state: UnwrapRef<S>;
  abstract config: TWrappedStateMappingConfig<S, LoginPayload, UpdatePayload, ResetPayload, RegisterPayload, ExtraFields>;
  abstract labels: Record<string, ComputedRef<string>>;

  abstract isAuthorized: ComputedRef<boolean>;
  abstract isExpired: ComputedRef<boolean>;
  abstract isVerifiedUser: ComputedRef<boolean>;

  abstract updateFromModel(model: Partial<S>): void;
  abstract updateFromLocalStorage(): void;
  abstract clearUserData(except: Partial<keyof S>[]): void;
  abstract login(payload: LoginPayload): Promise<boolean>;
  abstract forgotPassword(payload: ResetPayload): Promise<boolean>;
  abstract updatePassword(payload: UpdatePayload): Promise<boolean>;
  abstract register(payload: RegisterPayload): Promise<boolean>;
  abstract updateUserInfo(): Promise<any>;
  abstract notifySuccess(message: string): void;
  abstract notifyError(e: any): void;
}







