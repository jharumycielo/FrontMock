import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEntidadDto {
  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  ruc?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsEnum([
    'ministerio', 'municipalidad', 'gobierno_regional',
    'unidad_ejecutora', 'organismo_publico', 'empresa_publica', 'otra',
  ], { message: 'Tipo de entidad no válido' })
  tipoEntidad: string;

  @IsUUID('4')
  @IsOptional()
  entidadPadreId?: string;
}
