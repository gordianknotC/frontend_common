import {ComputedRef, UnwrapRef} from "~/appCommon/base/vueTypes";
import {Optional} from "~/appCommon/base/baseApiTypes";

export enum ECompStage{
  loading,
  ready,
}

export enum EIOStage{
  initial,
  update,
  upgrade
}

export type TableState<T, E = any> = {
  error: Optional<string>,
  stage: ECompStage,
  table: Partial<T>[],
  filteredTable: Partial<T>[],
  toggledRows?: Partial<T>[],
  subtotal?: string,
  total?: string,
  extra?: E
}

export type TableStateForceExtra<T, E> = {
  error: Optional<string>,
  stage: ECompStage,
  table: Partial<T>[],
  toggledRows: Partial<T>[],
  filteredTable: Partial<T>[],
  extra: E
  subtotal?: string,
  total?: string,
}

export type TableColConfig<T> = {
  dataKey: keyof T,
  headerLabel?: ComputedRef<string>
  headerClass?: string[],
  colClass?: (item: TableCol<T>)=>string[],
  getData?: (item: TableCol<T>)=>any,
  action?: (item: TableCol<T>)=> void;
};

export type TableCol<T> = {
  rawData: T
  rowId: number,
} & TableColConfig<T>

export abstract class IBaseTableModels<T, E, S={}>  {
  abstract state: UnwrapRef<TableState<T, E>>;
  abstract initialRowState: S;
  abstract rowStates: UnwrapRef<Record<number, S>>;
  abstract hasData: ComputedRef<boolean>;
  abstract labels: {
    tableHeader: ComputedRef<string>[],
    headerCls: string[][],
  };
  abstract rows: ComputedRef<TableCol<T>[][]>;
  abstract config: TableColConfig<T>[];
  abstract initialDate: Date[];
  abstract isRowToggled(row: TableCol<T>[]): ComputedRef<boolean>;
  abstract addToggledRow(item: TableCol<T>): void;
  abstract removeToggleRow(item: TableCol<T>): void;
}

export abstract class IBaseTableCtrl<T> {
  abstract apiGet:(...args: any)=>any
  abstract getPayload(...args: any): any;
  abstract updatePageNum(page: number): Promise<boolean>;
  abstract setTable(data: any): void;
  abstract beforeUpdate(response: any): void;
  abstract updateTable(payload: any, cache?: any): Promise<any>;
  abstract setFilterTable(condition: (k: any, v: any) => boolean) :void;
  abstract setTableError(errorResponse: any): void;
  abstract onMounted(): Promise<any>;
}





