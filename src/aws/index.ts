import type { S3ClientConfig } from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { log } from "@warlock.js/logger";
import fs from "fs";
import { normalize } from "path";
export * from "./get-aws-configurations";

export type AWSConnectionOptions = {
  endpointUrl: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  providerName: string; // i.e aws | digitalocean
  /**
   * If you're using cloudfront, then you can specify the cloudfront URL here
   * Just add the cloudfront URL and it will be used instead of the bucket URL
   */
  cloudfront?: string;
} & Partial<S3ClientConfig>;

export type AWSConfigurations = {
  parseFileName?: (options: { fileName: string; hash?: string }) => string;
  connectionOptions:
    | AWSConnectionOptions
    | (() => Promise<AWSConnectionOptions>);
};

export type AWSUploadOptions = {
  filePath?: string;
  fileBuffer?: Buffer;
  fileName: string;
  hash?: string;
  mimeType?: string;
  isCachedFile?: boolean;
} & AWSConfigurations;

function getObjectUrl({
  bucketName,
  fileName,
  providerUrl,
  providerName,
  // connectionOptions,
}: {
  bucketName: string;
  fileName: string;
  providerUrl: string;
  providerName: string;
  // connectionOptions: AWSConfigurations["connectionOptions"];
}) {
  if (providerName === "r2") {
    // return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${fileName}`;
  }

  return `https://${bucketName}.${providerUrl}/${fileName}`;
}

export async function createAWSClient(
  connectionOptions: AWSConfigurations["connectionOptions"],
) {
  if (typeof connectionOptions === "function") {
    connectionOptions = await connectionOptions();
  }

  const {
    endpointUrl,
    accessKeyId,
    bucketName,
    secretAccessKey,
    providerName,
    region = "us-east-1",
    ...clientOptions
  } = connectionOptions;

  // Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
  const s3Client = new S3Client({
    endpoint: endpointUrl, // Find your endpoint in the control panel, under Settings. Prepend "https://".
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    region: region,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey, // Secret access key defined through an environment variable.
    },
    signatureVersion: "v4",
    ...clientOptions,
  } as any);

  return {
    client: s3Client,
    bucketName,
    providerName,
    endpointUrl,
    region,
  };
}

export async function uploadToAWS({
  filePath,
  fileBuffer,
  fileName,
  hash,
  mimeType,
  isCachedFile = false,
  parseFileName = ({ fileName, hash }) =>
    (hash ? hash + "/" : "") + normalize(fileName).replace(/\\/g, "/"),
  connectionOptions,
}: AWSUploadOptions) {
  const finalFleName =
    (isCachedFile ? "cache/" : "") + parseFileName({ fileName, hash });

  const { client, bucketName, endpointUrl, providerName, region } =
    await createAWSClient(connectionOptions);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: finalFleName,
    Body: fileBuffer || fs.createReadStream(filePath as string),
    // make it publicly accessible
    ACL: "public-read",
    ContentType: mimeType,
  });

  log(
    "aws",
    "uploading",
    "Uploading " + finalFleName + " to " + bucketName + "...",
    "info",
  );

  try {
    await client.send(command);

    log(
      "aws",
      "uploaded",
      "Uploaded " + finalFleName + " to " + bucketName + "...",
      "success",
    );

    // now we have the URL of the uploaded file
    // let's return it
    const providerUrl = endpointUrl.replace(/^https?:\/\//, "");

    return {
      path: providerUrl,
      name: providerName,
      bucket: bucketName,
      region,
      fileName: finalFleName,
      url: getObjectUrl({
        bucketName,
        fileName: finalFleName,
        providerUrl,
        providerName,
      }),
    };
  } catch (err) {
    console.log("Error", err);
    log(
      "aws",
      "error",
      "Error uploading " + finalFleName + " to " + bucketName + "...",
      "error",
    );
  }
}

export async function deleteFromAWS({
  fileName,
  connectionOptions,
}: {
  fileName: string;
  connectionOptions: AWSConfigurations["connectionOptions"];
}) {
  const { client, bucketName } = await createAWSClient(connectionOptions);

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  log(
    "aws",
    "deleting",
    "Deleting " + fileName + " from " + bucketName + "...",
    "info",
  );

  try {
    await client.send(command);

    log(
      "aws",
      "deleted",
      "Deleted " + fileName + " from " + bucketName + "...",
      "success",
    );
  } catch (err) {
    console.log("Error", err);
    log("aws", "deleting", err, "error");
  }
}

export async function downloadFromAWS({
  fileName,
  connectionOptions,
}: {
  fileName: string;
  connectionOptions: AWSConfigurations["connectionOptions"];
}) {
  const { client, bucketName } = await createAWSClient(connectionOptions);

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });

  log(
    "aws",
    "downloading",
    "Downloading " + fileName + " from " + bucketName + "...",
    "info",
  );

  try {
    const content = await client.send(command);

    log(
      "aws",
      "downloaded",
      "Downloaded " + fileName + " from " + bucketName + "...",
      "success",
    );

    return content.Body?.transformToByteArray();
  } catch (err) {
    console.log("Error", err);
    log("aws", "downloading", err, "error");
  }
}

export async function streamFromAWS({
  fileName,
  connectionOptions,
  start,
  end,
}: {
  fileName: string;
  connectionOptions: AWSConfigurations["connectionOptions"];
  start: number;
  end: number;
}) {
  const { client, bucketName } = await createAWSClient(connectionOptions);

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Range: `bytes=${start}-${end}`,
  });

  log(
    "aws",
    "streaming",
    "Streaming " + fileName + " from " + bucketName + "...",
    "info",
  );

  try {
    const content = await client.send(command);

    log(
      "aws",
      "streamed",
      "Streamed " + fileName + " from " + bucketName + "...",
      "success",
    );

    return content.Body?.transformToByteArray();
  } catch (err) {
    console.log("Error", err);
    log("aws", "streaming", err, "error");
  }
}
