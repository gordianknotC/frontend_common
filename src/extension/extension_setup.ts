import { NotImplementedError } from "~/base/baseExceptions";
import { CallableDelegate, LazyHolder } from "~/utils/lazy";


export type ExtSetupOption = {
    reactive: any,
    computed: any,
    ref: any,
}
let computedMethod = new CallableDelegate(()=>{
    throw new Error("computed method used before setup");
});
let reactiveMethod = new CallableDelegate(()=>{
    throw new Error("reactive method used before setup");
});
let refMethod = new CallableDelegate(()=>{
    throw new Error("ref method used before setup");
});
let watchMethod=new CallableDelegate(()=>{
    throw new Error("watch method used before setup");
});

export const computed = computedMethod;
export const watch = watchMethod;
export const reactive = reactiveMethod;
export const ref = refMethod;

export function setupRef(obj: any){
    refMethod.delegate = obj;
}
export function setupComputed(obj: any){
    computedMethod.delegate = obj;
}
export function setupReactive(obj: any){
    reactiveMethod.delegate = obj;
}
export function setupWatch(obj: any){
    watchMethod.delegate = obj;
}

