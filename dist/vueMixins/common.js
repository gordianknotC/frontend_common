import { computed } from "base/vueTypes";
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
//# sourceMappingURL=common.js.map