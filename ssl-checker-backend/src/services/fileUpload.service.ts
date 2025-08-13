import { Injectable, UnprocessableEntityException } from "@nestjs/common";

import { extname } from "path";
import { Upload } from "@aws-sdk/lib-storage";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { ENV } from "src/config";

@Injectable()
export class S3Service {
  private s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY || "",
      secretAccessKey: process.env.AWS_S3_KEY_SECRET || "",
    },
  });

  async uploadFile(file, documentPath: string) {
    const { originalname, buffer, mimetype } = file;
    return new Promise((resolve, reject) => {
      return new Upload({
        client: this.s3Client,
        params: {
          // ACL: 'public-read',
          Bucket: `${process.env.AWS_S3_BUCKET || "default-bucket"}`,
          Key: String(`${documentPath}${extname(originalname)}`),
          Body: buffer,
          ContentType: mimetype,
        },
        queueSize: 4,
        partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      })
        .done()
        .then((res) => {
          return resolve(res);
        })
        .catch(() => {
          return reject(originalname);
        });
    });
  }

  async moveFile(
    sourceDir: string,
    destinationDir: string,
    documentName: string
  ) {
    try {
      const command = new CopyObjectCommand({
        // ACL: 'public-read',
        Bucket: process.env.AWS_S3_BUCKET || "default-bucket",
        CopySource: `/${process.env.AWS_S3_BUCKET || "default-bucket"}/${sourceDir}`,
        Key: destinationDir,
      });
      return new Promise((resolve, reject) => {
        return this.s3Client.send(command, (err, res) => {
          if (err) {
            return reject(documentName);
          } else {
            return resolve(res);
          }
        });
      });
    } catch (error) {
      throw new UnprocessableEntityException(
        `This File Doesn't Moved ${sourceDir}`
      );
    }
  }

  async deleteFile(Key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET || "default-bucket",
        Key,
      })
    );
  }

  async getFile(Key: string) {
    const input = {
      Bucket: process.env.AWS_S3_BUCKET || "default-bucket",
      Key,
    };
    const command = new GetObjectCommand(input);
    const response = await this.s3Client.send(command);
    return response.Body.transformToString();
  }
}
