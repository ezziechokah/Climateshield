import { Readable } from 'stream';

jest.mock('@aws-sdk/client-s3', () => {
  const send = jest.fn();

  class FakeCommand {
    constructor(public input: Record<string, unknown>) {}
  }

  return {
    __mockSend: send,
    S3Client: jest.fn().mockImplementation(() => ({ send })),
    PutObjectCommand: FakeCommand,
    GetObjectCommand: FakeCommand,
    DeleteObjectCommand: FakeCommand,
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://minio.local/test-bucket/reports/r1.pdf?sig=abc'),
}));

 
const { __mockSend: mockSend } = jest.requireMock('@aws-sdk/client-s3') as unknown as { __mockSend: jest.Mock };

import { getSignedUrl as mockedGetSignedUrl } from '@aws-sdk/s3-request-presigner';

import { DataClassification } from './classification';
import { DEFAULT_SIGNED_URL_EXPIRY_SECONDS, StorageClient } from './storage-client';

describe('StorageClient', () => {
  beforeEach(() => {
    mockSend.mockReset();
    (mockedGetSignedUrl as jest.Mock).mockClear();
  });

  function createClient(): StorageClient {
    return new StorageClient({ region: 'us-east-1', bucket: 'climate-reports', endpoint: 'http://localhost:9000' });
  }

  it('upload() sends a PutObjectCommand carrying the classification as object metadata', async () => {
    mockSend.mockResolvedValue({});
    const client = createClient();

    const result = await client.upload({
      key: 'reports/r1.pdf',
      body: Buffer.from('pdf-bytes'),
      contentType: 'application/pdf',
      classification: DataClassification.RESTRICTED,
    });

    expect(result).toEqual({ key: 'reports/r1.pdf', classification: DataClassification.RESTRICTED });
    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toMatchObject({
      Bucket: 'climate-reports',
      Key: 'reports/r1.pdf',
      ContentType: 'application/pdf',
      Metadata: { classification: 'restricted' },
    });
  });

  it('download() returns the body/contentType/classification from the S3 response', async () => {
    const body = Readable.from(['file-bytes']);
    mockSend.mockResolvedValue({ Body: body, ContentType: 'application/pdf', Metadata: { classification: 'public' } });
    const client = createClient();

    const result = await client.download('reports/r1.pdf');

    expect(result.body).toBe(body);
    expect(result.contentType).toBe('application/pdf');
    expect(result.classification).toBe('public');
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toMatchObject({ Bucket: 'climate-reports', Key: 'reports/r1.pdf' });
  });

  it('getSignedUrl() defaults to a 15-minute (900s) expiry matching the access-token TTL', async () => {
    const client = createClient();

    const url = await client.getSignedUrl('reports/r1.pdf');

    expect(url).toBe('https://minio.local/test-bucket/reports/r1.pdf?sig=abc');
    expect(DEFAULT_SIGNED_URL_EXPIRY_SECONDS).toBe(900);
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 900 });
  });

  it('getSignedUrl() honors an explicit expiry override', async () => {
    const client = createClient();

    await client.getSignedUrl('reports/r1.pdf', 60);

    expect(mockedGetSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 60 });
  });

  it('delete() sends a DeleteObjectCommand for the given key', async () => {
    mockSend.mockResolvedValue({});
    const client = createClient();

    await client.delete('reports/r1.pdf');

    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0];
    expect(command.input).toMatchObject({ Bucket: 'climate-reports', Key: 'reports/r1.pdf' });
  });

  it('requires `classification` at compile time — omitting it on upload() must fail to compile', () => {
    const client = createClient();

    const callWithoutClassification = () => {
      // @ts-expect-error — `classification` is a required UploadParams property; omitting it must be a TypeScript compile error, not a silent default.
      return client.upload({ key: 'k', body: 'x', contentType: 'text/plain' });
    };

    expect(typeof callWithoutClassification).toBe('function');
  });
});
