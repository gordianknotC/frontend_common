/**
 *      B A S E
 *
 * */
import { BaseApiService } from "~/appCommon/base/baseApi";
import { BaseApiGuard } from "~/appCommon/base/baseApiGuard";
import { ApiGuardConfigOptions, BaseAuthGuardHelper, BaseGeneralGuardHelper, IBaseApiGuardHelper, InternalApiGuardHelper } from "~/appCommon/base/internalApiGuardHelper";
import { AppErrorCodes, Optional, IInternalBaseApiService, TPager, TFuzzyResponse, IBaseApiService } from "~/appCommon/base/baseApiTypes";
import { IBaseAppConfig } from "~/appCommon/base/baseAppConfigTypes";
import { IBaseAppStore, IBaseLanguageService } from "~/appCommon/base/baseAppStoreTypes";
import { UnCaughtCondition, UncaughtEnumType, NotImplementedError, TypeMismatchError, InvalidUsage, UnExpectedRole } from "~/appCommon/base/baseExceptions";
import { IParamStore, TUpdateFromRouteOption } from "~/appCommon/base/baseParamStore";
import { BaseRouterInterceptor } from "~/appCommon/base/baseRouterGuard";
import { TSearchStorePayloadGetter, TSearchStoreOptions, TSearchStoreOnUpdate, ISearchStore } from "~/appCommon/base/baseSearchStoreTypes";
import { TableState, TableStateForceExtra, TableColConfig, TableCol, IBaseTableModels, IBaseTableCtrl, EIOStage } from "~/appCommon/base/baseTableTypes";
import { EFlashType, EUserRole, TCommonUserStateProps, StateMapping, TStateMappingConfig, TWrappedStateMappingConfig, IBaseUserStore } from "~/appCommon/base/baseUserTypes";
import { ERedirectReason, EApiForwardingStage, IRouterInterceptor, IBaseRouterGuard, EApiGuardType, TApiRedirectGuard } from "~/appCommon/base/guardianTypes";
import { EStorageType, IStoreService, IStoreHelper } from "~/appCommon/base/jsonStoreServiceType";
import { StoreHelper } from "~/appCommon/base/storeHelper";
import { VForm } from "~/appCommon/types/vformTypes";
/***
 *
 *    E X T E N D
 *    B A S E
 * */
import { AssertMsg, AssertionError, assert, assertMsg as _assertMsg } from "~/appCommon/extendBase/impls/utils/assert";
import { isRefImpl, asEnum, getAccessibleProperties, asCascadeClass, asUnWrappedVueRefMap, UnWrappedVueRef, TUnWrapVueRef, addStringMappingFromNumEnum, Is } from "~/appCommon/extendBase/impls/utils/typeInferernce";
import { BaseParamStore } from "~/appCommon/extendBase/impls/baseParamStore";
import { BaseStorageService, WatchAndStore, watchAndStore } from "~/appCommon/extendBase/impls/baseStorageService";
import { BaseTableModel } from "~/appCommon/extendBase/impls/baseTableModel";
import { BaseUserStore } from "~/appCommon/extendBase/impls/baseUserStore";
import { DebouncedFunc, TSearchStoreState, TSearchPayload } from "~/appCommon/extendBase/searchStoreType";
import { watchProps, withDebugKey } from "~/appCommon/extendBase/vueUtils";
/**
 *        M I X I N S
 *
 *
 * */
import { CommonMixin } from "~/appCommon/vueMixins/common";
import { appConfigInit } from "./appCommon/extendBase/appConfigs";
import { DateDiff, DateExt } from "~/appCommon/base/addon";
import { BaseSpanCounter } from "~/appCommon/counter/counters_span";
import { BaseReactiveCounter } from "~/appCommon/counter/counter_base";
import { BasePeriodCounter } from "~/appCommon/counter/counters_period";
export declare const is: Is;
export declare const assertMsg: typeof _assertMsg;
export { DateDiff, BaseSpanCounter, BaseReactiveCounter, BasePeriodCounter, AssertionError, AssertMsg, BaseApiGuard, InternalApiGuardHelper, BaseApiService, AppErrorCodes, BaseParamStore, BaseRouterInterceptor, BaseStorageService, BaseTableModel, BaseUserStore, CommonMixin, EApiForwardingStage, EApiGuardType, EFlashType, ERedirectReason, EStorageType, EUserRole, IBaseApiGuardHelper, IBaseAppConfig, IBaseAppStore, IBaseLanguageService, IBaseRouterGuard, IBaseTableCtrl, IBaseTableModels, IBaseUserStore, IInternalBaseApiService, InvalidUsage, IParamStore, IRouterInterceptor, Is, IStoreHelper, IStoreService, NotImplementedError, StoreHelper, TypeMismatchError, UnCaughtCondition, UncaughtEnumType, UnExpectedRole, WatchAndStore, IBaseApiService, BaseAuthGuardHelper, BaseGeneralGuardHelper, EIOStage, addStringMappingFromNumEnum, asCascadeClass, asEnum, assert, asUnWrappedVueRefMap, getAccessibleProperties, isRefImpl, UnWrappedVueRef, watchAndStore, watchProps, withDebugKey, appConfigInit, DebouncedFunc, ISearchStore, StateMapping, TableCol, TableColConfig, TableState, TableStateForceExtra, TApiRedirectGuard, TCommonUserStateProps, TFuzzyResponse, TPager, TSearchPayload, TSearchStoreOnUpdate, TSearchStoreOptions, TSearchStorePayloadGetter, TSearchStoreState, TStateMappingConfig, TUnWrapVueRef, TUpdateFromRouteOption, TWrappedStateMappingConfig, VForm, Optional, ApiGuardConfigOptions, DateExt, };
