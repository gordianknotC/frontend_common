import {IBaseReactiveCounter, TCounterState} from "~/appCommon/counter/counter_base_typedef";
import {ComputedRef} from "vue";

export interface IBaseSpanCounter extends IBaseReactiveCounter {
  state: TCounterState & {
    maxTimes: number,
    span: number,
    retries: number,
  };
  hasExceedMaxRetries: ComputedRef<boolean>;

  start(): void;

  reset(): Promise<any>;
}

