/**
 * Portable file storage helper.
 *
 * Supports two backends (auto-detected from environment variables):
 *
 * 1. AWS S3 (recommended for Render / self-hosted deployments)
 *    Required env vars:
 *      AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 *    Optional:
 *      AWS_S3_ENDPOINT  - override for S3-compatible services (MinIO, R2, Backblaze, etc.)
 *
 * 2. Manus Forge storage proxy (used on Manus platform)
 *    Required env vars:
 *      BUILT_IN_FORGE_API_URL, BUILT_IN_FORGE_API_KEY
 */

import { ENV } from "./_core/env";

function useS3Backend(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
}

async function s3Put(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION || "us-east-1";
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const key = relKey.replace(/^\/+/, "");
  const body = typeof data === "string" ? Buffer.from(data) : data;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  const url = endpoint
    ? `${endpoint}/${bucket}/${key}`
    : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return { key, url };
}

async function s3Get(relKey: string, expiresIn = 3600): Promise<{ key: string; url: string }> {
  const { S3Client, GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  const bucket = process.env.AWS_S3_BUCKET!;
  const region = process.env.AWS_REGION || "us-east-1";
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const client = new S3Client({
    region,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  const key = relKey.replace(/^\/+/, "");
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn });
  return { key, url };
}

function getForgeConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage not configured. Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_BUCKET " +
      "for AWS S3, or BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY for Manus."
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

async function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getForgeConfig();
  const key = relKey.replace(/^\/+/, "");
  const uploadUrl = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  uploadUrl.searchParams.set("path", key);
  const rawData = typeof data === "string" ? Buffer.from(data) : Buffer.from(data as Uint8Array);
  const blob = new Blob([rawData], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${message}`);
  }
  const url = (await response.json()).url;
  return { key, url };
}

async function forgeGet(relKey: string): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getForgeConfig();
  const key = relKey.replace(/^\/+/, "");
  const downloadApiUrl = new URL("v1/storage/downloadUrl", ensureTrailingSlash(baseUrl));
  downloadApiUrl.searchParams.set("path", key);
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return { key, url: (await response.json()).url };
}

/** Upload a file. Returns { key, url }. */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (useS3Backend()) return s3Put(relKey, data, contentType);
  return forgePut(relKey, data, contentType);
}

/** Get a download URL for a stored file. */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  if (useS3Backend()) return s3Get(relKey, expiresIn);
  return forgeGet(relKey);
}
