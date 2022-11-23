import { CallableDelegate } from "../utils/lazy";
export declare type ExtSetupOption = {
    reactive: any;
    computed: any;
    ref: any;
};
export declare const computed: CallableDelegate<() => never>;
export declare const watch: CallableDelegate<() => never>;
export declare const reactive: CallableDelegate<() => never>;
export declare const ref: CallableDelegate<() => never>;
export declare function setupRef(obj: any): void;
export declare function setupComputed(obj: any): void;
export declare function setupReactive(obj: any): void;
export declare function setupWatch(obj: any): void;
