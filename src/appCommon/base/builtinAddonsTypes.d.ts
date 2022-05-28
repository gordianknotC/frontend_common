declare type ConditionCallback<T> = (x: T) => boolean;
declare global {
    interface Array<T> {
        contains(val: T): boolean;
        remove(val: T): void;
        any(val: ConditionCallback<T>): boolean;
        where(val: ConditionCallback<T>): Array<T>;
        firstWhere(val: ConditionCallback<T>, orElse?: () => T): T | null;
        fold(initialValue: T, cb: (acc: T, current: T) => T): T;
        add(val: T): number;
        addAll(val: T[]): T[];
        clear(): void;
        readonly first: T;
        readonly last: T;
    }
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
export declare function useBuiltIn(): void;
export {};
