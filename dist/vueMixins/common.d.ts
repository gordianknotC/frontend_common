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
export declare function provideFacade<T>(providers: Partial<T>, mergeObj?: boolean, ident?: symbol): void;
export declare function injectDependency<T>(pathOrName: string, ident?: symbol): T;
export declare function injectFacade<T>(ident?: symbol): T;
export declare function IFacade<T extends Object>(ident?: symbol, option?: {
    transformFuncAsGetter: boolean;
}): T;
