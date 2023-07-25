import { Module } from "@nestjs/common";
import { RcloneService } from "./rclone.service";
import { ElectronAppService } from "./electron-app.service";

@Module({
  imports: [],
  controllers: [],
  providers: [ElectronAppService, RcloneService],
})
export class AppModule {}
