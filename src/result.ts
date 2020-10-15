export class Result<T, E> {
  private ok?: T;
  private error?: E;

  static Capture<T>(closure: () => T): Result<T, Error> {
    try {
      return Result.Ok<T, Error>(closure());
    } catch (e) {
      return Result.Err<T, Error>(e);
    }
  }

  static Ok<T, E>(value: T): Result<T, E> {
    let result = new Result<T, E>();
    result.ok = value;
    return result;
  }

  static Err<T, E>(err: E): Result<T, E> {
    let result = new Result<T, E>();
    result.error = err;
    return result;
  }

  public isOk(): boolean {
    return this.ok != null;
  }

  public isErr(): boolean {
    return this.error != null;
  }

  public unwrap(): T {
    if (!this.isOk()) {
      throw new Error("Called 'unwrap' on a Result with an error.");
    }

    return this.ok;
  }

  public unwrapErr(): E {
    if (!this.isErr()) {
      throw new Error("Called 'unwrapErr' on a Result with a value.");
    }

    return this.error;
  }
}
