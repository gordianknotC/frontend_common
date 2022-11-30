
<!--#-->
# Writing pseudo code for api - 測試API工具

## CRUD

有時開發時程不允許寫單元測試，只好透過寫假Api餵假資料，CRUD 提供單一Api所需的 Create/Read/Update/Delete 所需的界面。


```ts
export type TSuccessResponse = {
    succeed: boolean;
};

export type TDataResponse<T> = {
    data: T;
    pager?: TPager | null | undefined;
};

/**
 * @param dataList 取得該列表所有資料
 * @param updater  更新該列表所有資料 
 * @param itemGen 依 identity 由列表資料取得該 item
 */
const CRUD = <T extends {id: string|number}>(
  dataList: TOptional<TDataResponse<any[]>>,
  updater:(data: any[])=>void,
  itemGen: (idx: number)=>T
): {
    add: (payload: T)=>Promise<TSuccessResponse>,
    del: (payload: T)=>Promise<TSuccessResponse>,
    edit: (payload: T)=>Promise<TSuccessResponse>,
    get: (payload?: TPagerPayload)=>Promise<TDataResponse<any[]>>,
  }
```

### Example
```ts
const api = {
    news: {
        ...CRUD<NewsItem>(
            DB.getNewsList!,
            data => {
                DB.getNewsList!.data = data;
            },
            idx => {
                const result: NewsItem = {
                    is_publish: true,
                    author: DB.users[range(0, DB.users.length - 1)].username!,
                    content: `${idx} - content`,
                    title: `Loream Ipsum-${idx} dolo sit amet`
                };
                return result;
            }
        )
    }
}

api.news.add(payload);
api.news.del(payload);
api.news.edit(payload);
api.news.get(pagerPayload)
```