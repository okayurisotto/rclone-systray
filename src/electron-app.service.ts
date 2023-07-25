import { Injectable } from "@nestjs/common";
import { Menu, MenuItem, Tray, app, nativeImage } from "electron";
import { RcloneService } from "./rclone.service";

@Injectable()
export class ElectronAppService {
  constructor(private readonly rcloneService: RcloneService) {}

  async initialize() {
    await app.whenReady();

    const image = nativeImage.createEmpty(); // TODO
    const tray = new Tray(image);
    tray.setContextMenu(
      Menu.buildFromTemplate([
        ...[...this.rcloneService.list()].map(([key, remote]) => {
          const menuItem = new MenuItem({
            type: "checkbox",
            label: remote.id,
            click: async (menuItem) => {
              if (menuItem.checked) {
                await this.rcloneService.mount(key);
                this.rcloneService.onClose(key, () => {
                  menuItem.checked = false;
                });
              } else {
                this.rcloneService.unmount(key);
              }
            },
          });
          return menuItem;
        }),
        { type: "separator" },
        {
          type: "normal",
          label: "Exit",
          click: () => {
            app.exit();
          },
        },
      ])
    );
  }
}
