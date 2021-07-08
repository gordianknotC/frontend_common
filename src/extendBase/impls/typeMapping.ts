import {is} from "~/extendBase/impls/utils/typeInferernce";

type TMapping<
  Design extends object,
  Actual extends object
> = Record<keyof Design, keyof Actual>;


