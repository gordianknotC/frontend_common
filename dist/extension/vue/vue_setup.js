import { setupComputed, setupReactive, setupRef } from "../extension_setup";
export function setupVueInstance(opt) {
    setupComputed(opt.computed);
    setupRef(opt.ref);
    setupReactive(opt.reactive);
}
//# sourceMappingURL=vue_setup.js.map