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

class _ObjDelegate<T extends object> extends Object {
  constructor(delegate: T) {
    super(delegate);
    Object.assign(this, delegate);
  }
  omitBy(condition: (key: keyof T, val: T[keyof T]) => boolean): Partial<T> {
    const delegate = { ...this } as any as Partial<T>;
    const entries = Object.entries(this);
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
      result[_] = this[_ as any as keyof typeof this] as any;
    });
    return result;
  }
}

extendExceptConstructor(Object, _ObjDelegate);

export type ObjDelegate<T extends object> = _ObjDelegate<T> & Object;

class _ArrDelegate<S> extends Array<S> {
  constructor(delegate: Array<S>) { 
    super(delegate.length);
    for (let index = 0; index < delegate.length; index++) {
      const element = delegate[index];
      this[index] = element;
    }
   }
  contains (val: S): boolean{
    return this.includes(val);
  }
  add (val: S): number{
    return this.push(val);
  }
  addAll(val: S[]): S[]{
    const l = val.length;
    for (let i = 0; i < l; i++) {
      this.push(val[i]);
    }
    return this;
  }
  remove (val: S): void {
    removeItem(this, val);
  };

  clear(): void{
    this.length = 0;
  }
  where(condition: ConditionCallback<S>): Array<S> {
    return this.filter((v) => condition(v));
  };

  any(condition: ConditionCallback<S>): boolean {
    for (let i = 0; i < this.length; i++) {
      const elt = this[i];
      if (condition(elt)) return true;
    }
    return false;
  };
  fold(initialValue: S, cb: (acc: S, current: S) => S): S {
    return this.reduce((prev, current, currentId, arr) => {
      return cb(prev, current);
    }, initialValue);
  };
  firstWhere(condition: ConditionCallback<S>,orElse?: () => S): S | null {
    for (let i = 0; i < this.length; i++) {
      const elt = this[i];
      if (condition(elt)) {
        return elt;
      }
    }
    if (is.not.initialized(orElse)) return null;
    return orElse!();
  };
  get first(){
    return this[0];
  }
  get last(){
    return this[this.length -1];
  }
}

extendExceptConstructor(Array, _ArrDelegate);

export type ArrayDelegate<S> = _ArrDelegate<S> & Array<S>;

export const Obj = <T extends object>(obj: T): ObjDelegate<T> => {
  return new _ObjDelegate<T>(obj) as ObjDelegate<T>;
};

export const Arr = <S>(obj: Array<S>): ArrayDelegate<S> => {
  return new _ArrDelegate<S>(obj) as ArrayDelegate<S>;
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
    let charCode = val.charCodeAt(i);
    if (charCode < 0x80) utf8.push(charCode);
    else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(
        0xe0 | (charCode >> 12),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charCode =
        0x10000 + (((charCode & 0x3ff) << 10) | (val.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f)
      );
    }
  }
  return utf8;
};

Number.prototype.asInt = function (): number {
  return Math.floor(this as number);
};
 