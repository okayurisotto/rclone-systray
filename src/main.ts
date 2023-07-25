import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ElectronAppService } from "./electron-app.service";

const bootstrap = async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const electronAppService = app.get(ElectronAppService);
  await electronAppService.initialize();
};
bootstrap();
