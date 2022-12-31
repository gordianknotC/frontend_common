import {
  setupComputed,
  setupCurrentEnv,
  setupReactive,
  setupRef,
  setupWatch,
} from "@/index";
import {
  is,
  asEnum,
  isRefImpl,
  getOmitsBy,
  flattenInstance,
  getAccessibleProperties,
} from "../src/index";
import { ref, reactive, watch, computed } from "vue";
import {
  _computed as RComputed,
  _reactive as RReactive,
  _ref as RRef,
} from "../src/extension/extension_setup";


describe("type inference tests", () => {
  beforeAll(() => {
    setupRef(ref);
    setupReactive(reactive);
    setupWatch(watch);
    setupComputed(computed);
    setupCurrentEnv("develop");
  });


  describe("ref setup", ()=>{
    test("computed", ()=>{
      expect(RComputed(()=>13).value).toBe(13);
    });
    test("ref", ()=>{
      expect(RRef(13).value).toBe(13);
    });
    test("reactive", ()=>{
      expect(RReactive({value: 13}).value).toBe(13);
    });
  });

  describe("is", () => {
    describe("is.array", () => {
      test("[]", function () {
        expect(is.array([])).toBeTruthy();
      });
      test("new Array()", function () {
        expect(is.array(new Array())).toBeTruthy();
      });
      test("is refimpl", function () {});
    });

    describe("is.undefined", () => {
      test("'undefined' do not count undefined string", function () {
        expect(is.undefined("undefined")).toBeFalsy();
      });
      test("'undefined' count undefined string", function () {
        expect(is.undefined("undefined", true)).toBeTruthy();
      });
      test("undefined", function () {
        expect(is.undefined(undefined)).toBeTruthy();
      });
      test("null", function () {
        expect(is.undefined(null)).toBeTruthy();
      });
    });

    describe("is.null", () => {
      test("'null' do not count null string", function () {
        expect(is.null("null")).toBeFalsy();
      });
      test("'null' count null string", function () {
        expect(is.null("null", true)).toBeTruthy();
      });
      test("undefined", function () {
        expect(is.null(undefined)).toBeTruthy();
      });
      test("null", function () {
        expect(is.null(null)).toBeTruthy();
      });
    });

    describe("is.empty", () => {
      test("{}", function () {
        expect(is.empty({})).toBeTruthy();
      });
      test("{a: 1}", function () {
        expect(is.empty({ a: 1 })).toBeFalsy();
      });
      test("[]", function () {
        expect(is.empty([])).toBeTruthy();
      });
      test("[1]", function () {
        expect(is.empty([1])).toBeFalsy();
      });
      test("null", function () {
        expect(is.empty(null)).toBeTruthy();
      });
      test("undefined", function () {
        expect(is.empty(undefined)).toBeTruthy();
      });
      test("NaN", function () {
        expect(is.empty(NaN)).toBeTruthy();
      });
      test("''", function () {
        expect(is.empty("")).toBeTruthy();
      });
      test("0", function () {
        expect(is.empty("0")).toBeFalsy();
      });
      test("false", function () {
        expect(is.empty(false)).toBeFalsy();
      });
    });
  });

  describe("isRefImpl", () => {
    test("pretest ", () => {
      const a = ref({ temp: 1, get: 2 });
      const b = reactive({});
      expect(a.constructor.name).toBe("RefImpl");
      expect(typeof a).toBe("object");
      expect(Object.getOwnPropertyNames(a).length).toBe(5);
      expect(Object.getOwnPropertyNames(Object.getPrototypeOf(a)).length).toBe(
        2
      );

      //
      expect(Object.keys(Object.getPrototypeOf(a))).toEqual([]);
      expect(Object.getOwnPropertyNames(Object.getPrototypeOf(a))).toEqual([
        "constructor",
        "value",
      ]);
      expect(Object.getOwnPropertySymbols(a)).toEqual([]);
      expect(Object.getOwnPropertyNames(a)).toEqual([
        "__v_isShallow",
        "dep",
        "__v_isRef",
        "_rawValue",
        "_value",
      ]);
    });

    test("expect true ", () => {
      const a = ref({ temp: 1, get: 2 });
      expect(isRefImpl(a)).toBeTruthy();
    });
  });

  describe("asEnum", () => {
    const EB = asEnum({
      a: 1,
      b: 2,
    });
    test('expect object keys of ["a", "b"] ', () => {
      expect(Object.keys(EB)).toEqual(["a", "b"]);
    });
    test("expect object values of [1, 2]", () => {
      expect(Object.values(EB)).toEqual([1, 2]);
    });
  });

  describe("getOmitsBy", () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    };
    test("strip props a, b from obj ", () => {
      expect(getOmitsBy(obj, ["a", "b"])).toEqual({ c: 3 });
    });
    test("strip props a, b, c from obj", () => {
      expect(getOmitsBy(obj, ["a", "b", "c"])).toEqual({});
    });
  });

  describe("flattenInstance", () => {
    class BaseCls {
      baseProp: string = "baseProp";
      constructor() {}
      get basename(): string {
        return "BaseCls";
      }
      baseMethod(): string {
        return "BaseMethod";
      }
    }

    class SubClass extends BaseCls {
      subProp: string = "subProp";
      constructor() {
        super();
      }
      get subname(): string {
        return "SubName";
      }
      subMethod(): string {
        return "SubMethod";
      }
    }

    let subFlatten!: SubClass;
    let subOrig!: SubClass;

    beforeAll(() => {
      subOrig = new SubClass();
      subFlatten = new SubClass();
      flattenInstance(subFlatten, true);
    });

    test("expect accessing subname returned as a descriptor", () => {
      expect(
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(subOrig),
          "subname"
        )
      ).toBeInstanceOf(Object);
      expect(
        Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(subOrig),
          "subname"
        )?.set
      ).toBe(undefined);
    });

    test("expect flattenInstance throws, since subname is readonly", () => {
      expect(() => flattenInstance(subOrig)).toThrow(
        "Cannot set property subname"
      );
      expect(() => {
        //@ts-ignore
        subOrig.subname = 123;
      }).toThrow("Cannot set property subname");
      expect(subOrig.subname).not.toBe(123);
    });

    test("assert accessible properties of non-flattened SubClass", () => {
      expect(getAccessibleProperties(subOrig)).toEqual(
        new Set(["subMethod", "baseMethod", "subname", "basename"])
      );
      //@ts-ignore
      expect(Object.keys(subOrig)).toEqual(["baseProp", "subProp"]);
    });

    test("assert accessible properties of flattened SubClass", () => {
      expect(getAccessibleProperties(subFlatten)).toEqual(
        new Set(["subMethod", "baseMethod", "subname", "basename"])
      );
      //@ts-ignore
      expect(Object.keys(subFlatten)).toEqual([
        "baseProp",
        "subProp",
        "subMethod",
        "baseMethod",
      ]);
    });

    test("override subname, expect value changed", () => {
      //@ts-ignore
      subFlatten.subname = "hello";
      expect(subFlatten.subname).toBe("hello");
    });
  });
});
