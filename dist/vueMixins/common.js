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
export function provideFacade(providers, mergeObj = false) {
    var _a;
    (_a = container[FACADE_KEY]) !== null && _a !== void 0 ? _a : (container[FACADE_KEY] = {});
    if (!mergeObj) {
        Object.keys(providers).forEach((prop) => {
            container[FACADE_KEY][prop] = providers[prop];
        });
    }
    else {
        Object.keys(providers).forEach((prop) => {
            if (container[FACADE_KEY][prop]) {
                container[FACADE_KEY][prop] = merge(container[FACADE_KEY][prop], providers[prop]);
            }
            else {
                container[FACADE_KEY][prop] = providers[prop];
            }
        });
    }
}
function getByPath(seg, obj) {
    const first = seg[0];
    const last = seg[1];
    if (last.length == 1) {
        return obj[first][last[0]];
    }
    else {
        return getByPath([last[0], last.splice(1)], obj[first]);
    }
}
function pathRoute(path, obj) {
    const segment = path.split(".");
    const pathObj = [segment[0], segment.splice(1)];
    return getByPath(pathObj, obj);
}
export function IFacade() {
    return new Proxy({}, {
        get: function (target, name) {
            var _a;
            (_a = container[FACADE_KEY]) !== null && _a !== void 0 ? _a : (container[FACADE_KEY] = {});
            const facade = container[FACADE_KEY];
            assert(facade[name] !== undefined, `key name "${name.toString()}" not found in facade`);
            return facade[name];
        }
    });
}
//# sourceMappingURL=common.js.map