import {TOptional, TPager} from "~/types/base/baseApiTypes";

export type TParamStoreState = {
  start_date : TOptional<string>,
  end_date   : TOptional<string>,
  channel    : TOptional<string>,
  status     : TOptional<string>,
  keyword    : TOptional<string>,
  fullPath   : TOptional<string>,
  balance    : TOptional<string>,
  username   : TOptional<string>,
  role       : TOptional<string>,
  merchant_ticket_no: TOptional<string>,
  amount: TOptional<string>,
  net_amount: TOptional<string>,
  deduction: TOptional<string>,
  create_datetime: TOptional<string>,
  name: TOptional<string>,
} & TPager
  &
{
  fullPath: TOptional<string>
}

export type TParamStoreGetter = {

}

