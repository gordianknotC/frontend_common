export declare type PickOne<T> = {
    [P in keyof T]: Record<P, T[P]> & Partial<Record<Exclude<keyof T, P>, undefined>>;
}[keyof T];
export declare type Optional<T> = T | undefined | null;
