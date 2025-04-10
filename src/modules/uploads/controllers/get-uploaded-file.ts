import config from "@mongez/config";
import { sha1 } from "@mongez/encryption";
import { fileExistsAsync } from "@mongez/fs";
import systemPath from "path";
import type { Request, Response } from "../../../http";
import type { ImageFormat } from "../../../image";
import { Image } from "../../../image";
import { cachePath, uploadsPath } from "../../../utils";

// TODO: Add Watermark options
export async function getUploadedFile(request: Request, response: Response) {
  const path = request.input("*");

  const fullPath = uploadsPath(path);

  const cacheTime = config.get("uploads.cacheTime", 31536000); // default is 1 year

  if (!(await fileExistsAsync(fullPath))) {
    return response.notFound({
      error: "File not found",
    });
  }

  // cache the file for 1 year
  response.header("Cache-Control", `public, max-age=${cacheTime}`);
  // set expires header to 1 year
  response.header(
    "Expires",
    new Date(Date.now() + cacheTime * 1000).toUTCString(),
  );

  const height = request.int("h");
  const width = request.int("w");
  const quality = request.int("q", 100);
  const format: ImageFormat | undefined = request.input("f");

  if (height || width || quality || format) {
    const imageOptions = {
      height: height || undefined,
      width: width || undefined,
      quality: quality,
    };

    const fileCachePathKey = sha1(
      JSON.stringify({
        imageOptions,
        path,
        format,
      }),
    );

    const cacheFullPath = cachePath(
      `images/${fileCachePathKey}${systemPath.extname(path)}`,
    );

    // make sure it is sent as an image using response header Content-Disposition
    response.header("Content-Disposition", "inline");

    if (await fileExistsAsync(cacheFullPath)) {
      return response.sendFile(cacheFullPath);
    }

    try {
      const image = new Image(fullPath);

      image.resize(imageOptions);

      if (format) {
        image.format(format);
      }

      if (quality) {
        image.quality(quality);
      }

      await image.save(cacheFullPath);

      return response.sendFile(cacheFullPath);
    } catch (error) {
      console.log("Error", error);

      return response.sendFile(fullPath);
    }
  }

  return response.sendFile(fullPath);
}
