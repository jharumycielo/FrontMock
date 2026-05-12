import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  Matches,
  Length,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PerfilDto {
  @IsUUID('4')
  entidadPublicaId: string;

  @IsUUID('4')
  @IsOptional()
  unidadOrganicaId?: string;

  @IsUUID('4')
  rolId: string;

  @IsEnum(['sistema', 'nacional', 'entidad', 'unidad'])
  ambito: string;

  @IsBoolean()
  @IsOptional()
  esPrincipal?: boolean;
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  @Length(8, 20)
  dni: string;

  @IsString()
  @IsNotEmpty({ message: 'Los nombres son obligatorios' })
  @Transform(({ value }) => value?.trim())
  nombres: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  @Transform(({ value }) => value?.trim())
  apellidos: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe asignar al menos un perfil' })
  @ValidateNested({ each: true })
  @Type(() => PerfilDto)
  perfiles: PerfilDto[];
}
