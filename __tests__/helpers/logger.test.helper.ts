import { Env } from "@/extension/extension_setup";
import { AllowedModule, ELevel, Logger } from "@/index";

export class LoggerHelper {
  constructor(public L: Logger<any>) {}

  expectBlocked(module: AllowedModule<any>, env: Env) {
    const log = this.L;
    expect((Logger as any).getEnv()).toBe(env);
    expect(Logger.hasModule(module)).toBeTruthy();
    expect(log._allowance).toEqual(module);
    expect(Logger.isAllowed(log._allowance, ELevel.trace)).toBeFalsy();
  }

  expectLogPass(message: string, moduleName: string){
    const log = this.L;
    log.current([message]);
    expect(log._prevLog).not.toBeUndefined();
    expect(log._prevLog.message).toContain(message);
    expect(log._prevLog.moduleName).toBe(moduleName);
  }
  expectLogIgnored(message: string, moduleName?: string){
    const log = this.L;
    log.current([message]);
    expect(log._prevLog).toBeUndefined();
    if (log._prevLog)
        expect(log._prevLog.message).not.toContain(message);
  }
}
