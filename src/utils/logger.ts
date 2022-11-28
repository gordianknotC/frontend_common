
function message (msg: any[], traceBack: number = 2, stackNumber: number = 5){
  const lines = new Error().stack!.split("\n");
  const maxLines = lines.length;
  const stacks = lines.splice(
    Math.min(traceBack + 1, maxLines),
    stackNumber
  );
  console.log("lines:", maxLines, traceBack + 1, traceBack + 1 + stackNumber, Math.min(traceBack + 1, maxLines), Math.min( traceBack + 1 + stackNumber, maxLines), stacks.length);
  console.log(...msg, "\n" + stacks.join('\n'));
}

export enum ELevel{
  info,
  log,
  warn,
  current,
  error,
}

// fixme:
// untested:
export
class Logger {
  static allowedModules: Set<string> = new Set();
  static addModule(name: string){
    Logger.allowedModules.add(name);
  }
  static setModules(modules: string[]){
    Logger.allowedModules.clear();
    modules.forEach((name)=>{
      Logger.allowedModules.add(name);
    });
  }
  constructor(public moduleName: string) {
    Logger.addModule(moduleName);
  }
  log(msg: any[], traceBack: number = 2, stackNumber: number = 5): void{
    if (Logger.allowedModules.has(this.moduleName))
      message(msg, traceBack, stackNumber);
  }
}

