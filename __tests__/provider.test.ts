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
  provideDependency,
  provideFacade,
  injectDependency,
  injectFacade,
} from "../src/index";
import { ref, reactive, watch, computed } from "vue";
import {
  _computed as RComputed,
  _reactive as RReactive,
  _ref as RRef,
} from "../src/extension/extension_setup";


describe("Provider", () => {
  beforeAll(() => {
    setupRef(ref);
    setupReactive(reactive);
    setupWatch(watch);
    setupComputed(computed);
    setupCurrentEnv("develop");
  });
  describe("Dependency Provider/Injector", ()=>{
    test("Simple test without enabling merge", ()=>{
      provideDependency({
        deps: {
          Elton: "Elton",
          John: "John",
          users: {
            EltonJohn: "EltonJohn"
          }
        }
      });
      const Elton = injectDependency("Elton");
      const John = injectDependency("John");
      const EltonJohn = injectDependency("users.EltonJohn");
      expect(Elton).toBe("Elton");
      expect(John).toBe("John");
      expect(EltonJohn).toBe("EltonJohn");
    });

    test("with enabling merge", ()=>{
      provideDependency({
        deps: {
          Elton: "Elton",
          John: "John",
          users: {
            EltonJohn: "EltonJohn"
          }
        }
      });

      provideDependency({
        deps: {
          Curtis: "Curtis"
        },
        merge: true
      });
      const Elton = injectDependency("Elton");
      const John = injectDependency("John");
      const EltonJohn = injectDependency("users.EltonJohn");
      const Curtis = injectDependency("Curtis");
      expect(Elton).toBe("Elton");
      expect(John).toBe("John");
      expect(EltonJohn).toBe("EltonJohn");
      expect(Curtis).toBe("Curtis");
    });
  });
  describe("Facade Provider/Injector", ()=>{
    test("Simple test without enabling merge", ()=>{
      provideFacade({
        deps: {
          Elton: "Elton",
          John: "John",
          users: {
            EltonJohn: "EltonJohn"
          }
        }
      });
      const facade = injectFacade<{
        Elton: "Elton",
        John: "John",
        users: {
          EltonJohn: "EltonJohn"
        }
      }>();

      expect(facade.Elton).toBe("Elton");
      expect(facade.John).toBe("John");
      expect(facade.users.EltonJohn).toBe("EltonJohn");
    });

    test("with enabling merge", ()=>{
      provideFacade({
        deps: {
          Elton: "Elton",
          John: "John",
          users: {
            EltonJohn: "EltonJohn"
          }
        }
      });
      
      provideFacade({
        deps: {
          Curtis: "Curtis"
        },
        merge: true
      });
      
      const facade = injectFacade<{
        Elton: "Elton",
        John: "John",
        Curtis: "Curtis",
        users: {
          EltonJohn: "EltonJohn"
        }
      }>();

      expect(facade.Elton).toBe("Elton");
      expect(facade.John).toBe("John");
      expect(facade.users.EltonJohn).toBe("EltonJohn");
      expect(facade.Curtis).toBe("Curtis");
    });
  });

});
