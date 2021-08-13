import {NavigationGuardNext, RouteLocationNormalized} from "vue-router";
import {IBaseRouterGuard, IRouterInterceptor} from "~/appCommon/base/guardianTypes";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {RouteLocationObject, Router, RouteRecord} from "~/appCommon/base/vueTypes";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";
import {Facade, IFacade} from "~/appCommon/base/baseFacadeTypes";


//
export class BaseRouterInterceptor implements  IRouterInterceptor{
  static perRouteGuardian: {[K: string]: IBaseRouterGuard[]} = {};
  static generalGuardian: IBaseRouterGuard[] = [];

  /** 應用於所有  beforeRoute*/
  static addGeneralGuard(guards: IBaseRouterGuard[]){
    let prevGuard: IBaseRouterGuard;
    this.generalGuardian.addAll(guards);
    this.generalGuardian.forEach((guard) => {
      if (is.initialized(prevGuard)){
        prevGuard.nextGuard = guard;
      }
      prevGuard = guard;
    });
  }

  /** 應用於特定 routeName 下， beforeRoute*/
  static addPerRouteGuard(routeName: string,guards: IBaseRouterGuard[]){
    let prevGuard: IBaseRouterGuard;
    this.perRouteGuardian[routeName] ??= [];
    this.perRouteGuardian[routeName].addAll(guards);
    this.perRouteGuardian[routeName].forEach((guard) => {
      if (is.initialized(prevGuard)){
        prevGuard.nextGuard = guard;
      }
      prevGuard = guard;
    });
  }

  /** 暫存上一個 route 防 circular loop */
  pendingRoute: Optional<RouteLocationObject>;

  constructor(
    private installed: boolean = false,
  ){
  }

  get lastRoute(): Optional<RouteRecord> {
    const facade = Facade.asProxy<IFacade>();
    const currentRoute = facade.router.currentRoute.value;
    const allRoutes = facade.router.getRoutes();
    const index     = allRoutes.lastIndexOf(currentRoute as any);
    if (index > 0) {
      return allRoutes [index - 1];
    }
    return undefined;
  }

  protected push(location: RouteLocationObject, to: RouteLocationNormalized, next: NavigationGuardNext){
    if (this.pendingRoute?.name == to.name && location!.name == to.name){
      next();
      console.log("next:", to);
    }else{
      const facade = Facade.asProxy<IFacade>();
      console.log("push to:", location);
      facade.router.push(location!);
    }
  }

  protected beforeEachGuard(
    to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext
  ){
    const hasGeneralGuard = is.not.empty(BaseRouterInterceptor.generalGuardian);
    if (hasGeneralGuard){
      const location = BaseRouterInterceptor.generalGuardian.first.guard(to);
      console.log(
        "RouterInterceptor.generalGuardian.first:",
        BaseRouterInterceptor.generalGuardian.first,
        "location:",
        location
      );
      if (is.initialized(location)){
        console.log("push 1");
        this.push(location!, to, next);
      }else{
        const routeName = to.name;
        const perRouteGuard = BaseRouterInterceptor.perRouteGuardian[routeName as string];
        const hasRouteGuard = is.initialized(perRouteGuard);
        if (hasRouteGuard){
          const location = perRouteGuard.first.guard(to);
          const canRedirect = is.initialized(location);
          console.log("canRedirect:", canRedirect, "hasRouteGuard:", hasRouteGuard);
          if (canRedirect){
            this.push(location!, to, next);
          }else{
            next();
          }
        }else{
          console.log("canRedirect:", is.initialized(location), "hasRouteGuard:", hasRouteGuard);
          next();
        }
      }
    }else{
      next();
    }
    // console.log('pending:', this.pendingRoute, 'to:', to);
    this.pendingRoute = to as RouteLocationObject;
  }

  install(router: Router): void {
    if (this.installed)
      return;

    const facade = Facade.asProxy<IFacade>();
    router.beforeEach((to, from, next)=>{
      console.group("ROUTE".cyan);
      console.log("from:", from);
      console.log("to:", to);

      facade.paramStore.updateFromRoute({
        route: to,
        considerInterceptor: true,
      });

      this.beforeEachGuard(to, from, next);
      console.groupEnd();
    });

    router.afterEach((to, from, failure)=>{
    })
  }
}
