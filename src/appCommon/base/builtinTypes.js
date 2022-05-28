import { is } from "~/appCommon/extendBase/impls/utils/typeInferernce";
import format from "string-format";
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
// String.prototype.splitRight = function(splitter: string, n: number = 1){
//   let current: string = this as any;
//   const idx = current.lastIndexOf(splitter);
//
// }
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
export function useBuiltin() {
}
//# sourceMappingURL=builtinTypes.js.map