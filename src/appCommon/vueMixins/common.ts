import {WritableComputedRef}    from "@vue/reactivity";
import {computed} from "~/appCommon/base/vueTypes";
type TEmitFn<E> = (event: E, ...args: any[])=>void;

export class CommonMixin {
  vModelEvents: Set<string>;
  constructor() {
    this.vModelEvents=new Set();
  }

  asVModelFromProps<R, T extends object=any>(props: Readonly<T>, propName: keyof T, emit: TEmitFn<any>): WritableComputedRef<R>{
    const event = `update:${propName}`;
    this.vModelEvents.add(event as any);
    return computed ({
      get(){
        return props[propName];
      },
      set(v: any){
        emit(event, v);
      }
    })
  }
}


