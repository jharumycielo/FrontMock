import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoSolicitudDto {
  @IsEnum(['ELABORADO', 'VERIFICADO', 'APROBADO', 'RECHAZADO', 'OBSERVADO', 'ELIMINADO'], {
    message: 'Estado no válido',
  })
  estadoNuevo: string;

  // Obligatorio en OBSERVADO y RECHAZADO
  @IsString()
  @IsOptional()
  comentario?: string;
}
