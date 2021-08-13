import {IBaseSpanCounter} from "~/appCommon/counter/counters_span_typedef";

export
interface IBasePeriodCounter extends IBaseSpanCounter{
  spanCounter: IBaseSpanCounter;
}
