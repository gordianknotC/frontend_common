export declare class AssertMsg {
    readonly idNotSpecified = "id not Specified";
    readonly coutryCodeNotSpecified = "country code not Specified";
    readonly methodDecoratorMisused = "method decorator misused";
    readonly getterDecoratorMisused = "getter decorator misused";
    readonly propertyNotInitializedCorrectly = "property Not Initialized Correctly";
    readonly pathNotInitializedCorrectly = "path Not Initialized Correctly";
    readonly typeMissMatched = "Type Miss Matched!";
    readonly appEnvNotInitialized = "appEnvNotInitializedProperly";
    readonly creditCardTypeNotSupported = "credit card type not supported";
    readonly asideBarStateNotSpecified = "asideBarStateNotSpecified";
    readonly routeConfigNotFound = "route config not found";
    readonly actionNotSpecified = "action step not specified";
    readonly entryPointNotFoundInChildren = "entry point not found in children";
    readonly stepNodeNotFound = "stepNode not found";
    readonly cirularDependencyOccurrs = "circular dependency occurs";
    readonly getInjectorBeforeSetup = "injector used before _reportDistributorRouteViewSetup \u932F\u8AA4\u4F7F\u7528 injector, \u8ACB\u5148 _reportDistributorRouteViewSetup";
    unexpectedRouterStage(stage: any): string;
    expectPropertyInitialized(scope: string, prop: string): string;
    unexpectedResponse(url: string, expect: any, actual: any): string;
    WsMatchIdMappingException(number: number): string;
    foundDuplicateConfigurateInDI(name: string): string;
}
export declare const assertMsg: AssertMsg;
export declare class AssertionError extends Error {
    constructor(message: string);
}
/**
 *
 * @param condition - assert to be true, raise assertion error while false
 * @param message
 */
export declare function assert(condition: () => boolean, message?: string): asserts condition;
export declare function ensureNoRaise<T>(action: () => T, defaults: T): T;
