export abstract class ValueObject<T extends Record<string, unknown>> {
  protected constructor(readonly props: T) {}

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
