export interface ICommandBus {
  execute<TResult>(command: unknown): Promise<TResult>;
}
