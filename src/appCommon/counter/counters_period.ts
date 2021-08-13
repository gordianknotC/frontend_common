import {
  BaseSpanCounter,
} from "~/appCommon/counter/counters_span";
import {IBasePeriodCounter} from "~/appCommon/counter/counters_period_typedef";


type TPeriodCounterOption = {
  span: number,
  period: number,
  maxTimesPerSpan: number,
}

export
abstract class BasePeriodCounter extends BaseSpanCounter implements IBasePeriodCounter{
  spanCounter: BaseSpanCounter;

  protected constructor(option: {
    maxTimes: number,
    period: number,
    spanCounter: BaseSpanCounter,
    storeKey: string
  }) {
    super({
      maxTimes: option.maxTimes,
      span: option.period,
      storeKey: 'PeriodCounter',
    });
    this.spanCounter = option.spanCounter;
    console.log("Period:", this.state.span, "option:", option);
  }

  start() {
    this.spanCounter.start();
    super.start();
  }

  async reset() {
    this.spanCounter.reset();
    super.reset();
  }

  continue() {
    this.spanCounter.continue();
    super.continue();
  }

  cancel() {
    this.spanCounter.cancel();
    super.cancel();
  }

  protected onStartNewSpan(): boolean {
    return true;
  }

  protected onExceedMaxRetries() {
    super.onExceedMaxRetries();
  }
}



// export
// class PhoneVerificationPeriodCounter extends BasePeriodCounter{
//   constructor(period?:number, span?:number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.PHONE_VALIDATION_MAX_TIMES_PER_SPAN,
//       period: period ?? APP_CONFIGS.DEFAULT_MODELS.PHONE_VALIDATION_EXPIRATION_PERIOD,
//       spanCounter: new PhoneVerificationSpanCounter(span),
//       storeKey: 'PhonePeriodCounter',
//     });
//   }
//   protected afterCancel(): void {
//   }
//   protected afterSet(lbound: number): void {
//   }
// }
//
//
//
// export
// class EmailVerificationPeriodCounter extends BasePeriodCounter{
//   constructor(period?:number, span?:number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.EMAIL_VALIDATION_MAX_TIMES_PER_SPAN,
//       period: period ?? APP_CONFIGS.DEFAULT_MODELS.EMAIL_VALIDATION_EXPIRATION_PERIOD,
//       spanCounter: new EmailVerificationSpanCounter(period),
//       storeKey: 'EmailPeriodCounter'
//     });
//   }
//   protected afterCancel(): void {
//   }
//   protected afterSet(lbound: number): void {
//   }
// }
//
//
//
// export
// class ResetPwdByMailPeriodCounter extends BasePeriodCounter{
//   constructor(period?:number, span?:number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYMAIL_VALIDATION_MAX_TIMES_PER_SPAN,
//       period: period ?? APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYMAIL_VALIDATION_EXPIRATION_PERIOD,
//       spanCounter: new ResetPwdMailSpanCounter(
//         APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYMAIL_VALIDATION_SPAN
//       ),
//       storeKey: 'EmailPwdPeriodCounter'
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
// class ResetPwdByPhonePeriodCounter extends BasePeriodCounter{
//   constructor(period?:number, span?:number) {
//     super({
//       maxTimes: APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYPHONE_VALIDATION_MAX_TIMES_PER_SPAN,
//       period: period ?? APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYPHONE_VALIDATION_EXPIRATION_PERIOD,
//       spanCounter: new ResetPwdPhoneSpanCounter(
//         APP_CONFIGS.DEFAULT_MODELS.RESETPWD_BYPHONE_VALIDATION_SPAN
//       ),
//       storeKey: 'PhonePwdPeriodCounter',
//     });
//   }
//
//   protected afterCancel(): void {
//   }
//
//   protected afterSet(lbound: number): void {
//   }
// }
