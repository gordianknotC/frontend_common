import {ComputedRef, UnwrapRef} from "~/appCommon/base/vueTypes";
type Optional<T> = T | undefined | null;

export namespace VForm{
  export type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

  /** #### 代表欄位 dataKey 型別
   *  ---------------------
   *  @typeParam T 欄位主要 payload 型別
   *  @typeParam E 欄位次要 payload 型別，用於延伸擴展，可以是 {}*/
  export type TFormKey<T,E>   = (keyof T) | (keyof E);

  /** #### 代表欄位 dataKey 對應至 paylaod 相應值的型別
   *
   *  > 如 payload 為
   *
   *  ```typescript
   *    type TPayload = {username: string, id: number}
   *  ```
   *
   *  > 則 TFormKey   為 'username' | 'id'
   *  >    TFormValue 為 string | number
   *
   *  ---------------------
   *  @typeParam T 欄位主要 payload 型別
   *  @typeParam E 欄位次要 payload 型別，用於延伸擴展，可以是 {}*/
  export type TFormValue<T,E> = (T & E)[TFormKey<T,E>];
  export type TErrorKey<T,E>   = TFormKey<T,E> | "uncategorizedError";
  export type TRemoteErrors<T,E>=Record<TErrorKey<T,E>, Optional<string>>;
  export type TFormValuesByName<T, E> = Record<
    string, TFormValue<T,E>
    >
  export type TFormOption<T, E> = {
    rules: TFormRules,
    state: TFormState<T, E>,
    messages: TFormMessages,
    request:(...args: any)=>any,
  } & TFormConfig<T, E>;


  export type TLink<T, E> = {
    master:{dataKey: TFormKey<T,E>, name: string},
    slave: {dataKey: TFormKey<T,E>, name: string}
  }

  /**
   *    #### 設定{@link VForm.IBaseFormModel} 欄位資料, 可用於全局設定並於 BaseFormModel 實作設定中直接引用
   *
   *    -----------------------------
   *    #### 全局欄位設定，自定義設定格式
   *
   *    __example:__
   *    ```typescript
   *    const globalBaseFormState: TFormState<TFields, TExtraFields> = {
   *      id: {
   *        dataKey: 'id',
   *        name: 'id',
   *        value: 0,
   *        label: computed(()=>'') ,
   *        rule: '',
   *        placeholder: '',
   *        hidden: true,
   *      },
   *      username: {
   *        dataKey: 'username',
   *        name: 'username',
   *        value: '',
   *        label: computed(()=>txt.username) ,
   *        rule: 'required|userLength|userPattern',
   *        placeholder: '',
   *      },
   *      ...
   *    }
   *    ```
   *
   *    > 之後有任何表單需要用到同樣的欄位，且表單 payload dataKey 也一樣時
   *    > 便可直接引用
   *
   *    __example:__
   *    ```typescript
   *    export class CreateMerchantForm extends BaseFormImpl<T, E>
   *      {
   *     constructor(option?: Partial<TFormOption<T, E>>) {
   *       super(_.extend(option ?? {}, {
   *         state: getBaseFormStatesByKeys([
   *           'username',
   *           'password',
   *           'confirm_password',
   *           'email',
   *           'nickname',
   *           'phone',
   *           'remark'
   *         ]),
   *         rules: baseFormRules,
   *         messages: GenCustomValidationMessages(facade.languageService),
   *         title: computed(()=> facade.languageService.txt.addMerchant),
   *       } as TFormOption<T, E>));
   *       this.request = apiService.createNewMerchant;
   *     }
   *   }
   *   ```
   *
   *   > 直接於 getBaseFormStatesByKeys 方法指定欄位名稱即可
   *   > 相應㿝表單行為及 validation rule 會直接套上
   *
   *    ---------------------
   *    @typeParam T 欄位主要 payload 型別
   *    @typeParam E 欄位次要 payload 型別，用於延伸擴展，可以是 {}
   *
   * */
  export type TFormField<T, E> ={
    /** 代表該欄位 payload 所使用的 key*/
    dataKey: TFormKey<T,E>,
    /** 代表該欄位表單名稱，於 validation rule 階段, 可用於 成對 validation rule 的匹配，如
     *  > - **confirm**  規則中 password 匹配於 password_confirm,
     *  > - **notEqual** 規則中 newPassword 匹配於 newPassword_notEqual*/
    name: string,
    /** 代表當前 input 欄位的值，也是表單最後上傳 payload 的值 */
    value: TFormValue<T,E>,
    /** label 用, 包於 computed, 需考慮語系 */
    label: ComputedRef<string>,
    /** rule 驗證規則, 以 "|" 串接多個規則如
     *  > rule: "required|userLength|userNamePattern... " */
    rule: string,
    fieldType?: string,
    placeholder: ComputedRef<string>,
    /** 用於非顯示用表單，如ID*/
    hidden?: boolean,
    /** @internal
     *  以字串顯示 form errors, 於內部生成
     *
     *  > 當 validation rules 沒有指定 bail 時，就算有多個規則錯誤
     *  > 只出現一筆 formError, 除非指定 bail, fieldError 才會顯示多筆錯誤*/
    fieldError?: string,
    /** @internal
     *  用於Validation 階段存於表單資料，於內部生成 */
    context?: IBaseFormContext<T,E>,
    hasError?: ComputedRef<boolean>

  }


