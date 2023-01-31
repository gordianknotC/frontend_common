"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupReactInstance = void 0;
const extension_setup_1 = require("../extension_setup");
function setupReactInstance(opt) {
    (0, extension_setup_1.setupComputed)(opt.computed);
    (0, extension_setup_1.setupRef)(opt.ref);
    (0, extension_setup_1.setupReactive)(opt.reactive);
}
exports.setupReactInstance = setupReactInstance;
//# sourceMappingURL=react_setup.js.map