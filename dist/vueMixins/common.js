import { computed } from "../base/vueTypes";
import { assert } from "../utils/assert";
export class CommonMixin {
    constructor() {
        this.vModelEvents = new Set();
    }
    asVModelFromProps(props, propName, emit) {
        const event = `update:${propName}`;
        this.vModelEvents.add(event);
        return computed({
            get() {
                return props[propName];
            },
            set(v) {
                emit(event, v);
            }
        });
    }
}
const container = {};
const FACADE_KEY = Symbol();
export function injectFacade(providers) {
    var _a;
    //@ts-ignore
    (_a = container[FACADE_KEY]) !== null && _a !== void 0 ? _a : (container[FACADE_KEY] = {});
    Object.keys(providers).forEach((prop) => {
        //@ts-ignore
        container[FACADE_KEY][prop] = providers[prop];
    });
}
export function IFacade(mapping) {
    return new Proxy({}, {
        get: function (target, name) {
            // @ts-ignore
            const facade = container[FACADE_KEY];
            assert(facade[name] !== undefined, `key name "${name.toString()}" not found in facade`);
            return facade[name];
        }
    });
}
//# sourceMappingURL=common.js.map