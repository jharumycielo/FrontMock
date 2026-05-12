import { IsEnum, IsOptional, IsUUID, IsString } from 'class-validator';

export class CambiarEstadoEntidadDto {
  @IsEnum(['suspendida', 'activa', 'migrada', 'archivada'], {
    message: 'Estado debe ser: suspendida, activa, migrada o archivada',
  })
  estado: 'suspendida' | 'activa' | 'migrada' | 'archivada';

  // Requerido solo si estado = migrada
  @IsUUID('4')
  @IsOptional()
  entidadMigracionId?: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
