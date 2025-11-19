import {
  UseGuards,
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Delete,
  Inject,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { FileService } from './file.service';
import { CheckAbility } from '@/common/decorators';
import { PermissionGuard } from '@/common/guards';
import { FileDto } from './dto';

export const fileSubject = 'file';

@Controller('')
export class FileController {
  @Inject()
  private readonly fileService: FileService;

  @CheckAbility({ subject: fileSubject, action: 'create' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Post('api/v1/files')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() dto: FileDto, @UploadedFile() file: Express.Multer.File) {
    // console.debug({ file });

    return await this.fileService.save(dto, file);
  }

  @HttpCode(HttpStatus.OK)
  @Get('folders/:folderName/files/:fileName')
  getFile(@Param('folderName') folderName: string, @Param('fileName') fileName: string) {
    return this.fileService.getFile(folderName, fileName);
  }

  @CheckAbility({ subject: fileSubject, action: 'read' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Get('api/v1/folders/:folderId/files')
  async readAll(@Param('folderId') folderId: string) {
    return await this.fileService.getAll(parseInt(folderId));
  }

  // @CheckAbility({ subject: fileSubject, action: 'read' })
  // @UseGuards(PermissionGuard)
  // @HttpCode(HttpStatus.OK)
  // @Get('api/v1/files/:id')
  // async readById(@Param('id') id: string) {
  // 	return await this.fileService.getById(parseInt(id));
  // }

  // @CheckAbility({ subject: fileSubject, action: 'update' })
  // @UseGuards(PermissionGuard)
  // @HttpCode(HttpStatus.OK)
  // @Put('api/v1/files/:id')
  // @UseInterceptors(FileInterceptor('url'))
  // async updateById(@Param('id') id, @Body() dto: UpdateFileDto) {
  // 	return await this.fileService.editById(parseInt(id), dto);
  // }

  @CheckAbility({ subject: fileSubject, action: 'delete' })
  @UseGuards(PermissionGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('api/v1/files/:id')
  async deleteById(@Param('id') id: string) {
    return await this.fileService.removeById(parseInt(id, 10));
  }
}
