import { App } from "./App";

async function bootstrap(): Promise<void> {
  const app = new App();
  try {
    await app.start();
    const shutdown = async () => {
      try {
        await app.stop();
        process.exitCode = 0;
      } catch (error) {
        console.error("Application shutdown failed", error);
        process.exitCode = 1;
      }
    };

    process.once("SIGINT", () => void shutdown());
    process.once("SIGTERM", () => void shutdown());
  } catch (error) {
    console.error("Application startup failed", error);
    process.exitCode = 1;
  }
}

void bootstrap();
