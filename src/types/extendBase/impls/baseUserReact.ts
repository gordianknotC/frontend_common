import {computed, ComputedRef, UnwrapRef} from "~/types/base/vueTypes";
import {DateDiff} from "~/types/base/builtinAddonsTypes";
import {asCascadeClass, is} from "~/types/extendBase/impls/utils/typeInferernce";
import {TSuccessResponse} from "~/types/base/baseApiTypes";
import {IBaseUserReact, TStateMappingConfig, TWrappedStateMappingConfig} from "~/types/base/baseUserTypes";
import axios from "axios";
import {TUserState} from "~/types/extendBase/userReactTypes";
import {debounce} from "debounce";

export type  DebouncedFunc<T extends Function> = T
  & { clear(): void; }
  & { flush(): void; };

export class BaseUserReact<S extends object, L, U, R, F, ExtraField>
implements IBaseUserReact<
  S, L, U, R, F, ExtraField
> {
  state: UnwrapRef<S>;
  config: TWrappedStateMappingConfig<S, L, U, F, R, ExtraField>;
  labels: Record<string, ComputedRef<string>>;
  isAuthorized: ComputedRef<boolean>;
  isExpired: ComputedRef<boolean>;
  isVerifiedUser: ComputedRef<boolean>;
  reAuthDebouncer: DebouncedFunc< ()=>Promise<boolean> >

  constructor(
    _state: UnwrapRef<S>,
    config: TStateMappingConfig<S, L, U, F, R, ExtraField>
  ) {
    type RawConfig      = TStateMappingConfig<S, L, U, F, R, ExtraField>;
    type WrappedConfig  = TWrappedStateMappingConfig<S, L, U, F, R, ExtraField>;
    this.state          = _state;
    //@ts-ignore
    this.state.authorization_date = '';

    /** 將 RawConfig 轉為 WrappedConfig 並導至 state */
    this.config = new Proxy<WrappedConfig>({} as WrappedConfig, {
      get: function(target: WrappedConfig, p: string, receiver: any): any {
        const mapping = config.mappings[p as keyof typeof config.mappings];
        if (is.initialized(mapping)){
          return (_state as S)[mapping.dataKey as keyof S];
        }
        return config[p as keyof RawConfig];
      },
      set: function(target: WrappedConfig, p: string, value: any, receiver: any): boolean {
        const mapping = config.mappings[p as keyof typeof config.mappings];
        if (is.initialized(mapping)){
          try{
            (_state as S)[mapping.dataKey as keyof S] = value;
            return true;
          }catch(e){
            console.error('set val:', value, 'by key:', mapping.dataKey, 'failed, state:', _state)
            return false;
          }
        }
        return true;
      }
    });

    this.isExpired= computed(()=>{
      const now = new Date(Date.now());
      const authDate = new Date(Date.parse(this.config.authorization_date!));
      const diff = new DateDiff(now, authDate)
      return diff.diff > this.config.authExpirationInDays * DateDiff.day;
    });

    this.isAuthorized= computed(() => {
      const a = is.not.empty(this.config.refresh_token);
      const b = is.not.empty(this.config.token);
      return a && b;
    }) as ComputedRef<boolean>

    this.isVerifiedUser = computed(()=>this.config.isVerified);
    this.labels = {
      username: computed(() => {
        return this.config.username ?? 'username'
      }),
    };

    this.reAuthDebouncer = debounce(async ()=>{
      const response = await this.config.refreshAuthRequest();
      this.config.token = response.data.token;
      console.log('token refreshed'.bgGreen);
      this.updateFromModel({token: this.config.token} as any);
      return true;
      //note: wait 一定要高於 axios timeout
    },       axios.defaults.timeout! + 3000, false)

  }

  updateFromModel(model: Partial<S>) {
    Object.keys(model).forEach((key) => {
      //@ts-ignore
      this.state[key] = model[key as keyof typeof model];
      // console.log(key, model[key as keyof typeof model]);
    });
    this.config.writeUserData(this.state as any);
  }

  updateFromLocalStorage(): void {
    const data = this.config.readUserData();
    this.updateFromModel(data);
  }

  clearUserData(except: Partial<(keyof TUserState)>[] = []){
    const username = this.config.username; /// keep username
    const DEFAULT = this.config.defaultUser;
    console.log(DEFAULT);
    Object.keys(this.state).forEach((element) => {
      if (except.contains(element as keyof TUserState)){
        // pass
      }else{
        //@ts-ignore
        this.state[element] = DEFAULT[element as keyof typeof DEFAULT];
      }
    });
    this.config.username = username;
    this.config.writeUserData(this.state as S);
  }

  notifySuccess(){
    this.config.notifySuccess();
  }

  notifyError(e: any){
    this.config.notifyError(e);
  }

  async resetPassword(payload: F): Promise<boolean>{
    console.log('call updatePassword:', payload);
    try{
      const response = await this.config.resetPwdRequest(payload);
      console.log('success, call succeess message');
      this.notifySuccess();
      return (response as TSuccessResponse).succeed;
    }catch(e){
      console.error(e);
      this.notifyError(e);
      return false;
    }
  }

  async updatePassword(payload: U): Promise<boolean> {
    console.log('call updatePassword:', payload);
    try{
      const response = await this.config.updatePwdRequest(payload);
      console.log('success, call succeess message');
      this.notifySuccess();
      return (response as unknown as TSuccessResponse).succeed;
    }catch (e) {
      console.error(e);
      this.notifyError(e);
      return false;
    }
  }

  async updateUserInfo(): Promise<any>{
    if (is.initialized(this.config.userInfoRequest)){
      const response = await this.config.userInfoRequest!();
      console.log('updateUserInfo:', response.data);
      this.updateFromModel(response.data);
      return response;
    }
    return null;
  }

  async login(payload: L): Promise<boolean> {
    try{
      const response = await this.config.loginRequest(payload);
      this.updateFromModel(response.data);
      await this.updateUserInfo();
      this.notifySuccess();
      return true;
    }catch(e){
      this.notifyError(e)
      return false;
    }
  }

  async register(payload: R): Promise<boolean> {
    try{
      const response = await this.config.registerRequest(payload);
      this.updateFromModel(response.data)
      await this.updateUserInfo();
      this.notifySuccess();
      return true;
    }catch(e){
      this.notifyError(e)
      return false;
    }
  }
}
