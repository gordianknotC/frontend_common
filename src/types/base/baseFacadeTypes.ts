import {FACADE_KEY, TFacade} from "~/types/extendBase/facadeTypes";
import {useBuiltIn} from "~/types/base/builtinAddonsTypes";

const container = {};

export function Facade<T extends Object>(mapping?: T): T {
  return new Proxy<T>({} as T, {
    get: function (target, name) {
      // @ts-ignore
      const facade = container[FACADE_KEY];
      assert(facade[name as keyof TFacade] !== undefined, `key name "${name.toString()}" not found in facade`)
      return facade[name as keyof TFacade];
    }
  });
}

function assert(condition: any, message?: string): asserts condition{
  if (!condition){
    throw new Error(`AssertionError: ${message ?? ""}`);
  }
}

export function setupFacade(providers: Partial<TFacade>){
  useBuiltIn();
  //@ts-ignore
  container[FACADE_KEY] ??= {};
  Object.keys(providers).forEach((prop) => {
    //@ts-ignore
    container[FACADE_KEY][prop] = providers[prop];
  });
}
