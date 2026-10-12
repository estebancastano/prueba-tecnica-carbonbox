export interface IMessageConsumer<TMessage> {
  subscribe(handler: (message: TMessage) => Promise<void>): void;
  start(): void;
  stop(): void;
}
