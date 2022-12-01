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
class _ObjDelegate extends Object {
    constructor(delegate) {
        super(delegate);
        Object.assign(this, delegate);
    }
    omitBy(condition) {
        const delegate = { ...this };
        const entries = Object.entries(this);
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
            result[_] = this[_];
        });
        return result;
    }
}
extendExceptConstructor(Object, _ObjDelegate);
class _ArrDelegate extends Array {
    constructor(delegate) {
        super(delegate.length);
        for (let index = 0; index < delegate.length; index++) {
            const element = delegate[index];
            this[index] = element;
        }
    }
    contains(val) {
        return this.includes(val);
    }
    add(val) {
        return this.push(val);
    }
    addAll(val) {
        const l = val.length;
        for (let i = 0; i < l; i++) {
            this.push(val[i]);
        }
        return this;
    }
    remove(val) {
        removeItem(this, val);
    }
    ;
    clear() {
        this.length = 0;
    }
    where(condition) {
        return this.filter((v) => condition(v));
    }
    ;
    any(condition) {
        for (let i = 0; i < this.length; i++) {
            const elt = this[i];
            if (condition(elt))
                return true;
        }
        return false;
    }
    ;
    fold(initialValue, cb) {
        return this.reduce((prev, current, currentId, arr) => {
            return cb(prev, current);
        }, initialValue);
    }
    ;
    firstWhere(condition, orElse) {
        for (let i = 0; i < this.length; i++) {
            const elt = this[i];
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
        return this[0];
    }
    get last() {
        return this[this.length - 1];
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
        let charCode = val.charCodeAt(i);
        if (charCode < 0x80)
            utf8.push(charCode);
        else if (charCode < 0x800) {
            utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        }
        else if (charCode < 0xd800 || charCode >= 0xe000) {
            utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charCode =
                0x10000 + (((charCode & 0x3ff) << 10) | (val.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charCode >> 18), 0x80 | ((charCode >> 12) & 0x3f), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
        }
    }
    return utf8;
};
Number.prototype.asInt = function () {
    return Math.floor(this);
};
//# sourceMappingURL=builtinTypes.js.map