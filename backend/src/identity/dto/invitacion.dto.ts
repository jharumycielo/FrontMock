import { IsEmail, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class InvitacionDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsUUID('4')
  entidadPublicaId: string;

  @IsUUID('4')
  @IsOptional()
  unidadOrganicaId?: string;

  @IsUUID('4')
  rolId: string;

  @IsEnum(['sistema', 'nacional', 'entidad', 'unidad'])
  ambito: string;
}