  ///     C O N F I G
  /**
   *    #### BaseFormImpl config 設定，可用於擴展 BaseFormImpl
   *
   * */
  export interface TFormConfig<T, E> {
    /** dialog 標題*/
    title?          : ComputedRef<string>,
    /** 傳入 dialog 是否 visible, 類別為 reactive
     *
     *  > visible 可由 vue template script 傳入
     *  > 全局傳入也可以, 以下為 vue template 引入
     *
     *  __example__
     *  ```typescript
     *      const createMerchantModel = new CreateMerchantForm({
     *         visible: toRef(dialogHandler, 'createDialog'),
     *         onSubmit(response, model){
     *           reRender();
     *           return true;
     *         }
     *       })
     *  ```
     *  > 全局引入的方式則為於 Class constructor 中 覆寫
     *
     *  */
    visible?        : UnwrapRef<{ value: boolean }>,
    /** 設計於 dialog visible 時呼叫 */
    onVisible?      : (model: IBaseFormModel<T, E>, extra: any)=> void;
    /** 設計於 dialog visible 前呼叫*/
    onBeforeVisible?: (model: IBaseFormModel<T, E>, extra: any)=> void;
    /** cancel / submit 後呼叫 */
    onClose    (model: IBaseFormModel<T, E>): void;
    onCancel?:   (model: IBaseFormModel<T, E>)=> void;
    /** return true for close, false for stay the same*/
    onSubmit?:   (resp : any, model: IBaseFormModel<T, E>)=> boolean;
    onNotifyRectifyingExistingErrors: ()=>void;
    onBeforeSubmit: ()=>void;
    onAfterSubmit: ()=>void;
    onCatchSubmit: (e: any)=>void;
  }

  /**
   *   @internal 同 {@link VForm.TFormConfig}，用於內部使用
   * */
  export interface TFormExt<T, E> {
    title          : ComputedRef<string>,
    visible        : UnwrapRef<{ value: boolean }>,
    onVisible      : (model: IBaseFormModel<T, E>, extra: any)=> void;
    onBeforeVisible: (model: IBaseFormModel<T, E>, extra: any)=> void;
    onClose    (model: IBaseFormModel<T, E>): void;
    onCancel:   (model: IBaseFormModel<T, E>)=> void;
    /** return true for close, false for stay the same*/
    onSubmit:   (resp : any, model: IBaseFormModel<T, E>)=> boolean;
    onNotifyRectifyingExistingErrors: ()=>void;
    onBeforeSubmit: ()=>void;
    onAfterSubmit: ()=>void;
    onCatchSubmit: (e: any)=>void;
  }


