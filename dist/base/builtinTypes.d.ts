declare type ConditionCallback<T> = (x: T) => boolean;
declare global {
    interface Number {
        asInt(): number;
    }
    interface String {
        contains(val: string): boolean;
        toAsciiArray(): number[];
        format(option: any): string;
        trimRightChar(char: string): string;
        /** colors.js*/
        strip: string;
        stripColors: string;
        america: string;
        bgBlack: string;
        bgBlue: string;
        bgBrightBlue: string;
        bgBrightCyan: string;
        bgBrightGreen: string;
        bgBrightMagenta: string;
        bgBrightRed: string;
        bgBrightWhite: string;
        bgBrightYellow: string;
        bgCyan: string;
        bgGray: string;
        bgGreen: string;
        bgGrey: string;
        bgMagenta: string;
        bgRed: string;
        bgWhite: string;
        bgYellow: string;
        black: string;
        blackBG: string;
        blue: string;
        blueBG: string;
        brightBlue: string;
        brightCyan: string;
        brightGreen: string;
        brightMagenta: string;
        brightRed: string;
        brightWhite: string;
        brightYellow: string;
        cyan: string;
        cyanBG: string;
        data: string;
        debug: string;
        error: string;
        gray: string;
        green: string;
        greenBG: string;
        grey: string;
        help: string;
        info: string;
        input: string;
        magenta: string;
        magentaBG: string;
        prompt: string;
        red: string;
        redBG: string;
        silly: string;
        verbose: string;
        warn: string;
        white: string;
        whiteBG: string;
        yellow: string;
        yellowBG: string;
        bold: string;
        reset: string;
        dim: string;
        italic: string;
        underline: string;
        inverse: string;
        hidden: string;
        strikethrough: string;
        rainbow: string;
        zebra: string;
        trap: string;
        random: string;
        zalgo: string;
    }
}
declare class _ObjDelegate<T extends object> {
    delegate: T;
    constructor(delegate: T);
    omitBy(condition: (key: keyof T, val: T[keyof T]) => boolean): Partial<T>;
    stripEmptyProperties<E extends Array<string>>(props: E): Omit<T, E[number]>;
    pick(elements: Array<Partial<keyof T>>): Partial<T>;
}
export declare type ObjDelegate<T extends object> = _ObjDelegate<T> & Object;
declare class _ArrDelegate<S, T extends Array<S>> {
    delegate: T;
    constructor(delegate: T);
    contains(val: S): boolean;
    add(val: S): number;
    addAll(val: S[]): S[];
    remove(val: S): void;
    clear(): void;
    where(condition: ConditionCallback<S>): Array<S>;
    any(condition: ConditionCallback<S>): boolean;
    fold(initialValue: S, cb: (acc: S, current: S) => S): S;
    firstWhere(condition: ConditionCallback<S>, orElse?: () => S): S | null;
    get first(): S;
    get last(): S;
}
export declare type ArrayDelegate<S, T extends Array<S>> = _ArrDelegate<S, T> & Array<S>;
export declare const Obj: <T extends object>(obj: T) => ObjDelegate<T>;
export declare const Arr: <S, T extends S[]>(obj: T) => ArrayDelegate<S, T>;
export declare function useBuiltIn(): void;
export {};
