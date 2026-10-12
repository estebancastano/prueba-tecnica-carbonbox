import type { IMessageConsumer } from "../shared/infrastructure/messaging/IMessageConsumer";
import type { ProcessFileCommandHandler } from "../document-processing/application/commands/handlers/ProcessFileCommandHandler";
import type { ProcessFileMessage } from "../document-processing/infrastructure/messaging/ProcessFileMessage";

export class FileProcessingWorker {
  constructor(
    private readonly consumer: IMessageConsumer<ProcessFileMessage>,
    private readonly handler: ProcessFileCommandHandler
  ) {}

  start(): void {
    this.consumer.subscribe(async (message) => {
      if (message.type !== "PROCESS_FILE") {
        throw new Error(`Unsupported message type '${message.type}'`);
      }
      const result = await this.handler.execute({
        uploadId: message.uploadId
      });
      if (result.isLeft) {
        console.error("File-processing message failed", {
          uploadId: message.uploadId,
          error: result.value
        });
      }
    });
    this.consumer.start();
  }

  stop(): void {
    this.consumer.stop();
  }
}
