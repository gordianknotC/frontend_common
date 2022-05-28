import {watch, reactive, UnwrapRef} from "vue";
import {assert} from "~/appCommon/extendBase/impls/utils/assert";
import {isRefImpl} from "~/appCommon/extendBase/impls/utils/typeInferernce";

type TWatchPropOption<T> ={
    props: T,
    initializeOnCall?: boolean,
    config:Partial<{[K in keyof T]: (val: T[K])=> void}>,
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

