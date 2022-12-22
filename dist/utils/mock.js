"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUD = void 0;
// fixme: 寫成 OOP
/**
 * 創建 CRUD api 方法，用於寫測試
 * @param dataList 取得該列表所有資料
 * @param updater  更新該列表所有資料
 * @param itemGen 依 identity 由列表資料取得該 item
 *
 * @example
 * ```ts
 * ...CRUD<PredictionsItem>(
      DB.getPredictionList!,
      data => {
        DB.getPredictionList!.data = data;
      },
      idx => {
        const result: PredictionsItem = {
          is_publish: true,
          view_count: range(700, 6000),
          author: DB.users[range(0, DB.users.length - 1)].username!,
          content: `${idx} - The Resize Observer API provides a solution to exactly these kinds of problems, and more besides, allowing you to easily observe and respond to changes in the size of an element's content or border box in a performant way. `,
          view_shift: range(150, 2000),
          create_datetime: `2022-${range(6, 12)}-${range(1, 30)} 01:22`,
          has_image: false,
          id: idx,
          summary: `${idx} - The Resize Observer API provides a solution to exactly these kinds of problems, `,
          update_datetime: `2022-${range(6, 12)}-${range(1, 30)} 01:22`,
          admin: {
            id: idx,
            role: 0,
            username: DB.users[range(0, DB.users.length - 1)].username!
          },
          like_count: range(60, 300),
          publish_datetime: `2022-${range(6, 12)}-${range(1, 30)} 01:22`,
          title: `Loream Ipsum-${idx} dolo sit amet`
        };
        return result;
      }
    )
 * ```
 */
const CRUD = (dataList, updater, itemGen) => {
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
exports.CRUD = CRUD;
//# sourceMappingURL=mock.js.map