export interface IMessagePublisher<TMessage> {
  publish(message: TMessage): Promise<void>;
}
