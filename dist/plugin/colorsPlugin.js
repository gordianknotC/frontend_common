"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColors = void 0;
const tslib_1 = require("tslib");
const colors_1 = tslib_1.__importDefault(require("colors"));
const forWebpackReloadingTypescript = "";
function useColors() {
    colors_1.default.enable();
    colors_1.default.setTheme({
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