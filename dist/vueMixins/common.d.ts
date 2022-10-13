import { WritableComputedRef } from "@vue/reactivity";
export declare class CommonMixin {
    vModelEvents: Set<string>;
    constructor();
    asVModelFromProps<R, T extends object = any>(option: {
        props: Readonly<T>;
        propName: keyof T;
        emit: any;
        onChange: (prev: R, val: R) => void;
    }): WritableComputedRef<R>;
}
export declare function injectFacade<T>(providers: Partial<T>, mergeObj?: boolean): void;
export declare function IFacade<T extends Object>(): T;
