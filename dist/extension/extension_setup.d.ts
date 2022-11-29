import { CallableDelegate } from "../utils/lazy";
export declare type ExtSetupOption = {
    reactive: any;
    computed: any;
    ref: any;
};
declare type TEnv = "develop" | "production" | "release";
export declare const computed: CallableDelegate<() => never>;
export declare const watch: CallableDelegate<() => never>;
export declare const reactive: CallableDelegate<() => never>;
export declare const ref: CallableDelegate<() => never>;
export declare const currentEnv: {
    value: TEnv | undefined;
};
/**
 * 用於外部注入 vue RefImpl constructor
 * @param refConstructor RefImpl
 */
export declare function setupRef(refConstructor: any): void;
/**
 * 用於外部注入 vue ComputedRef constructor
 * @param computedConstructor ComputedRef
 */
export declare function setupComputed(computedConstructor: any): void;
/**
 * 用於外部注入 vue UnWrappedRef constructor
 * @param reactiveConstructor UnWrappedRef
 */
export declare function setupReactive(reactiveConstructor: any): void;
/**
 * 用於外部注入 vue watch constructor
 * @param watchConstructor UnWrappedRef
 */
export declare function setupWatch(watchConstructor: any): void;
export declare function setupCurrentEnv(env: "develop" | "production" | "release"): void;
export {};
