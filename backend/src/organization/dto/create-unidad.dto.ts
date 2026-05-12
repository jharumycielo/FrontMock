import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUnidadDto {
  @IsString()
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  codigo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de unidad es obligatorio' })
  @Transform(({ value }) => value?.trim())
  tipoUnidad: string;
}
