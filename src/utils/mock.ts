
export type TPager = {
    page: number;
    pages?: number;
    per_page: number;
    total?: number;
};

export type TPagerPayload = {
    page?: number;
    per_page?: number;
};

export type TOptional<T> = T | undefined | null;

export type TErrorResponse = {
    error_code: any;
    error_key: string;
    error_msg: string;
    message: string;
};

export type TSuccessResponse = {
    succeed: boolean;
};

export type TDataResponse<T> = {
    data: T;
    pager?: TPager | null | undefined;
};




// fixme: 寫成 OOP
export
const CRUD = <T extends {id: string|number}>(
  dataList: TOptional<TDataResponse<any[]>>,
  updater:(data: any[])=>void,
  itemGen: (idx: number)=>T)=>{
    return {
        add(payload: T): Promise<TSuccessResponse>{
            let id = dataList!.data.length;
            payload.id = id.toString();
            dataList!.data.push(payload);
            updater(dataList!.data);
            return new Promise((resolve, reject)=> resolve({succeed: false}));
        },
        del(payload: T): Promise<TSuccessResponse>{
            let id = 0;
            for (let i = 0; i < dataList!.data!.length; i++) {
                const x = dataList!.data![i];
                if (x.id == payload!.id){
                    id = i;
                    dataList!.data! = dataList!.data!.filter((_)=> _.id !== payload!.id);
                    return new Promise((resolve, reject)=> resolve({succeed: true}));
                }
            }
            return new Promise((resolve, reject)=> resolve({succeed: false}));
        },
        edit(payload: T): Promise<TSuccessResponse>{
            for (let i = 0; i < dataList!.data!.length; i++) {
                const x = dataList!.data![i];
                if (x.id == payload!.id){
                    dataList!.data![i] = Object.assign(dataList!.data![i], payload);
                    return new Promise((resolve, reject)=> resolve({succeed: true}));
                }
            }
            return new Promise((resolve, reject)=> resolve({succeed: false}));
        },
        get(payload?: TPagerPayload): Promise<TDataResponse<any[]>>{
            let idx = 0;
            const page = payload?.page ?? 1;
            const per_page =  payload?.per_page ?? 10;
            const total = 20;
            const pages = Math.floor(total/per_page + 0.5);
            console.log(page, pages, per_page, total);

            const fromPg = (page -1) * per_page;
            const toPg = Math.min(Math.min(page, pages) * per_page, total);
            dataList ??= {
                data: (new Array(total).fill((_: any)=>0).map((_)=>{
                    idx ++;
                    return itemGen(idx);
                })),
                pager: {page, per_page, total: 15},
            }
            const result = {
                data:dataList.data.slice(fromPg, toPg),
                pager: {page, per_page, total: 15}
            }
            console.log("slice:", fromPg, toPg);
            return new Promise((resolve, reject)=>resolve(result));
        },
    }
}
