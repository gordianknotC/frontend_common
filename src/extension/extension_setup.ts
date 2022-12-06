import { ComputedRef, Ref, UnwrapNestedRefs } from "@/base/vueTypes";
import { AssertionError } from "assert";
import { assert } from "console";

import { NotImplementedError } from "~/base/baseExceptions";
import { CallableDelegate, LazyHolder } from "~/utils/lazy";
import { assertMsg } from "..";

export type ExtSetupOption = {
    reactive: any,
    computed: any,
    ref: any,
}
let computedMethod = new CallableDelegate<<T>()=>ComputedRef<T>>(()=>{
    throw new Error("computed method used before setup");
});
let reactiveMethod = new CallableDelegate<<T>(arg: T)=> UnwrapNestedRefs<T>>(()=>{
    throw new Error("reactive method used before setup");
});
let refMethod = new CallableDelegate<<T>(arg?: T)=>Ref<T>>(()=>{
    throw new Error("reactive method used before setup");
});
let watchMethod=new CallableDelegate(()=>{
    throw new Error("watch method used before setup");
});

type TEnv = "develop" | "production" | "release";
let _env: {value: TEnv | undefined} = {value: undefined};

export const computed = computedMethod;
export const watch = watchMethod;
export const reactive = reactiveMethod;
export const ref = refMethod;
export const currentEnv = LazyHolder(()=>{
    if (_env.value == undefined){
        throw new Error("currentEnv not specified");
    }
    return _env;
});


/**
 * 用於外部注入 vue RefImpl constructor 
 * @param refConstructor RefImpl
 */
export function setupRef(refConstructor: any){
    refMethod.delegate = refConstructor;
}
/**
 * 用於外部注入 vue ComputedRef constructor 
 * @param computedConstructor ComputedRef
 */
export function setupComputed(computedConstructor: any){
    computedMethod.delegate = computedConstructor;
}
/**
 * 用於外部注入 vue UnWrappedRef constructor 
 * @param reactiveConstructor UnWrappedRef
 */
export function setupReactive(reactiveConstructor: any){
    reactiveMethod.delegate = reactiveConstructor;
}
/**
 * 用於外部注入 vue watch constructor 
 * @param watchConstructor UnWrappedRef
 */
export function setupWatch(watchConstructor: any){
    watchMethod.delegate = watchConstructor;
}

export function setupCurrentEnv(env: "develop" | "production" | "release"){
    _env.value = env;
} 