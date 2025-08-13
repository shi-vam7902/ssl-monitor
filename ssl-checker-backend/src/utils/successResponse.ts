import { S3BucketFolders } from './common.enum';

export class SuccessResponse {
  constructor(message: string, data: any, count?: number, filePath?: S3BucketFolders) {
    data = Array.isArray(data) ? data : [data];
    return { message, data, count: count ?? 0, filePath };
  }
}
