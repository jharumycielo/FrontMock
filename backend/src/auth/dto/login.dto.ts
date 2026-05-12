import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  @Length(8, 20, { message: 'El DNI debe tener entre 8 y 20 caracteres' })
  dni: string;

  @IsString()
  @IsNotEmpty({ message: 'El password es obligatorio' })
  password: string;
}
