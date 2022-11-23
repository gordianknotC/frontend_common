import { setupComputed, setupReactive, setupRef } from "../extension_setup";
export function setupReactInstance(opt) {
    setupComputed(opt.computed);
    setupRef(opt.ref);
    setupReactive(opt.reactive);
}
//# sourceMappingURL=react_setup.js.map