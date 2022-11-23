import { CallableDelegate } from "../utils/lazy";
let computedMethod = new CallableDelegate(() => {
    throw new Error("computed method used before setup");
});
let reactiveMethod = new CallableDelegate(() => {
    throw new Error("reactive method used before setup");
});
let refMethod = new CallableDelegate(() => {
    throw new Error("ref method used before setup");
});
let watchMethod = new CallableDelegate(() => {
    throw new Error("watch method used before setup");
});
export const computed = computedMethod;
export const watch = watchMethod;
export const reactive = reactiveMethod;
export const ref = refMethod;
export function setupRef(obj) {
    refMethod.delegate = obj;
}
export function setupComputed(obj) {
    computedMethod.delegate = obj;
}
export function setupReactive(obj) {
    reactiveMethod.delegate = obj;
}
export function setupWatch(obj) {
    watchMethod.delegate = obj;
}
//# sourceMappingURL=extension_setup.js.map