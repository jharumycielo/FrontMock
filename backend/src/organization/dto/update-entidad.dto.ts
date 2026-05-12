import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEntidadDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  ruc?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  nombre?: string;
}
