import {BaseReactiveCounter} from "~/appCommon/counter/counter_base";
import {IBaseSpanCounter} from "~/appCommon/counter/counters_span_typedef";
import {computed, ComputedRef, reactive, watch} from "vue";
import {TCounterState} from "~/appCommon/counter/counter_base_typedef";
import {watchAndStore} from "~/appCommon/extendBase/impls/baseStorageService";


export abstract class BaseSpanCounter extends BaseReactiveCounter implements IBaseSpanCounter{
  state: TCounterState & {
    maxTimes: number,
    span: number,
    retries: number,
  };
  hasExceedMaxRetries: ComputedRef<boolean>;
  private storeKey: string;

  protected constructor(option: {
    maxTimes: number,
    span: number,
    storeKey: string,
  }) {
    super();
    this.storeKey = option.storeKey;
    // @ts-ignore
    const prevState = this.state;
    const newState = {
      maxTimes: option.maxTimes,
      span: option.span,
      retries: 0,
      counterLBound: prevState.counterLBound,
      counterRBound: prevState.counterRBound
    };
    console.log("newState:", newState, JSON.stringify(newState));

    this.state = reactive(newState);
    console.log("Period:", this.state.span, "span:", option.span);

    this.hasExceedMaxRetries = computed(()=>{
      return this.state.retries > this.state.maxTimes;
    });

    this.watchPropertyChange();
    console.log("Period:", this.state.span, "span:", option.span, "newState:", newState);
  }

  start() {
    this.state.retries++;
    if (this.hasExceedMaxRetries.value) {
      console.log('start: hasExceedMaxRetries');
      this.onExceedMaxRetries();
    } else {
      console.log('start: new span');
      if (this.onStartNewSpan()){
        super.start(this.state.span);
      }
    }
  }

  continue() {
    if (this.counterEnabled.value) {
      this.state.counterLBound = new Date(Date.now()).getTime();
      const period = this.currentCounter.value;
      super.start(period);
    }
  }


  reset(): Promise<any>{
    return new Promise((resolve, reject)=>{
      const unwatcher = watch(this.state, ()=>{
        unwatcher();
        this.cancel();
        console.log('unwatch reset');
        resolve(true);
      });
      unwatcher();
      this.state.retries = 0;
      this.cancel();
    });
  }

  cancel() {
    this.state.counterLBound = undefined;
    this.state.counterRBound = undefined;
    this.counter.clear();
    this.afterCancel();
  }


  /** 當新的span開始時
   *  return false to stop starting a new counter
   *  return true to continue starting a new counter
   * */
  protected onStartNewSpan(): boolean {
    return true;
  }

  /** watch property and store into localstoreage
   *  @remark 使用者可覆寫擴展其功能，但需要 call super 才能保
   *  留 {@link watchAndStore} 功能
   * */
  protected watchPropertyChange():void{
    const {maxTimes, span, retries} = this.state;
    watchAndStore({
      loadOnInitialize: true,
      omits: [],
      storage: localStorage,
      storeIdent: this.storeKey,
      unwrapRef: this.state,
      defaults:{
        maxTimes, span, retries
      }
    });
  };

  protected onExceedMaxRetries() {
    if (this.hasExceedMaxRetries.value){
      const startTime = new Date(Date.now()).getTime();
      const isWithinValidPeriod = startTime < this.state.counterRBound!;
      console.log('hasExceedMaxRetries', isWithinValidPeriod, startTime, this.state.counterRBound);
      this.state.retries = Math.min(this.state.maxTimes + 1, this.state.retries);
    }else{
      console.log('hasExceedMaxRetries...');
    }
  }
}




// export
// class PhoneVerificationSpanCounter extends BaseSpanCounter{
//   constructor(span?: number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.PHONE_VALIDATION_MAX_TIMES_PER_SPAN,
//       span:     span ?? APP_CONFIGS.DEFAULT_MODELS.PHONE_VALIDATION_SPAN,
//       storeKey: 'PhoneSpanCounter',
//     });
//   }
//
//   protected afterCancel(): void {
//   }
//
//   protected afterSet(lbound: number): void {
//   }
// }
//
//
//
// export
// class EmailVerificationSpanCounter extends BaseSpanCounter{
//   constructor(span?: number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.EMAIL_VALIDATION_MAX_TIMES_PER_SPAN,
//       span:     span ?? APP_CONFIGS.DEFAULT_MODELS.EMAIL_VALIDATION_SPAN,
//       storeKey: 'EmailSpanCounter',
//     });
//   }
//
//   protected afterCancel(): void {
//   }
//
//   protected afterSet(lbound: number): void {
//   }
// }
//
//
//
// export
// class ResetPwdMailSpanCounter extends BaseSpanCounter{
//   constructor(span?: number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYMAIL_VALIDATION_MAX_TIMES_PER_SPAN,
//       span:     span ?? APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYMAIL_VALIDATION_SPAN,
//       storeKey: 'EmailPwdSpanCounter'
//     });
//   }
//
//   protected afterCancel(): void {
//   }
//
//   protected afterSet(lbound: number): void {
//   }
// }
//
//
// export
// class ResetPwdPhoneSpanCounter extends BaseSpanCounter{
//   constructor(span?: number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYPHONE_VALIDATION_MAX_TIMES_PER_SPAN,
//       span:     span ?? APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYPHONE_VALIDATION_SPAN,
//       storeKey: 'PhonePwdSpanCounter'
//     });
//   }
//
//   protected afterCancel(): void {
//   }
//
//   protected afterSet(lbound: number): void {
//   }
// }


