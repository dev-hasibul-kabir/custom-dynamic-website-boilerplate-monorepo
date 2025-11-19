import { createErrorResult, createSuccessResult, ServiceResult } from '@/common/interfaces';
import { DbService } from '@/db/db.service';
import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, unlink } from 'fs';
import { join } from 'path';
import { FileDto } from './dto';

@Injectable()
export class FileService {
  @Inject()
  private readonly config: ConfigService;

  @Inject(DbService)
  private readonly db: DbService;

  async save(dto: FileDto): Promise<ServiceResult> {
    // Business logic validation
    if (!dto.folderId) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder ID is required' },
        'Folder ID is required',
      );
    }

    if (!dto.name) {
      return createErrorResult(
        { name: 'badRequest', message: 'File name is required' },
        'File name is required',
      );
    }

    if (!dto.url) {
      return createErrorResult(
        { name: 'badRequest', message: 'File URL is required' },
        'File URL is required',
      );
    }

    // Check if folder exists first (business logic validation)
    const folder = await this.db.folder.findUnique({
      where: { id: parseInt(dto.folderId) },
    });

    // Business logic: check if folder exists
    if (!folder) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder not found' },
        'Folder not found',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.file.create({
      data: {
        ...dto,
        folderId: parseInt(dto.folderId),
        name: dto.name,
        url: dto.url,
      },
    });

    return createSuccessResult(data, 'File created successfully');
  }

  getFile(folderName: string, fileName: string) {
    const file = createReadStream(
      join(this.config.get('ATTACHMENT_DIRECTORY'), folderName, fileName),
    );

    return new StreamableFile(file);
  }

  async getAll(folderId: number): Promise<ServiceResult> {
    // Business logic validation
    if (!folderId || folderId <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid folder ID' },
        'Invalid folder ID provided',
      );
    }

    // Single operation - use Prisma directly
    const data = await this.db.file.findMany({
      where: { folderId },
      include: { folder: true },
    });

    return createSuccessResult(data, 'Files retrieved successfully');
  }

  // async getById(id: number) {
  // 	try {
  // 		const data = await super.transact(async (tx: Prisma.TransactionClient) => {
  // 			return await super.readFirst(tx, { id });
  // 		});

  // 		return {
  // 			success: true,
  // 			data,
  // 		};
  // 	} catch (error) {
  // 		return {
  // 			success: false,
  // 			error,
  // 		};
  // 	}
  // }

  // async editById(id: number, dto: UpdateFileDto) {
  // 	try {
  // 		const data = await super.transact(async (tx: Prisma.TransactionClient) => {
  // 			return await super.update(
  // 				tx,
  // 				{ id },
  // 				{
  // 					...dto,
  // 				}
  // 			);
  // 		});

  // 		return {
  // 			success: true,
  // 			data,
  // 		};
  // 	} catch (error) {
  // 		return {
  // 			success: false,
  // 			error,
  // 		};
  // 	}
  // }

  async removeById(id: number): Promise<ServiceResult> {
    // Business logic validation
    if (!id || id <= 0) {
      return createErrorResult(
        { name: 'badRequest', message: 'Invalid file ID' },
        'Invalid file ID provided',
      );
    }

    // Single operation - use Prisma directly
    const file = await this.db.file.findFirst({ where: { id } });

    // Business logic: check if file exists
    if (!file) {
      return createErrorResult({ name: 'badRequest', message: 'File not found' }, 'File not found');
    }

    const folder = await this.db.folder.findFirst({ where: { id: file.folderId } });

    if (!folder) {
      return createErrorResult(
        { name: 'badRequest', message: 'Folder not found' },
        'Folder not found',
      );
    }

    const path = join(this.config.get('ATTACHMENT_DIRECTORY'), folder.slug, file.name);

    // Delete file from filesystem (let errors bubble up)
    await new Promise<void>((resolve, reject) => {
      unlink(path, (error: NodeJS.ErrnoException | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Delete from database (let errors bubble up)
    await this.db.file.delete({ where: { id } });

    return createSuccessResult(null, 'File deleted successfully');
  }
}
