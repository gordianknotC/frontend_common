
export
class UncaughtEnumType extends Error{
  constructor(val: any, _enum:any) {
    super(`UncaughtEnumType ${val}, expect one of ${Object.keys(_enum)}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class UnCaughtCondition extends Error{
  constructor(msg?: string) {
    super(`UnCaughtCondition ${msg ? ":"+String(msg) : ""}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}


export
class TypeMismatchError extends Error{
  constructor(provided: any , expected: string){
    super(`type error: expected: ${expected}, provided: ${provided}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class NotImplementedError extends Error{
  constructor(msg?: string) {
    super(`NotImplementedError ${msg ? ":"+String(msg) : ""}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class InvalidUsage extends Error{
  constructor(msg: string) {
    super(`InvalidUsage: ${msg}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}
 
