import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'El password actual es obligatorio' })
  passwordActual: string;

  @IsString()
  @IsNotEmpty({ message: 'El nuevo password es obligatorio' })
  @MinLength(8, { message: 'El nuevo password debe tener mínimo 8 caracteres' })
  passwordNuevo: string;
}
