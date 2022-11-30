
<!--#-->
## is - 型別推斷工具
```ts
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
```


## flattenInstance - 平面化 class，用於 vue 寫 OOP
```ts
/**
 *  flattenInstance 平面化 class，用於 vue 寫 OOP
 *  vue 若傳入有繼承關係的類別（class)，其繼承關係會消失
 *  因為 vue 不會讀取 prototype 層的內容
 *
 *  如 A extends Base, 而 
 *  - Base 有 methodBase, propBase, propX
 *  - A 有 propA, methodA, propX
 *  當我們將 instance A 傳給 vue 物件化後
 *  vue 會無視 methodBase, propBase, 因為 methodBase/propBase 
 *  在 A 的 prototype 層
 *
 *  flattenInstance 作用為將可存取的所有 methods / property
 *  寫入當前的 class, 使得 A 繼承至 Base 的 methodBase, propBase 平面化至 A
 *
 *  @param rule 平面化規則，預設為 
 *              constructor 不考慮
 *              method name 開頭為 "_" 不考慮
 * */
function flattenInstance(
    obj: any, 
    overrideReadonly: boolean = false, 
    rule?: (name: string) => boolean, 
    onError?: (err: string)=>void
) 
```
```ts
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
```