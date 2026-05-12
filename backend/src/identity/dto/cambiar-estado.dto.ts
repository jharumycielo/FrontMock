import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoDto {
  @IsEnum(['activo', 'inactivo', 'bloqueado'], {
    message: 'El estado debe ser: activo, inactivo o bloqueado',
  })
  estado: 'activo' | 'inactivo' | 'bloqueado';

  @IsString()
  @IsOptional()
  motivo?: string;
}
