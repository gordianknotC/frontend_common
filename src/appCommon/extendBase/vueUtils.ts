import {watch, reactive, UnwrapRef} from "vue";
import {assert} from "~/appCommon/extendBase/impls/utils/assert";
import {isRefImpl} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {getAppConfigs} from "~/appCommon/extendBase/appConfigs";

type TWatchPropOption<T> ={
    props: T,
    initializeOnCall?: boolean,
    config:Partial<{[K in keyof T]: (val: T[K])=> void}>,
}

type TPropNamesGuardOption<T> ={
    props: T,
    properties: string[],
}

type TAssertVModel<T> ={
    vModel: UnwrapRef<T>,
    config:Partial<{[K in keyof UnwrapRef<T>]: (val: UnwrapRef<T>[K])=> UnwrapRef<T>[K]}>,
}


/**
 *  偵聽 vue props on change
 *  prop於母層更新時，接收該prop 的子層組件除非特別偵聽 on change
 *  否則不會更新(如直接引用 props render 於 vue template)，子層
 *  組件並不會因為母層 prop 更新後而更新，而是因為子層 watch 母層 prop
 *  on change 才會更新
 *
 *  @params initializeOnCall - 用於 onMounted stage
 *                        true : watchProps 後 會先初始化 config 的內容
 *                        false: 不會初始化
 *
 * */
export
function watchProps<T>(option: TWatchPropOption<T>){
    option.initializeOnCall ??= true;
    const {props, config, initializeOnCall} = option;
    Object.keys(config).forEach((_propname) => {
        const propName = _propname as keyof typeof props;
        const val      = props[propName];

        assert(!isRefImpl(val),
            "UnSupportedWatchableObject: Failed to watch on vueProps, " +
            "since watch on RefImpl within another RefImpl(props) is not supported yet!"
        );

        watch(()=>props[propName], function(){
            config[propName]!(props[propName]);
        });

        if(initializeOnCall){
            config[propName]!(props[propName]);
        }
    })
}

export
function propNamesGuard<T>(option: TPropNamesGuardOption<T>){
    const {props, properties} = option;
    if (!getAppConfigs()!.isInProductionMode){
        console.log("propname guard1".red, "keys:", Object.keys(props), props)
        Object.keys(props).forEach((key) => {
            assert(properties.contains(key), `property guard, invalid key:${key}`);
        })
    }
}

export
function vModelTypeGuard<T>(option: TAssertVModel<T>){
    const {vModel, config} = option;
    Object.keys(config).forEach((_propname) => {
        const propName = _propname as keyof typeof vModel;
        watch(()=>vModel[propName], function(){
            const value = config[propName]!(vModel[propName]);
            if (vModel[propName] !== value){
                vModel[propName] = value;
            }
        });
    })
}


/**
 *    vue 組件 debug 用，debug key 會將該組件存於
 *    window._$debug.[debugKey]
 * */
export
function withDebugKey<T>(key: string, anyThing: T): T {
    if (!getAppConfigs()!.isInProductionMode){
        (window as any)._$debug ??= {};
        (window as any)._$debug[key] = anyThing;
        (window as any)._$debug["reactive"] ??= reactive;
    }
    return anyThing;
}




