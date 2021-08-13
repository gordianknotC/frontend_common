/**
*
*
*
**/ import {Optional} from "~/appCommon/base/baseApiTypes";
import {ComputedRef} from "vue";

export type TCounterState = {
  counterLBound: Optional<number>,
  counterRBound: Optional<number>,
}

export interface ISafeInterval {
  id: Optional<number>;
  readonly activated: boolean;
  set(cb: (...args: any[]) => void, ms: number, ...args: any[]): void;
  clear(): void;
}

export interface IBaseReactiveCounter {
  state: TCounterState;
  interval: number;
  counter: ISafeInterval;
  counterEnabled: ComputedRef<boolean>;
  currentCounter: ComputedRef<number>;

  set(lbound: number): void;
  start(periodInSeconds: number): void;
  continue(): void;
  cancel(): void;
}
