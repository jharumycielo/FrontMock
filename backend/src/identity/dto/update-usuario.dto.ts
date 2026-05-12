import { IsString, IsOptional, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  nombres?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  apellidos?: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;
}
