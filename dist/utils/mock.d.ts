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
export declare const CRUD: <T extends {
    id: string | number;
}>(dataList: TOptional<TDataResponse<any[]>>, updater: (data: any[]) => void, itemGen: (idx: number) => T) => {
    add(payload: T): Promise<TSuccessResponse>;
    del(payload: T): Promise<TSuccessResponse>;
    edit(payload: T): Promise<TSuccessResponse>;
    get(payload?: TPagerPayload): Promise<TDataResponse<any[]>>;
};
