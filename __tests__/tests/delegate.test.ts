import {
  setupComputed,
  setupCurrentEnv,
  setupReactive,
  setupRef,
  setupWatch,
  _computed,
  _reactive,
  _ref,
  _watch,
} from "../../src/extension/extension_setup";
import {
  is,
  asEnum,
  isRefImpl,
  getOmitsBy,
  flattenInstance,
  getAccessibleProperties,
  Arr,
  ArrayDelegate,
  Obj,
} from "../../src/index";
import { ref, reactive, watch, computed } from "vue";
import { CallableDelegate } from "../../src/utils/lazy";


describe("Array/Object delegate tests", () => {
  test("accessing ArrayDelegate", () => {
    const arr: ArrayDelegate<number> = Arr([1,2,3,4]);
    expect(arr[0]).toBe(1);
    expect(arr.first).toBe(1);
    expect(arr.last).toBe(4);
    expect(arr.firstWhere((_)=>_ ==3)).toBe(3);
  });

  test("accessing ObjectDelegate", ()=>{
    const obj = Obj({a:1, b:2});
    expect(Object.keys(obj)).toEqual(["a", "b"]);
    expect(Object.values(obj)).toEqual([1, 2]);
    expect(obj.pick(["a"])).toEqual({a: 1});
  });

  test("callable delegate", ()=>{
    const d = new CallableDelegate<()=>any>(()=>undefined);
    expect(d()).toBeUndefined();

    d.delegate = ()=>"delegated";
    expect(d()).toBe("delegated");
  })
});

describe("Setup Reactive Delegate", ()=>{
  beforeAll(() => {
    setupRef(ref);
    setupReactive(reactive);
    setupWatch(watch);
    setupComputed(computed);
    setupCurrentEnv("develop");
  });
  test("computed", ()=>{
    expect(_computed(()=>"value").value).toBe("value");
  });
  test("reactive", ()=>{
    expect(_reactive({value: "value"}).value).toBe("value");
  });
  test("ref", ()=>{
    expect(_ref("value").value).toBe("value");
  });
});
