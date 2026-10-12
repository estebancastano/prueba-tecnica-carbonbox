export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  readonly isLeft = true;
  readonly isRight = false;

  constructor(readonly value: L) {}
}

export class Right<L, R> {
  readonly isLeft = false;
  readonly isRight = true;

  constructor(readonly value: R) {}
}

export const left = <L, R = never>(value: L): Either<L, R> =>
  new Left<L, R>(value);

export const right = <R, L = never>(value: R): Either<L, R> =>
  new Right<L, R>(value);
