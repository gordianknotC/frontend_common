import {ComputedRef} from "~/types/base/vueTypes";
import {IBaseUserReact} from "~/types/base/baseUserTypes";
import {IMerchantLogInRecord, IAdminLoginRecord, IGetMerchantBalanceRecord} from "@/types/apiTypes";
import {AxiosStatic} from "axios";

export type TUserState = IAdminLoginRecord
  & IMerchantLogInRecord
  & IGetMerchantBalanceRecord
  & {
    authorization_date: string
}

export abstract class IUserReact<State, Login, Update, Register, Reset>
  extends IBaseUserReact<State, Login, Update, Register, Reset>
{
  abstract isMerchant: ComputedRef<boolean>;
  abstract isAdmin: ComputedRef<boolean>;
  abstract forgotPassword(payload: Reset): Promise<boolean>;
  abstract sendEmail(email: string) : Promise<boolean>;
  abstract updateBalance(): Promise<void>;
  abstract refreshAuth(axios?: AxiosStatic): Promise<boolean>;
}










