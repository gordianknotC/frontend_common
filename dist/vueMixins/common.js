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