  /** #### 代表欄位 BaseFormImpl reactive state
   *
   *   > 該狀態為 由 {@link VForm.TFormField<T,E>} 轉為 {@link VForm.TFormState}
   *
   *  ---------------------
   *  @typeParam T 欄位主要 payload 型別
   *  @typeParam E 欄位次要 payload 型別，用於延伸擴展，可以是 {}
   **/
  export type TFormState<T, E > = Record<
    TFormKey<T,E>, TFormField<T,E>
    >

  export type TFormPayload<T, E > = Record<
    TFormKey<T,E>, TFormValue<T, E>
    >

  /**
   *  #### validation rules 自定義設定格式
   *
   *  __example:__
   *   ```typescript
   *   const baseFormRules = {
   *     [EBaseValidationRules.optional](ctx, ...args: any){
   *       return true;
   *     },
   *      [EBaseValidationRules.required](ctx, ...args: any){
   *       return v8n().not.empty().test(ctx.value);
   *     },
   *      [EBaseValidationRules.bail](ctx, ...args: any){
   *       ctx.displayOption.showMultipleErrors = true;
   *       return true;
   *     },
   *   }
   *  ```
   * */
  export type TFormRuleHandler = (ctx: IBaseFormContext<any, any>, ...args:any[]) => boolean;
  export type TFormRules = Record<string, TFormRuleHandler>

  export type TFormMessages = Record<
    string, ComputedRef<string>
    >

  export type TValidationMessages<T extends string> = Record<T, string>;


  /** #### 用於擴展欄位顯示選擇
   * */
  export type TDisplayOption = {
    /** 用來實作如 bail rule, 可顯示多重 validation errors*/
    showMultipleErrors: boolean,
  }


  ///     C O N T E X T
  /**
   *
   *  #### context object 於 rule definition 階段存取, 用來讀取當前表單資料
   * */
  export abstract class IBaseFormContext<T, E>{
    /** 可用來判斷 {@link VForm.TDisplayOption.showMultipleErrors}
     *   用來實作如 bail 多重錯誤 rule
     * */
    abstract displayOption: TDisplayOption;
    abstract model: IBaseFormModel<T,E>;
    abstract dataKey: TFormKey<T, E>;
    /** 取得當前 field name*/
    abstract name: string;
    /** 取得當前 field 的值*/
    abstract value: TFormValue<T,E>;
    /** 取得所有旳 formValue 並以 field name 作為 index key*/
    abstract getFormValues(): TFormValuesByName<T, E>;
    /**  取得當前 formState */
    abstract getFormState(): TFormState<T,E>;
  }



  ///   M O D E L
  /**
   *  #### 用來存取 BaseFormImpl 資料層
   *
   *  @property initialState
   *  表單初始狀態，提供重設表單時所呈現
   *
   *  @property state
   *    表單當前狀態
   *
   *  @property remoteErrors
   *    remote errors 別於 {@link TFormField.fieldError}, {@link TFormField.fieldError}為
   *
   *  @property rules
   *    definition of validation rules
   *
   *  @property messages
   *    validation messages
   *
   *  @property config
   *    表單擴展定義
   *
   *  @method getDataKeys
   *    @return (TFormKey<T,E>)[]
   *
   *    取得欄位 dataKeys
   *    const payload = {username:..., password: ...}
   *    ...
   *    model.getDataKeys() // ['username', 'password']
   *
   *  @method getIdentifiers
   *    @return string[];
   *
   *    identifier 為 field name, 如表單定義為
   *    > const def = {
   *    >
   *    > }
   *
   *  @function getFields
   *  @method getFieldByDataKey
   *
   * */
  export abstract class IBaseFormModel<T, E>{
    abstract linkages: TLink<T, E>[];
    abstract initialState: TFormState<T,E>;
    abstract state: UnwrapRef<TFormState<T,E>>;
    abstract remoteErrors: UnwrapRef<TRemoteErrors<T,E>>;
    abstract rules: TFormRules;
    abstract messages: TFormMessages;
    abstract config: TFormExt<T, E>;
    abstract getDataKeys()   : (TFormKey<T,E>)[];
    abstract getIdentifiers(): string[];
    abstract getFields()     : TFormField<T,E>[];

