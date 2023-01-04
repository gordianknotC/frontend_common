export declare type TPager = {
    page: number;
    pages?: number;
    per_page: number;
    total?: number;
};
export declare type TPagerPayload = {
    page?: number;
    per_page?: number;
};
export declare type TOptional<T> = T | undefined | null;
export declare type TErrorResponse = {
    error_code: any;
    error_key: string;
    error_msg: string;
    message: string;
};
export declare type TSuccessResponse = {
    succeed: boolean;
};
export declare type TDataResponse<T> = {
    data: T;
    pager?: TPager | null | undefined;
};
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
export declare const CRUD: <T extends {
    id: string | number;
}>(dataList: TOptional<TDataResponse<any[]>>, updater: (data: any[]) => void, itemGen: (idx: number) => T) => {
    add: (payload: T) => Promise<TSuccessResponse>;
    del: (payload: T) => Promise<TSuccessResponse>;
    edit: (payload: T) => Promise<TSuccessResponse>;
    get: (payload?: TPagerPayload) => Promise<TDataResponse<any[]>>;
};
