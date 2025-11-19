import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileType, GeneralStatus } from '@prisma/client';

export class FileDto {
  @IsString()
  @IsNotEmpty()
  folderId: string;

  @IsEnum(FileType)
  @IsOptional()
  type: FileType;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsEnum(GeneralStatus)
  @IsNotEmpty()
  status: GeneralStatus;
}
