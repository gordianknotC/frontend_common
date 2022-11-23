import { ExtSetupOption, setupComputed, setupReactive, setupRef } from "../extension_setup";


export function setupVueInstance(opt: ExtSetupOption){
    setupComputed(opt.computed);
    setupRef(opt.ref);
    setupReactive(opt.reactive);
}