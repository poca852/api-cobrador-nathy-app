import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule
  ],
  controllers: [
    FilesController
  ],
  providers: [
    FilesService,
    S3Client
  ]
})
export class FilesModule {}
