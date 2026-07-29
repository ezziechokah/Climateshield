import type { Readable } from 'stream';

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl as presign } from '@aws-sdk/s3-request-presigner';

import type { DataClassification } from './classification';

/** Signed URLs default to 15 minutes, matching the access-token TTL (security/jwt-config.json's `access_token_ttl_seconds`), per docs/backend/11_Storage_and_Search_Architecture.md#storage-client-library. */
export const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 900;

export interface StorageClientOptions {
  /** S3-compatible region (MinIO accepts any non-empty string). */
  region: string;
  /** Default bucket this client instance operates against (see docs/backend/11_Storage_and_Search_Architecture.md#storage-zones for the bucket-per-zone layout). */
  bucket: string;
  /** Override for MinIO/local S3-compatible endpoints; omit for AWS S3. */
  endpoint?: string;
  /** Required for MinIO/path-style endpoints; AWS S3 defaults to virtual-hosted-style. */
  forcePathStyle?: boolean;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface UploadParams {
  key: string;
  body: Readable | Buffer | string;
  contentType: string;
  /**
   * REQUIRED — deliberately not optional and never defaulted. Omitting it
   * is a TypeScript compile error (see storage-client.spec.ts's
   * `// @ts-expect-error` case), per
   * docs/backend/11_Storage_and_Search_Architecture.md#storage-client-library:
   * "the library rejects a call omitting it at the type level, so
   * classification is never an afterthought bolted onto a file after the
   * fact."
   */
  classification: DataClassification;
}

export interface UploadResult {
  key: string;
  classification: DataClassification;
}

export interface DownloadResult {
  body: Readable;
  contentType?: string;
  classification?: DataClassification;
}

/**
 * S3/MinIO wrapper — the ONLY code path any service uses to touch object
 * storage (per docs/backend/11_Storage_and_Search_Architecture.md#storage-client-library):
 * "no service calls the underlying S3 SDK directly, so a future
 * storage-provider migration ... touches one library, not every service."
 */
export class StorageClient {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(options: StorageClientOptions) {
    this.bucket = options.bucket;
    this.s3 = new S3Client({
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: options.forcePathStyle,
      credentials: options.credentials,
    });
  }

  /** Uploads `params.body` to `params.key`, tagging it with the required `classification` as object metadata. */
  async upload(params: UploadParams): Promise<UploadResult> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        Metadata: { classification: params.classification },
      }),
    );
    return { key: params.key, classification: params.classification };
  }

  /** Downloads the object at `key`. */
  async download(key: string): Promise<DownloadResult> {
    const result = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    return {
      body: result.Body as Readable,
      contentType: result.ContentType,
      classification: result.Metadata?.['classification'] as DataClassification | undefined,
    };
  }

  /**
   * Returns a time-limited, single-object signed URL — per
   * docs/backend/11_Storage_and_Search_Architecture.md#storage-client-library,
   * "the only way a file is ever served to a frontend client directly."
   * Defaults to `DEFAULT_SIGNED_URL_EXPIRY_SECONDS` (15 minutes).
   */
  async getSignedUrl(key: string, expiresInSeconds: number = DEFAULT_SIGNED_URL_EXPIRY_SECONDS): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return presign(this.s3, command, { expiresIn: expiresInSeconds });
  }

  /** Deletes the object at `key`. */
  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
