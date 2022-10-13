import { merge } from "merge-anything";
import { computed, watch } from "../base/vueTypes";
import { assert } from "../utils/assert";
export class CommonMixin {
    constructor() {
        this.vModelEvents = new Set();
    }
    asVModelFromProps(option) {
        const event = `update:${option.propName}`;
        this.vModelEvents.add(event);
        const ret = computed({
            get() {
                return option.props[option.propName];
            },
            set(v) {
                option.onChange(option.props[option.propName], v);
                option.emit(event, v);
            }
        });
        watch(() => option.props[option.propName], option.onChange);
        return ret;
    }
}
const container = {};
const FACADE_KEY = Symbol();
export function provideFacade(providers, mergeObj = false, ident = FACADE_KEY) {
    var _a;
    (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
    if (!mergeObj) {
        Object.keys(providers).forEach((prop) => {
            container[ident][prop] = providers[prop];
        });
    }
    else {
        Object.keys(providers).forEach((prop) => {
            if (container[ident][prop]) {
                container[ident][prop] = merge(container[ident][prop], providers[prop]);
            }
            else {
                container[ident][prop] = providers[prop];
            }
        });
    }
}
export function injectDependency(pathOrName, ident = FACADE_KEY) {
    if (pathOrName.contains(".")) {
        return accessByPath(pathOrName, container[ident]);
    }
    else {
        return container[ident][pathOrName];
    }
}
export function injectFacade(ident = FACADE_KEY) {
    return container[ident];
}
function routeObjectByPath(seg, obj) {
    const first = seg[0];
    const last = seg[1];
    if (last.length == 1) {
        return obj[first][last[0]];
    }
    else {
        return routeObjectByPath([last[0], last.splice(1)], obj[first]);
    }
}
function accessByPath(path, obj) {
    const segment = path.split(".");
    const pathObj = [segment[0], segment.splice(1)];
    return routeObjectByPath(pathObj, obj);
}
export function IFacade(ident = FACADE_KEY) {
    return new Proxy({}, {
        get: function (target, name) {
            var _a;
            (_a = container[ident]) !== null && _a !== void 0 ? _a : (container[ident] = {});
            const facade = container[ident];
            assert(facade[name] !== undefined, `key name "${name.toString()}" not found in facade`);
            return facade[name];
        }
    });
}
//# sourceMappingURL=common.js.map