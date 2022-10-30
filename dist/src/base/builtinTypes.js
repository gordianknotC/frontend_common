import { is } from "../../utils/typeInference";
//@ts-ignore   
import format from "../../base/stringFormat";
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
class _Obj {
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
class _Arr {
    constructor(delegate) {
        this.delegate = delegate;
    }
}
export const Obj = (obj) => {
    return new _Obj(obj);
};
export const Arr = (obj) => {
    return new _Arr(obj);
};
Array.prototype.contains = function (val) {
    return this.includes(val);
};
Array.prototype.add = function (val) {
    return this.push(val);
};
Array.prototype.addAll = function (val) {
    const l = val.length;
    for (let i = 0; i < l; i++) {
        this.push(val[i]);
    }
    return this;
};
function removeItem(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
Array.prototype.remove = function (val) {
    removeItem(this, val);
};
Array.prototype.clear = function () {
    this.length = 0;
};
Array.prototype.where = function (condition) {
    return this.filter((v) => condition(v));
};
Array.prototype.any = function (condition) {
    for (let i = 0; i < this.length; i++) {
        const elt = this[i];
        if (condition(elt))
            return true;
    }
    return false;
};
Array.prototype.fold = function (initialValue, cb) {
    return this.reduce((prev, current, cidx, arr) => {
        return cb(prev, current);
    }, initialValue);
};
Array.prototype.firstWhere = function (condition, orElse) {
    for (let i = 0; i < this.length; i++) {
        const elt = this[i];
        if (condition(elt)) {
            return elt;
        }
    }
    if (is.not.initialized(orElse))
        return null;
    return orElse();
};
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
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (val.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
};
Number.prototype.asInt = function () {
    return Math.floor(this);
};
export function useBuiltIn() {
    console.log('builtin initialized');
}
//# sourceMappingURL=builtinTypes.js.map