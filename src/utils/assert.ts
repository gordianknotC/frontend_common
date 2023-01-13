import { _currentEnv } from "~/extension/extension_setup";

export
class AssertMsg {
    readonly idNotSpecified = "id not Specified";
    readonly coutryCodeNotSpecified = "country code not Specified";
    readonly methodDecoratorMisused = "method decorator misused";
    readonly getterDecoratorMisused = "getter decorator misused" ;
    readonly propertyNotInitializedCorrectly = "property Not Initialized Correctly";
    readonly pathNotInitializedCorrectly = "path Not Initialized Correctly";
    readonly typeMissMatched = "Type Miss Matched!";
    readonly appEnvNotInitialized = "appEnvNotInitializedProperly";
    readonly creditCardTypeNotSupported =  "credit card type not supported";
    readonly asideBarStateNotSpecified = "asideBarStateNotSpecified";
    readonly routeConfigNotFound = "route config not found";
    readonly actionNotSpecified = "action step not specified";
    readonly entryPointNotFoundInChildren = "entry point not found in children";
    readonly stepNodeNotFound = "stepNode not found";
    readonly cirularDependencyOccurrs = "circular dependency occurs";
    readonly getInjectorBeforeSetup =  "injector used before _reportDistributorRouteViewSetup 錯誤使用 injector, 請先 _reportDistributorRouteViewSetup";

    unexpectedRouterStage(stage: any): string{
        return `unexpected router stage: ${stage}`;
    };

    expectPropertyInitialized(scope:string, prop:string){
        return `expect property: ${prop} to be initialized under scope: ${scope}`;
    }

    unexpectedResponse(url: string, expect: any, actual: any, ){
        return `fetching url:${url} expect to retrieve a payload of ${expect}, got ${actual}`;
    }

    WsMatchIdMappingException(number: number) {
        return `failed to match game id: ${number} in current game list`;
    }

    foundDuplicateConfigurateInDI(name: string) {
        /** 可能是 hot reload... */
        return `found duplicated configuration in dependency injector, configName: ${name}`;
    }
}

export
const assertMsg = new AssertMsg();

export
class AssertionError extends Error{
    constructor(message: string){
        super(`AssertionError: ${message}`);
        Object.setPrototypeOf(this, Error.prototype);
    }
}

/**
 * 
 * @param condition - assert to be true, raise assertion error while false
 * @param message 
 */
export
function assert(condition: ()=>boolean, message?: string): asserts condition{
    const devEnv = (_currentEnv.value == "develop" || _currentEnv.value == "test");
    if (devEnv && !condition()){
        throw new AssertionError(message ?? "");
    }
}


export 
function ensureNoRaise<T>(action: ()=> T, defaults: T): T{
    try{
        return action();
    }catch(e){
        console.error(e);
        return defaults;
    }
}