    /** get TFormField by dataKey*/
    abstract getFieldByDataKey(dataKey: TFormKey<T,E>)
      :TFormField<T,E>;

    /** get TFormField by dataKey*/
    abstract getFieldByFieldName(fieldName: string)
      :TFormField<T,E>;



    /** get TFormValue by dataKey*/
    abstract getValueByDataKey(dataKey: TFormKey<T,E>)
      : TFormValue<T,E>;

    /** 依欄位名取得該欄位值 (value) */
    abstract getValueByName(name: string)
      : Optional<TFormValue<T,E>>;

    abstract clearRemoteErrors(): void;
    abstract addRemoteErrors(errors: Partial<TRemoteErrors<T,E>>): void;

    /** 重置初始狀態 */
    abstract resetAsInitialState(): void;

    /** reset into initialState or specific state, 當值為空時，重設為初始資料
     *  當值為非空，重設為所提供皫值
     *  @param state 重設state
     *  */
    abstract resetState(state?: TFormPayload<T,E>): void;

    abstract linkFields(option: TLink<T, E>): void

    // abstract hasLinked(fieldName: string): boolean;
  }

  //
  //    C O N T R O L L E R
  //
  /**
   *  #### 實作 BaseFormImpl 控制項
   *
   *  @computed canSubmit
   *  判斷當前 submit 按鍵是否可按，當表單有錯誤時為不可按
   *
   *  @method cancel
   *  用以指定於表單 cancel button @click 時
   *
   *  @method getPayload
   *  定義表單送出時 生成的payload
   *
   *  @method request
   *  定義表單送出時的請求方法
   *
   *  @method submit
   *  用以指定於表單 submit button @click 時
   *
   *  @method validate
   *  依據欄位名稱驗證該欄位
   *  e.g:
   *    > validate('username')
   *    > validate('password')
   *
   * */
  export abstract class IBaseFormCtrl<T, E>{
    abstract canSubmit: ComputedRef<boolean>;
    abstract cancel(): void;
    abstract getPayload(): Partial<Record<TFormKey<T,E>, any>>
    abstract request:(...args: any)=>Promise<any>
    abstract submit(): Promise<any>;
    abstract getContext(fieldName: string)
      : IBaseFormContext<T,E>;
    abstract validate(dataKey:TFormKey<T,E>, extraArg?: any): boolean;
    abstract validateAll(): boolean;
  }


  export abstract class IBaseFormCtrlExt<T, E>{
    abstract apiGet(...args: any):Promise<any>
    abstract onCreate(): void;
    abstract afterSubmit(): Promise<any>;
  }


  ///   E V E N T    H A N D L E R
  /**
   *
   *  #### 用來實作 html 車件與 IBaseForm 互動的界面
   *
   *  @method {@link notifyLeavingFocus}
   *  @method {@link notifyReFocus}
   *  @method {@link notifyOnInput}
   *  以上三者提供 input element 事件輸入界面，輸入後進行表單驗證及狀態更新
   *
   * */
  export abstract class IBaseEventHandler<T, E>{
    abstract notifyLeavingFocus (fieldName: TFormKey<T,E>): void;
    abstract notifyReFocus      (fieldName: TFormKey<T,E>): void;
    abstract notifyOnInput      (fieldName: TFormKey<T,E>, extraArg?: any): void;
    abstract notifyRectifyingExistingErrors(): void;
  }

}
