

---
<!--#-->
## Inject Reactive Method
設計上希望能夠不相依於任何一個 ui framework，因此需由外部注入相應的 reactive 方法，再於內部使用這個需要被使用者注入的 reactive 方法作為界面，以達到與 ui framework 相依分離，否於未注入前就使用，則會出現 **InvalidUsageError:** 錯誤。

### Vue 為例
1) 注入 vue computed method
2) 注入 vue reactive method
3) 注入 vue watch method
4) 注入 vue ref method
  
**Example:**
```typescript 
import {
  setupComputed,
  setupCurrentEnv,
  setupReactive,
  setupRef,
  setupWatch,
} from "../src/extension/extension_setup";

import {
  computed as RComputed,
  reactive as RReactive,
  ref as RRef,
} from "../src/extension/extension_setup";

import { ref, reactive, watch, computed } from "vue";

describe("ref setup", ()=>{
  beforeAll(() => {
    setupRef(ref);
    setupReactive(reactive);
    setupWatch(watch);
    setupComputed(computed);
    setupCurrentEnv("develop");
  });

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
```


### React 為例
> todo...