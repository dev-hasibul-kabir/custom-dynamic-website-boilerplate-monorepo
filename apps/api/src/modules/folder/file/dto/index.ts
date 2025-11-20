import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { FileType, GeneralStatus } from '@prisma/client';

export class FileDto {
  @Type(() => Number)
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  folderId: number;

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
