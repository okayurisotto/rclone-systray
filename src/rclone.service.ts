import { Injectable } from "@nestjs/common";
import { app } from "electron";
import { decode } from "ini";
import * as path from "node:path";
import { readFileSync, mkdtempSync, rmdirSync } from "node:fs";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

type Remote = {
  id: string;
};

@Injectable()
export class RcloneService {
  private remotes: Map<symbol, Remote>;
  private processEntries: Map<
    symbol,
    | { p: ChildProcessWithoutNullStreams; tmpdir: string }
    | { p: ChildProcessWithoutNullStreams; tmppath: string }
  > = new Map();

  constructor() {
    const configfilepath = path.join(
      app.getPath("home"),
      ".config/rclone/rclone.conf"
    );

    const config = decode(readFileSync(configfilepath, { encoding: "utf-8" }));

    this.remotes = new Map(
      Object.keys(config).map((id) => [Symbol(id), { id }])
    );
  }

  list(): Map<symbol, Remote> {
    return this.remotes;
  }

  async mount(key: symbol): Promise<void> {
    console.log(key, "off -> on");

    const remote = this.remotes.get(key);
    if (remote === undefined) throw new Error();

    const tmpdir = mkdtempSync(
      path.join(app.getPath("desktop"), remote.id + "-")
    );

    const p = spawn(
      [
        `rclone`,
        `mount`,
        `--vfs-cache-mode`,
        `full`,
        `${remote.id}:`,
        tmpdir,
      ].join(" "),
      { shell: true }
    );

    p.on("close", () => {
      // TODO
      setTimeout(() => {
        rmdirSync(tmpdir);
      }, 1000);

      this.processEntries.delete(key);
    });

    this.processEntries.set(key, { p, tmpdir });
  }

  async unmount(key: symbol): Promise<void> {
    console.log(key, "on -> off");
    const entry = this.processEntries.get(key);
    if (entry === undefined) throw new Error();

    const result = entry.p.kill();
    if (result) {
      console.log(key, "successed");
    } else {
      console.log(key, "failed");
    }
  }

  onClose(key: symbol, listener: () => void): void {
    const entry = this.processEntries.get(key);
    if (entry === undefined) throw new Error();
    entry.p.on("close", () => {
      listener();
    });
  }
}
