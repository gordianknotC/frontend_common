import { WritableComputedRef } from "@vue/reactivity";
declare type TEmitFn<E> = (event: E, ...args: any[]) => void;
export declare class CommonMixin {
    vModelEvents: Set<string>;
    constructor();
    asVModelFromProps<R, T extends object = any>(props: Readonly<T>, propName: keyof T, emit: TEmitFn<any>): WritableComputedRef<R>;
}
export {};
