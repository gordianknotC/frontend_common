export function LazyHolder(initializer) {
    let instance;
    return new Proxy({}, {
        get: function (target, name) {
            instance !== null && instance !== void 0 ? instance : (instance = initializer());
            //@ts-ignore
            return instance[name];
        }
    });
}
//# sourceMappingURL=lazy.js.map