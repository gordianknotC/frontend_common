import {
  setupComputed,
  setupCurrentEnv,
  setupReactive,
  setupRef,
  setupWatch,
} from "../src/extension/extension_setup";
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
} from "../src/index";
import { ref, reactive, watch, computed } from "vue";
import {
  _computed as RComputed,
  _reactive as RReactive,
  _ref as RRef,
} from "../src/extension/extension_setup";


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
});
