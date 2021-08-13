import {ComputedRef, UnwrapRef} from "vue";
import {RouteLocationNormalized, Router} from "vue-router";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {asCascadeClass, is} from "~/appCommon/extendBase/impls/utils/typeInferernce";


export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
}


export type TSearchStoreState = {
  search: string;
}

export type TSearchPayload = {
  keyword?: string
}

export enum ESearchStage {
  api,
  ui,
}

//todo:
//
// export class SearchReact<S extends TSearchStoreState, P extends TSearchPayload> implements ISearchReact<S, P> {
//   private cache           : {[Key: string]: any};
//   private inputDebouncer  : DebouncedFunc< (val: string)=>Promise<any> >;
//   private searchDebouncer : DebouncedFunc< (location: RouteLocationNormalized)=>Promise<Optional<Router>> >;
//   //
//   state          : UnwrapRef<S>
//   payloadGetter  : TPayloadGetter<P>;
//   onUpdate       : TOnUpdate<P>;
//   onBeforeRoute  : (payload: P) => RouteLocationNormalized;
//   onPushRoute    : (location: RouteLocationNormalized)=>Promise<Optional<Router>>;
//   outputField    : ComputedRef<string>;
//   validationRule : ComputedRef<string>;
//   //
//   constructor(option: TSearchReactOptions<S, P>) {
//     const self         = this;
//     this.cache         = {};
//     this.state         = reactive(option.initialState) as any;
//     this.onUpdate      = option.onUpdate;
//     this.onBeforeRoute = option.onBeforeRoute;
//     this.outputField   = option.outputField;
//     this.payloadGetter = option.payloadGetter;
//     this.validationRule= computed(function(){
//       return `bail|${EBaseValidationRules.userLength}|${EBaseValidationRules.userPattern}`;
//     });
//
//     this.onPushRoute = option.onPushRoute ?? function(location){
//       const prevLocation = facade.router.currentRoute.value;
//       const query = _.extend({}, _.clone(prevLocation.query));
//       const params = _.extend({}, _.clone(prevLocation.params));
//       location.query = _.extend(query, location.query ?? {});
//       location.params = _.extend(params, location.params ?? {});
//       return facade.router.push(location) as any;
//     }
//
//     this.searchDebouncer = _.debounce(function(location: RouteLocationNormalized){
//       if (is.empty(location))
//         return;
//
//       if (is.empty(location.query?.keyword)){
//         delete location.query!.keyword;
//         location.query!.keyword="";
//       }
//       return self.onPushRoute(location);
//     }, APP_CONFIGS.DEBOUNCE.INPUT);
//
//     this.inputDebouncer = _.debounce(async (val: string)=>{
//       return await this.internalOnInput(val, ESearchStage.api);
//     }, APP_CONFIGS.DEBOUNCE.INPUT);
//
//     asCascadeClass(this);
//   }
//
//   private async updateTarget(payload: any){
//     const cacheKey = JSON.stringify(payload);
//     if (is.initialized(this.cache[cacheKey])){
//       //console.log('update on cache', cacheKey, this.cache);
//       return await this.onUpdate(payload, this.cache[cacheKey]);
//     }
//     return this.cache[cacheKey] = await this.onUpdate(payload, this.cache[cacheKey]);
//   }
//
//   private async internalOnInput(value: string, stage: ESearchStage){
//     const routeName = facade.router.currentRoute.value.name!;
//     const self = this;
//     const textLength = value.toAsciiArray().length;
//     console.log(routeName, ": search kw ", value, textLength);
//
//     let payload: any;
//     payload = this.payloadGetter();
//     payload.keyword = value;
//     this.state.search = value;
//     delete payload.page;
//
//     if (textLength >= 3) {
//       console.log("update on payload", textLength, payload, value);
//       if (stage === ESearchStage.api){
//         const location = self.onBeforeRoute(payload);
//         console.log("update on payload", payload, "value:", value, "stage", stage, "location:", location, "self:", self);
//
//         const debouncePromise = self.searchDebouncer(location);
//         if (is.initialized(debouncePromise)){
//           debouncePromise!.then(async (_: Optional<Router>)=>{
//             return self.updateTarget(payload);
//           });
//         }else{
//           return self.updateTarget(payload);
//         }
//       }
//     } else {
//       facade.paramStore.state.keyword = undefined;
//       if (is.initialized((payload as any)?.keyword)) {
//         delete (payload as any).keyword;
//       }
//       if (stage === ESearchStage.api){
//         return self.updateTarget(payload);
//       }
//     }
//   }
//
//   async onInput(value: string) {
//     this.internalOnInput(value, ESearchStage.ui);
//     return this.inputDebouncer(value);
//   }
// }
