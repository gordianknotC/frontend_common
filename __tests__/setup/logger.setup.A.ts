import { Env } from "@/extension/extension_setup";
import { AllowedModule, Logger, LazyHolder, ELevel } from "@/index";
enum EModules {
  Client = "Client",
  AuthGuard = "AuthGuard",
  AuthClient = "AuthClient",
  RequestReplacer = "RequestReplacer",
  HeaderUpdater = "HeaderUpdater",
  Plugin = "Plugin",
  Test = "Test",
}

const ClientModule: AllowedModule<EModules> = {
  moduleName: EModules.Client,
  disallowedHandler: (level) => false,
};

const allModules = [
  ClientModule,
  { ...ClientModule, moduleName: EModules.Test },
  { ...ClientModule, moduleName: EModules.AuthGuard },
  { ...ClientModule, moduleName: EModules.AuthClient },
  { ...ClientModule, moduleName: EModules.Plugin },
  { ...ClientModule, moduleName: EModules.RequestReplacer },
  { ...ClientModule, moduleName: EModules.HeaderUpdater },
];


function logger(module: AllowedModule<EModules>): Logger<EModules> {
  return LazyHolder(() => new Logger(module));
}

export function loggerSetupA(env: Env) {
  Logger.setLevelColors({
    [ELevel.trace]: (msg) => msg.grey,
    [ELevel.debug]: function (msg: string): string {
      return msg.white;
    },
    [ELevel.info]: function (msg: string): string {
      return msg.blue;
    },
    [ELevel.warn]: function (msg: string): string {
      return msg.yellow;
    },
    [ELevel.current]: function (msg: string): string {
      return msg.cyanBG;
    },
    [ELevel.error]: function (msg: string): string {
      return msg.red;
    },
    [ELevel.fatal]: function (msg: string): string {
      return msg.bgBrightRed;
    },
  });

  const LogModules = Logger.setLoggerAllowanceByEnv({
    test: allModules,
    develop: allModules,
  });

  Logger.setCurrentEnv(() => {
    return env;
  });

  return {
    LogModules,
    allModules,
  };
}
