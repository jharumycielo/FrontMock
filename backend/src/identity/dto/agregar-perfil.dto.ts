import { IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class AgregarPerfilDto {
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
