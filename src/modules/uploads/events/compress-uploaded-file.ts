import config from "@mongez/config";
import { fileSize, removePath } from "@mongez/fs";
import { removeFirst } from "@mongez/reinforcements";
import { log } from "@warlock.js/logger";
import { Image } from "./../../../image";
import { uploadsPath } from "./../../../utils/paths";
import { Upload } from "./../models";

export async function compressUploadingFile(file: Upload) {
  if (file.get("mimeType").startsWith("image/") === false) return;

  if (file.get("compress") === false) return;

  // skip if file is webp
  if (file.get("extension") === "webp") return;
  try {
    const fullFilePath = file.path;
    const fileName = file.get("name");

    // convert the image to webp
    log("upload", "compressing", "Compressing " + fileName + "...", "info");

    const image = new Image(fullFilePath);

    // replace the end of the file path with .webp
    const newPath = fullFilePath.replace(/(\.[a-zA-Z0-9]+)$/, ".webp");

    await image.saveAsWebp(newPath);

    file.set("name", fileName.replace(/(\.[a-zA-Z0-9]+)$/, ".webp"));
    file.set("path", removeFirst(newPath, uploadsPath()));
    file.set("mimeType", "image/webp");
    file.set("extension", "webp");
    file.set("size", fileSize(newPath));

    log("upload", "compressed", "Compressed " + fileName + "...", "success");

    // now remove the original file
    removePath(fullFilePath);
  } catch (error: any) {
    // do nothing
    console.log("Compressing Error", error.message);
    log.error("upload", "compressing", error.message);
  }
}

export function compressImageWhileUploading() {
  if (!config.get("uploads.compress")) return;

  Upload?.events().onSaving(compressUploadingFile);
}
