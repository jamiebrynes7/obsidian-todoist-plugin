export class Maybe<T> {
  private value: T | undefined;

  static Empty<T>(): Maybe<T> {
    return new Maybe<T>();
  }

  static Some<T>(val: T): Maybe<T> {
    const maybe = new Maybe<T>();
    maybe.value = val;
    return maybe;
  }

  public insert(val: T) {
    this.value = val;
  }

  public hasValue(): boolean {
    return this.value !== undefined;
  }

  public inner(): T {
    if (this.value === undefined) {
      throw new Error("tried to access inner value of empty Maybe");
    }

    return this.value;
  }

  public withInner<U>(func: (val: T) => U): U {
    return func(this.inner());
  }
}
