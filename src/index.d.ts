/**
 *      B A S E
 *
 * */

export { BaseApiService, } from "~/base/baseApi";
export { BaseApiGuard, } from "~/base/baseApiGuard";
export { IBaseApiGuardConfig, BaseApiGuardConfig, BaseGeneralApiGuardConfig, BaseAuthApiGuardConfig } from "~/base/baseApiGuardConfig";
export { BaseErrorCodes, IBaseResponseRestorer, IBaseApiService, IInternalBaseApiService, TPager, TOptional, TErrorResponse, TSuccessResponse, TDataResponse, TResponse, } from "~/base/baseApiTypes";
export { IBaseAppConfig, } from "~/base/baseAppConfigTypes";
export { IBaseAppStore, IBaseLanguageService } from "~/base/baseAppStoreTypes";
export { UnCaughtCondition, UncaughtEnumType, NotImplementedError, TypeMismatchError, InvalidUsage, UnExpectedRole } from "~/base/baseExceptions";
export { IParamStore, TUpdateFromRouteOption } from "~/base/baseParamStore";
export { BaseRouterInterceptor, } from "~/base/baseRouterGuard";
export { TSearchStorePayloadGetter, TSearchStoreOptions, TSearchStoreOnUpdate, ISearchStore, } from "~/base/baseSearchStoreTypes";
export { TableState, TableStateForceExtra, TableColConfig, TableCol, IBaseTableModels, IBaseTableCtrl } from "~/base/baseTableTypes";
export { EFlashType, EUserRole, USER_ROLES, TCommonUserStateProps, StateMapping, TStateMappingConfig, TWrappedStateMappingConfig, IBaseUserStore, } from "~/base/baseUserTypes";
export { ERedirectReason, EApiForwardingStage, IRouterInterceptor, IBaseRouterGuard, EApiGuardType, TApiRedirectGuard, } from "~/base/guardianTypes";
export { EStorageType, IStoreService, IStoreHelper, } from "~/base/jsonStoreServiceType";
export { StoreHelper, } from "~/base/storeHelper";
export { VForm, } from "~/base/vformTypes";
/***
 *
 *    E X T E N D
 *    B A S E
 * */
export { AssertMsg, assertMsg, AssertionError, assert } from "~/extendBase/impls/utils/assert";
export { isRefImpl, asEnum, getAccessibleProperties, asCascadeClass, asUnWrappedVueRefMap, UnWrappedVueRef, TUnWrapVueRef, addStringMappingFromNumEnum, is, } from "~/extendBase/impls/utils/typeInferernce";
export { BaseParamStore } from "~/extendBase/impls/baseParamStore";
export { BaseStorageService, WatchAndStore, watchAndStore } from "~/extendBase/impls/baseStorageService";
export { BaseTableModel } from "~/extendBase/impls/baseTableModel";
export { BaseUserStore } from "~/extendBase/impls/baseUserStore";
export { appConfigInit } from "~/extendBase/appConfigs";
export { TParamStoreState } from "~/extendBase/paramStoreTypes";
export { DebouncedFunc, TSearchStoreState, TSearchPayload } from "~/extendBase/searchStoreType";
export { watchProps, withDebugKey } from "~/extendBase/vueUtils";
/**
 *        M I X I N S
 *
 *
 * */
export { CommonMixin } from "~/vueMixins/common";
