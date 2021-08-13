
export
class UncaughtEnumType extends Error{
  constructor(val: any, _enum:any) {
    super(`UncaughtEnumType ${val}, expect one of ${Object.keys(_enum)}`);
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class UnCaughtCondition extends Error{
  constructor() {
    super("UnCaughtCondition");
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
  constructor() {
    super("NotImplementedError");
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class InvalidUsage extends Error{
  constructor() {
    super("InvalidUsage");
    Object.setPrototypeOf(this, Error.prototype);
  }
}

export
class UnExpectedRole extends Error{
  constructor() {
    super("UnExpectedRole");
    Object.setPrototypeOf(this, Error.prototype);
  }
}


