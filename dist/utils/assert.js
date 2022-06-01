export class AssertMsg {
    constructor() {
        this.idNotSpecified = "id not Specified";
        this.coutryCodeNotSpecified = "country code not Specified";
        this.methodDecoratorMisused = "method decorator misused";
        this.getterDecoratorMisused = "getter decorator misused";
        this.propertyNotInitializedCorrectly = "property Not Initialized Correctly";
        this.pathNotInitializedCorrectly = "path Not Initialized Correctly";
        this.typeMissMatched = "Type Miss Matched!";
        this.appEnvNotInitialized = "appEnvNotInitializedProperly";
        this.creditCardTypeNotSupported = "credit card type not supported";
        this.asideBarStateNotSpecified = "asideBarStateNotSpecified";
        this.routeConfigNotFound = "route config not found";
        this.actionNotSpecified = "action step not specified";
        this.entryPointNotFoundInChildren = "entry point not found in children";
        this.stepNodeNotFound = "stepNode not found";
        this.cirularDependencyOccurrs = "circular dependency occurs";
        this.getInjectorBeforeSetup = "injector used before _reportDistributorRouteViewSetup 錯誤使用 injector, 請先 _reportDistributorRouteViewSetup";
    }
    unexpectedRouterStage(stage) {
        return `unexpected router stage: ${stage}`;
    }
    ;
    expectPropertyInitialized(scope, prop) {
        return `expect property: ${prop} to be initialized under scope: ${scope}`;
    }
    unexpectedResponse(url, expect, actual) {
        return `fetching url:${url} expect to retrieve a payload of ${expect}, got ${actual}`;
    }
    WsMatchIdMappingException(number) {
        return `failed to match game id: ${number} in current game list`;
    }
    foundDuplicateConfigurateInDI(name) {
        /** 可能是 hot reload... */
        return `found duplicated configuration in dependency injector, configName: ${name}`;
    }
}
export const assertMsg = new AssertMsg();
export class AssertionError extends Error {
    constructor(message) {
        super(`assert error: ${message}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
export function assert(condition, message) {
    if (!condition) {
        throw new AssertionError(message !== null && message !== void 0 ? message : "");
    }
}
//# sourceMappingURL=assert.js.map