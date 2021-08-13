/**
 *    provide safe methods for operating
 *      setInterval
 *      clearTimeout
 *
 * */


import {IBaseReactiveCounter, ISafeInterval, TCounterState} from "~/appCommon/counter/counter_base_typedef";
import {computed, ComputedRef, reactive} from "vue";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";

/**
 *    提供可以被追踪的 set interval 功能
 *    所有 interval 均存入 {@link SafeInterval.ALL_TIMEOUTS}
 * */
export class SafeInterval implements ISafeInterval {
  static ALL_TIMEOUTS:SafeInterval[] = [];
  static clearAll(){
    SafeInterval.ALL_TIMEOUTS.forEach((t)=> {
        t.clear();
    });
  }

  id: Optional<number>;

  constructor() {
    SafeInterval.ALL_TIMEOUTS.add(this);
  }
  /**
   *  判斷當前 couonter 是否 activated
   * */
  get activated(): boolean {
    return is.not.undefined(this.id);
  }

  /** set counter
   *  @param cb   -  callback function 每 ms miniSeconds 呼叫一次
   *  @param ms   -  每 ms miniSeconds 呼叫一次  callback
   *  @param args -  提供 callback function arguments
   * */
  set(cb: (...args: any[]) => void, ms: number, ...args: any[]) {
    this.clear();
    this.id = setInterval(cb, ms, args) as any as number;
  }

  /**
   *  clearing  time out in a safe way
   * */
  clear() {
    if (is.not.undefined(this.id)) {
      clearTimeout(this.id!);
      this.id = undefined;
    }
  }
}

export abstract class BaseReactiveCounter implements IBaseReactiveCounter {
  state: TCounterState;
  interval: number;
  counter: SafeInterval;
  counterEnabled: ComputedRef<boolean>;
  currentCounter: ComputedRef<number>;

  constructor(interval?: number) {
    const state = {
      counterLBound: undefined,
      counterRBound: undefined,
    };

    this.interval = interval ?? 1000;
    this.state    = reactive(state);
    this.counter  = new SafeInterval();
    this.counterEnabled = computed(()=>{
      const lbound = this.state.counterLBound;
      const rbound = this.state.counterRBound;
      const result = is.initialized(rbound) && is.initialized(lbound);
      return result && rbound! > lbound!;
    });

    this.currentCounter =  computed(()=>{
      if (this.counterEnabled.value){
        return Math.floor((((this.state.counterRBound ?? 0) - this.state.counterLBound!) / 1000 + 0.5));
      }else{
        return 0;
      }
    });

    console.log("ReactiveCounter:", state);
  }

  set(lbound: number) {
    this.state.counterLBound = lbound;
    this.afterSet(lbound);
  }

  start(periodInSeconds: number) {
    this.state.counterLBound = new Date(Date.now()).getTime();
    this.state.counterRBound = this.state.counterLBound + periodInSeconds * 1000;
    this.set(this.state.counterLBound);
    this.counter.clear();
    this.counter.set((_) => {
      this.set(new Date(Date.now()).getTime());
      if (!this.counterEnabled.value) {
        console.log('clear timeout since not enabled');
        this.cancel();
      }
      if (this.state.counterRBound! <= this.state.counterLBound!) {
        console.log('clear timeout since timer already finished')
        this.cancel();
      }
    }, this.interval);

    console.log('start counter, lbound:', this.state.counterLBound, 'rbound:',this.state.counterRBound, this);
  }

  continue() {
    if (this.counterEnabled.value) {
      this.state.counterLBound = new Date(Date.now()).getTime();
      const period = this.currentCounter.value;
      this.start(period);
    }
  }

  cancel() {
    this.state.counterLBound = undefined;
    this.state.counterRBound = undefined;
    this.counter.clear();
    this.afterCancel();
  }

  protected abstract afterSet(lbound: number): void;
  protected abstract afterCancel(): void;
}




/**
 *    Refresh Auth Token Guardian
 *    一分鐘內只能請求一次 refresh token
 *    超過一次視為 failed
 * */
export class RefreshTokenSpanCounter extends BaseReactiveCounter{
  private _canRefreshAuth: boolean;
  constructor() {
    super();
    this._canRefreshAuth = true;
    this.counterEnabled = computed(()=>true);
  }

  get canRefreshAuth(): boolean {
    return this._canRefreshAuth;
  }

  start(periodInSeconds?: number) {
    if (this.counter.activated) {
    } else {
      super.start(periodInSeconds ?? 60);
    }
    this._canRefreshAuth = false;
  }

  afterSet(lbound: number) {
  }

  afterCancel() {
    this._canRefreshAuth = true;
  }
}


export class RefreshTokenSpanGuard {
  protected counter: RefreshTokenSpanCounter;
  constructor() {
    this.counter = new RefreshTokenSpanCounter();
  }

  async authRefresh(): Promise<boolean>{
    if (this.counter.canRefreshAuth){
      this.counter.start();
      throw new NotImplementedError();
      // if (is.initialized(result)){
      //   return true;
      // }else{
      //   return false;
      // }
    }
    return false;
  }
}
