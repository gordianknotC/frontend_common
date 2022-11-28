import { is } from "~/utils/typeInference";
//@ts-ignore
import format from "~/base/stringFormat";

type ConditionCallback<T> = (x: T) => boolean;

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
}



function extendExceptConstructor(master: any, slave: any){
  Object.keys(master.prototype).forEach((key)=>{
    type slaveKey = keyof typeof slave.prototype;
    type MasterKey = keyof typeof master.prototype;
    if (key != "constructor"){
      slave.prototype[key as slaveKey] = function(...args: any[]){
        return master.prototype[key as MasterKey].call(this, ...args);
      }
    }
  });
}

class _ObjDelegate<T extends object> {
  constructor(public delegate: T) {}
  omitBy(condition: (key: keyof T, val: T[keyof T]) => boolean): Partial<T> {
    const delegate = { ...this.delegate };
    const entries = Object.entries(this.delegate);
    for (let i = 0; i < entries.length; i++) {
      const [key, val] = entries[i] as [keyof T, T[keyof T]];
      if (condition(key, val)) {
        delete delegate[key];
      }
    }
    return delegate;
  }
  stripEmptyProperties<E extends Array<string>>(props: E): Omit<T, E[number]> {
    return this.omitBy((k, v) => props.includes(k as string)) as Omit<
      T,
      E[number]
    >;
  }
  pick(elements: Array<Partial<keyof T>>): Partial<T> {
    const result: Partial<T> = {};
    elements.forEach((_) => {
      result[_] = this.delegate[_];
    });
    return result;
  }
}

extendExceptConstructor(Object, _ObjDelegate);

export type ObjDelegate<T extends object> = _ObjDelegate<T> & Object;

class _ArrDelegate<S, T extends Array<S>> {
  constructor(public delegate: T) {  }
  contains (val: S): boolean{
    return this.delegate.includes(val);
  }
  add (val: S): number{
    return this.delegate.push(val);
  }
  addAll(val: S[]): S[]{
    const l = val.length;
    for (let i = 0; i < l; i++) {
      this.delegate.push(val[i]);
    }
    return this.delegate;
  }
  remove (val: S): void {
    removeItem(this.delegate, val);
  };

  clear(): void{
    this.delegate.length = 0;
  }
  where(condition: ConditionCallback<S>): Array<S> {
    return this.delegate.filter((v) => condition(v));
  };

  any(condition: ConditionCallback<S>): boolean {
    for (let i = 0; i < this.delegate.length; i++) {
      const elt = this.delegate[i];
      if (condition(elt)) return true;
    }
    return false;
  };
  fold(initialValue: S, cb: (acc: S, current: S) => S): S {
    return this.delegate.reduce((prev, current, cidx, arr) => {
      return cb(prev, current);
    }, initialValue);
  };
  firstWhere(condition: ConditionCallback<S>,orElse?: () => S): S | null {
    for (let i = 0; i < this.delegate.length; i++) {
      const elt = this.delegate[i];
      if (condition(elt)) {
        return elt;
      }
    }
    if (is.not.initialized(orElse)) return null;
    return orElse!();
  };
  get first(){
    return this.delegate[0];
  }
  get last(){
    return this.delegate[this.delegate.length -1];
  }
}

extendExceptConstructor(Array, _ArrDelegate);

export type ArrayDelegate<S, T extends Array<S>> = _ArrDelegate<S, T> & Array<S>;

export const Obj = <T extends object>(obj: T): ObjDelegate<T> => {
  return new _ObjDelegate<T>(obj) as ObjDelegate<T>;
};

export const Arr = <S, T extends Array<S>>(obj: T): ArrayDelegate<S, T> => {
  return new _ArrDelegate<S, T>(obj) as ArrayDelegate<S, T>;
};


function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

String.prototype.trimRightChar = function (charToRemove: string) {
  let result: string = this as any;
  while (result.charAt(result.length - 1) == charToRemove) {
    result = result.substring(0, result.length - 1);
  }
  return result;
};

String.prototype.contains = function (val: string): boolean {
  return this.includes(val);
};

String.prototype.format = function (option: any): string {
  return format(this as any, option);
};

String.prototype.toAsciiArray = function (): number[] {
  const utf8 = [];
  const val = this;
  for (let i = 0; i < val.length; i++) {
    let charcode = val.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (val.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return utf8;
};

Number.prototype.asInt = function (): number {
  return Math.floor(this as number);
};

export function useBuiltIn() {
  console.log("builtin initialized");
}
