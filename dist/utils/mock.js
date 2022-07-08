// fixme: 寫成 OOP
export const CRUD = (dataList, updater, itemGen) => {
    return {
        add(payload) {
            let id = dataList.data.length;
            payload.id = id.toString();
            dataList.data.push(payload);
            updater(dataList.data);
            return new Promise((resolve, reject) => resolve({ succeed: false }));
        },
        del(payload) {
            let id = 0;
            for (let i = 0; i < dataList.data.length; i++) {
                const x = dataList.data[i];
                if (x.id == payload.id) {
                    id = i;
                    dataList.data = dataList.data.filter((_) => _.id !== payload.id);
                    return new Promise((resolve, reject) => resolve({ succeed: true }));
                }
            }
            return new Promise((resolve, reject) => resolve({ succeed: false }));
        },
        edit(payload) {
            for (let i = 0; i < dataList.data.length; i++) {
                const x = dataList.data[i];
                if (x.id == payload.id) {
                    dataList.data[i] = Object.assign(dataList.data[i], payload);
                    return new Promise((resolve, reject) => resolve({ succeed: true }));
                }
            }
            return new Promise((resolve, reject) => resolve({ succeed: false }));
        },
        get(payload) {
            var _a, _b;
            let idx = 0;
            const page = (_a = payload === null || payload === void 0 ? void 0 : payload.page) !== null && _a !== void 0 ? _a : 1;
            const per_page = (_b = payload === null || payload === void 0 ? void 0 : payload.per_page) !== null && _b !== void 0 ? _b : 10;
            const total = 20;
            const pages = Math.floor(total / per_page + 0.5);
            console.log(page, pages, per_page, total);
            const fromPg = (page - 1) * per_page;
            const toPg = Math.min(Math.min(page, pages) * per_page, total);
            dataList !== null && dataList !== void 0 ? dataList : (dataList = {
                data: (new Array(total).fill((_) => 0).map((_) => {
                    idx++;
                    return itemGen(idx);
                })),
                pager: { page, per_page, total: 15 },
            });
            const result = {
                data: dataList.data.slice(fromPg, toPg),
                pager: { page, per_page, total: 15 }
            };
            console.log("slice:", fromPg, toPg);
            return new Promise((resolve, reject) => resolve(result));
        },
    };
};
//# sourceMappingURL=mock.js.map