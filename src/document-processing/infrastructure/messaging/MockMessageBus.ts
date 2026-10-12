import type { IMessageConsumer } from "../../../shared/infrastructure/messaging/IMessageConsumer";
import type { IMessagePublisher } from "../../../shared/infrastructure/messaging/IMessagePublisher";
import type { ProcessFileMessage } from "./ProcessFileMessage";

export class MockMessageBus
  implements
    IMessagePublisher<ProcessFileMessage>,
    IMessageConsumer<ProcessFileMessage>
{
  private readonly messages: ProcessFileMessage[] = [];
  private handler?: (message: ProcessFileMessage) => Promise<void>;
  private running = false;
  private draining = false;

  async publish(message: ProcessFileMessage): Promise<void> {
    this.messages.push(message);
    this.scheduleDrain();
  }

  subscribe(handler: (message: ProcessFileMessage) => Promise<void>): void {
    this.handler = handler;
  }

  start(): void {
    this.running = true;
    this.scheduleDrain();
  }

  stop(): void {
    this.running = false;
  }

  private scheduleDrain(): void {
    if (this.running && this.handler && !this.draining) {
      this.draining = true;
      void this.drain();
    }
  }

  private async drain(): Promise<void> {
    try {
      while (this.running && this.handler && this.messages.length > 0) {
        const message = this.messages.shift();
        if (!message) {
          continue;
        }

        try {
          await this.handler(message);
        } catch (error) {
          console.error("File-processing message failed", {
            uploadId: message.uploadId,
            error
          });
        }
      }
    } finally {
      this.draining = false;
      if (this.messages.length > 0) {
        this.scheduleDrain();
      }
    }
  }
}
