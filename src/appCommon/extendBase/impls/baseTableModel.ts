import {IBaseTableModels, TableColConfig, TableCol, TableState} from "~/appCommon/base/baseTableTypes";
import {computed, ComputedRef, reactive, UnwrapRef} from "~/appCommon/base/vueTypes";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";


export class BaseTableModel<T, E=any, S={}> implements IBaseTableModels<T, E, S>{
  state   : UnwrapRef<TableState<T, E>>
  initialRowState: S;
  rowStates: UnwrapRef<Record<number, S>>
  labels  : {
    tableHeader: ComputedRef<string>[],
    headerCls: string[][],
  };
  rows          : ComputedRef<TableCol<T>[][]>;
  hasData       : ComputedRef<boolean>;
  config        : TableColConfig<T>[];
  initialDate   : Date[];

  constructor(option: {
    state: TableState<T, E>,
    initialRowState?: S,
    config: TableColConfig<T>[],
    cascade?: boolean,
  }) {
    option.cascade ??= false;
    option.config.forEach((element) => {
      element.headerClass ??= [];
      element.colClass ??= (item)=>[];
      element.getData ??= (item)=>"";
      element.headerLabel ??= computed(()=> "");
    });
    option.initialRowState ??= {} as S;

    this.initialRowState = option.initialRowState;
    this.config     = option.config;
    this.state      = reactive(option.state);
    this.rowStates  = reactive({});
    this.labels     = {
      tableHeader: option.config.map((_) => _.headerLabel!),
      headerCls: option.config.map((_)=>{
        return _.headerClass ?? [];
      }),
    }

    this.rows = computed(()=>{
      const watchedProperty = this.state.toggledRows;
      const length = this.state.filteredTable.length;
      const filteredTable: any[] = [];
      for (let i = 0; i < length; i++) {
        const filteredTableElement = this.state.filteredTable[i];
        this.rowStates[i] ??= reactive(Object.assign({}, this.initialRowState)) as any;

        filteredTable.add(filteredTableElement);
        if (watchedProperty?.contains(filteredTableElement) ?? false){
          // note: 當 toggled on 插入一空的 row
          // 用作插入 nested table row
          filteredTable.add([]);
        }
      }

      let rowId = -1;
      return filteredTable.map((element) => {
        // fixme: 用 empty 判斷不安全
        // row Id 用來判斷實際 data 數, 空值不計入 rowId
        // 主要用作插入 nested table row
        if (is.not.empty(element)){
          rowId ++;
        }
        return option.config.map((_)=>{
          return {
            rawData: element,
            rowId,
            ..._,
          } as TableCol<T>;
        })
      })
    });

    this.hasData = computed(()=> is.not.empty(this.state.filteredTable));
    this.initialDate = [];
  }

  addToggledRow(item: TableCol<T>){
    const arr = Array.from(this.state.toggledRows!);
    this.state.toggledRows = [...arr, item.rawData as any];
  }

  removeToggleRow(item: TableCol<T>){
    const arr = Array.from(this.state.toggledRows!);
    arr.remove(item.rawData as any);
    this.state.toggledRows = [...arr];
  }

  isRowToggled(row: TableCol<T>[]): ComputedRef<boolean> {
    throw new NotImplementedError();
  }

  isNestedTableRow(row: TableCol<T>[]): boolean{
    return is.empty(row.first.rawData);
  }
}
