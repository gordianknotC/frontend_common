import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import format from "string-format";
import {DateDiff} from "~/appCommon/base/addon";

type ConditionCallback<T> = (x: T) => boolean;

declare global {
  interface Array<T> {
    contains(val: T): boolean;

    remove(val: T): void;

    any(val: ConditionCallback<T>): boolean;

    where(val: ConditionCallback<T>): Array<T>;

    firstWhere(val: ConditionCallback<T>, orElse?: () => T): T | null;

    fold(initialValue: T,  cb: (acc:T, current:T)=>T): T;

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

    america: string,
    bgBlack: string,
    bgBlue: string,
    bgBrightBlue: string,
    bgBrightCyan: string,
    bgBrightGreen: string,
    bgBrightMagenta: string,
    bgBrightRed: string,
    bgBrightWhite: string,
    bgBrightYellow: string,
    bgCyan: string,
    bgGray: string,
    bgGreen: string,
    bgGrey: string,
    bgMagenta: string,
    bgRed: string,
    bgWhite: string,
    bgYellow: string,
    black: string,
    blackBG: string,
    blue: string,
    blueBG: string,
    brightBlue: string,
    brightCyan: string,
    brightGreen: string,
    brightMagenta: string,
    brightRed: string,
    brightWhite: string,
    brightYellow: string,
    cyan: string,
    cyanBG: string,
    data: string,
    debug: string,
    error: string,
    gray: string,
    green: string,
    greenBG: string,
    grey: string,
    help: string,
    info: string,
    input: string,
    magenta: string,
    magentaBG: string,
    prompt: string,
    red: string,
    redBG: string,
    silly: string,
    verbose: string,
    warn: string,
    white: string,
    whiteBG: string,
    yellow: string,
    yellowBG: string,

    // @ts-ignore
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

  interface Date {
    envNow(): Date;

    difference(input: this): DateDiff;

    isWithin(a: Date | string, b: Date | string): boolean;

    subtract(input: number): Date;

    toQueryString(): string;

    toLabelString(): string;

    TODAY: string;
    YESTERDAY: string;
    THIS_WEEK: string[];
    LAST_WEEK: string[];
    THIS_MONTH: string[];
    LAST_MONTH: string[];
    YEARS_AGO: (year: number) => string[]
  }
}


// 以下改寫入 common, 以 patch 的方式實作
//
Object.defineProperty(Array.prototype, "first", {
  get: function first() {
    return this[0];
  }
});


Object.defineProperty(Array.prototype, "last", {
  get: function first() {
    return this[this.length - 1];
  }
});


Array.prototype.contains = function <T>(val: T): boolean {
  return this.includes(val);
}

Array.prototype.add = function <T>(val: T): number {
  return this.push(val);
}

Array.prototype.addAll = function <T>(val: T[]): T[] {
  const l = val.length;
  for (let i = 0; i < l; i++) {
    this.push(val[i]);
  }
  return this;
}

function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

Array.prototype.remove = function <T>(val: T): void {
  removeItem(this, val);
}

Array.prototype.clear = function (): void {
  this.length = 0;
}

Array.prototype.where = function <T>(condition: ConditionCallback<T>): Array<T> {
  return this.filter((v) => condition(v));
}

Array.prototype.any = function <T>(condition: ConditionCallback<T>): boolean {
  for (let i = 0; i < this.length; i++) {
    const elt = this[i];
    if (condition(elt))
      return true;
  }
  return false;
}

Array.prototype.fold = function<T>(initialValue: T,  cb: (acc:T, current:T)=>T): T{
  return this.reduce((prev, current, cidx, arr)=>{
    return cb(prev, current);
  }, initialValue)
}

Array.prototype.firstWhere = function <T>(condition: ConditionCallback<T>, orElse?: () => T): T | null {
  for (let i = 0; i < this.length; i++) {
    const elt = this[i];
    if (condition(elt)) {
      return elt;
    }
  }
  if (is.not.initialized(orElse))
    return null;
  return orElse!();
}

// String.prototype.splitRight = function(splitter: string, n: number = 1){
//   let current: string = this as any;
//   const idx = current.lastIndexOf(splitter);
//
// }

String.prototype.trimRightChar = function(charToRemove: string) {
  let result: string = this as any;
  while(result.charAt(result.length - 1)==charToRemove) {
    result=result.substring(0, result.length - 1);
  }
  return result;
}

String.prototype.contains = function (val: string): boolean {
  return this.includes(val);
}

String.prototype.format = function (option: any): string {
  return format(this as any, option);
}


export function useBuiltin(){

}
