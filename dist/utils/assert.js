"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.AssertionError = exports.assertMsg = exports.AssertMsg = void 0;
const extension_setup_1 = require("../extension/extension_setup");
class AssertMsg {
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
exports.AssertMsg = AssertMsg;
exports.assertMsg = new AssertMsg();
class AssertionError extends Error {
    constructor(message) {
        super(`assert error: ${message}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}
exports.AssertionError = AssertionError;
/**
 *
 * @param condition
 * @param message
 */
function assert(condition, message) {
    if (extension_setup_1.currentEnv.value == "develop" && !condition) {
        throw new AssertionError(message !== null && message !== void 0 ? message : "");
    }
}
exports.assert = assert;
//# sourceMappingURL=assert.js.map