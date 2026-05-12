import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoUnidadDto {
  @IsEnum(['suspendida', 'activa', 'archivada'], {
    message: 'Estado debe ser: suspendida, activa o archivada',
  })
  estado: 'suspendida' | 'activa' | 'archivada';

  @IsString()
  @IsOptional()
  motivo?: string;
}
