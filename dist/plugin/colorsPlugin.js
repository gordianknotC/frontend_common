"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColors = void 0;
const tslib_1 = require("tslib");
const safe_1 = tslib_1.__importDefault(require("colors/safe"));
const forWebpackReloadingTypescript = "";
function useColors() {
    // colors.enable();
    safe_1.default.setTheme({
        silly: "rainbow",
        input: "grey",
        verbose: "cyan",
        prompt: "grey",
        info: "green",
        data: "grey",
        help: "cyan",
        warn: "yellow",
        debug: "blue",
        error: "red"
    });
}
exports.useColors = useColors;
//# sourceMappingURL=colorsPlugin.js.map