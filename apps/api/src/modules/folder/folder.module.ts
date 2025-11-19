import { FolderController } from './folder.controller';
import { FolderService } from './folder.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';
import { DbModule } from '@/db/db.module';
import { DbService } from '@/db/db.service';

// System imports
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import * as fs from 'fs';
import slugify from 'slugify';
import * as _ from 'lodash';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule, DbModule],
      useFactory: (configService: ConfigService, dbService: DbService) => ({
        storage: diskStorage({
          destination: (req, file, callback) => {
            void (async () => {
              try {
                // console.debug({ file });

                // console.debug({ body: req.body });
                // console.debug({ folderId: req.body.folderId });
                // console.debug({ folderId: parseInt(req.body.folderId) });

                const folderId =
                  req.body && typeof req.body === 'object' && 'folderId' in req.body
                    ? String(req.body.folderId)
                    : null;

                if (!folderId) {
                  return callback(new Error('folderId is required'), '');
                }

                const folder = await dbService.folder.findFirst({
                  where: { id: parseInt(folderId, 10) },
                });
                // console.debug({ folder });

                if (!folder || !folder.slug) {
                  return callback(new Error('Folder not found'), '');
                }

                const attachmentDir = configService.get<string>('ATTACHMENT_DIRECTORY');
                if (!attachmentDir) {
                  return callback(new Error('ATTACHMENT_DIRECTORY not configured'), '');
                }

                const dirPath = join(attachmentDir, folder.slug);
                // console.debug({ dirPath });

                fs.mkdirSync(dirPath, {
                  recursive: true,
                });

                return callback(null, dirPath);
              } catch (error) {
                const err = error instanceof Error ? error : new Error('Unknown error');
                return callback(err, '');
              }
            })();
          },
          filename: (req, file, callback) => {
            // console.debug({ req, file });

            // console.debug({ fileName: req.body });

            const extension = extname(file.originalname);
            // console.debug({ extension });

            const originalFileNameWithoutExtension = _.replace(file.originalname, extension, '');

            const fileName =
              req.body && typeof req.body === 'object' && 'name' in req.body
                ? String(req.body.name)
                : originalFileNameWithoutExtension;

            const newFileNameWithoutExtension = slugify(fileName, {}) + '_' + new Date().getTime();

            return callback(null, `${newFileNameWithoutExtension}${extension}`);
          },
        }),
      }),
      inject: [ConfigService, DbService],
    }),
  ],
  controllers: [FolderController, FileController],
  providers: [FolderService, FileService, ConfigService],
})
export class FolderModule {}
