import app from "./app";
import { env } from "./config/env";
import { verifyDatabaseConnection } from "./config/db";

async function bootstrap(): Promise<void> {
  await verifyDatabaseConnection();

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend API is running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend server", error);
  process.exit(1);
});
