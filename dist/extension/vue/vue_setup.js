"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupVueInstance = void 0;
const extension_setup_1 = require("../extension_setup");
function setupVueInstance(opt) {
    (0, extension_setup_1.setupComputed)(opt.computed);
    (0, extension_setup_1.setupRef)(opt.ref);
    (0, extension_setup_1.setupReactive)(opt.reactive);
}
exports.setupVueInstance = setupVueInstance;
//# sourceMappingURL=vue_setup.js.map