export declare enum ELevel {
    info = 0,
    log = 1,
    warn = 2,
    current = 3,
    error = 4
}
export declare class Logger {
    moduleName: string;
    static allowedModules: Set<string>;
    static addModule(name: string): void;
    static setModules(modules: string[]): void;
    constructor(moduleName: string);
    log(msg: any[], traceAt?: number, stackNumber?: number): void;
}
