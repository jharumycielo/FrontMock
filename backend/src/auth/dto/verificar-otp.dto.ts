import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerificarOtpDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @Length(4, 4, { message: 'El código debe tener exactamente 4 dígitos' })
  codigo: string;

  @IsString()
  @MinLength(8, { message: 'El nuevo password debe tener mínimo 8 caracteres' })
  passwordNuevo: string;
}
