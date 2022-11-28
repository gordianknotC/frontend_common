import { is } from "../utils/typeInference";
//@ts-ignore
import format from "../base/stringFormat";
function extendExceptConstructor(master, slave) {
    Object.keys(master.prototype).forEach((key) => {
        if (key != "constructor") {
            slave.prototype[key] = function (...args) {
                return master.prototype[key].call(this, ...args);
            };
        }
    });
}
class _ObjDelegate {
    constructor(delegate) {
        this.delegate = delegate;
    }
    omitBy(condition) {
        const delegate = { ...this.delegate };
        const entries = Object.entries(this.delegate);
        for (let i = 0; i < entries.length; i++) {
            const [key, val] = entries[i];
            if (condition(key, val)) {
                delete delegate[key];
            }
        }
        return delegate;
    }
    stripEmptyProperties(props) {
        return this.omitBy((k, v) => props.includes(k));
    }
    pick(elements) {
        const result = {};
        elements.forEach((_) => {
            result[_] = this.delegate[_];
        });
        return result;
    }
}
extendExceptConstructor(Object, _ObjDelegate);
class _ArrDelegate {
    constructor(delegate) {
        this.delegate = delegate;
    }
    contains(val) {
        return this.delegate.includes(val);
    }
    add(val) {
        return this.delegate.push(val);
    }
    addAll(val) {
        const l = val.length;
        for (let i = 0; i < l; i++) {
            this.delegate.push(val[i]);
        }
        return this.delegate;
    }
    remove(val) {
        removeItem(this.delegate, val);
    }
    ;
    clear() {
        this.delegate.length = 0;
    }
    where(condition) {
        return this.delegate.filter((v) => condition(v));
    }
    ;
    any(condition) {
        for (let i = 0; i < this.delegate.length; i++) {
            const elt = this.delegate[i];
            if (condition(elt))
                return true;
        }
        return false;
    }
    ;
    fold(initialValue, cb) {
        return this.delegate.reduce((prev, current, cidx, arr) => {
            return cb(prev, current);
        }, initialValue);
    }
    ;
    firstWhere(condition, orElse) {
        for (let i = 0; i < this.delegate.length; i++) {
            const elt = this.delegate[i];
            if (condition(elt)) {
                return elt;
            }
        }
        if (is.not.initialized(orElse))
            return null;
        return orElse();
    }
    ;
    get first() {
        return this.delegate[0];
    }
    get last() {
        return this.delegate[this.delegate.length - 1];
    }
}
extendExceptConstructor(Array, _ArrDelegate);
export const Obj = (obj) => {
    return new _ObjDelegate(obj);
};
export const Arr = (obj) => {
    return new _ArrDelegate(obj);
};
function removeItem(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
String.prototype.trimRightChar = function (charToRemove) {
    let result = this;
    while (result.charAt(result.length - 1) == charToRemove) {
        result = result.substring(0, result.length - 1);
    }
    return result;
};
String.prototype.contains = function (val) {
    return this.includes(val);
};
String.prototype.format = function (option) {
    return format(this, option);
};
String.prototype.toAsciiArray = function () {
    const utf8 = [];
    const val = this;
    for (let i = 0; i < val.length; i++) {
        let charcode = val.charCodeAt(i);
        if (charcode < 0x80)
            utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode =
                0x10000 + (((charcode & 0x3ff) << 10) | (val.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
};
Number.prototype.asInt = function () {
    return Math.floor(this);
};
export function useBuiltIn() {
    console.log("builtin initialized");
}
//# sourceMappingURL=builtinTypes.js.map