import {
  IsString, IsNotEmpty, IsUUID, IsArray,
  ArrayMinSize, ValidateNested, IsOptional,
  IsBoolean, IsDateString, Matches, IsInt, Min,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CuentaAmbitoDto {
  @IsUUID('4')
  ambitoInstitucionalId: string;
}

export class CuentaEntidadDto {
  @IsUUID('4')
  entidadPublicaId: string;
}

export class SolicitudCuentaDto {
  @IsUUID('4')
  planContableId: string;

  @IsUUID('4')
  @IsOptional()
  cuentaContableOrigenId?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9](\.[1-9][0-9]?)*$/, {
    message: 'El código debe tener formato válido: 1.22.43.1.53',
  })
  codigoCompleto: string;

  @IsString()
  @Matches(/^[1-9]$/, { message: 'El elemento debe ser un dígito del 1 al 9' })
  elemento: string;

  @IsString()
  @IsOptional()
  @Matches(/^[1-9][0-9]?$/, { message: 'El grupo debe ser entre 1 y 99' })
  grupo?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[1-9][0-9]?$/, { message: 'La cuenta debe ser entre 1 y 99' })
  cuenta?: string;

  @IsString()
  @IsOptional()
  subcuenta1?: string;

  @IsString()
  @IsOptional()
  subcuenta2?: string;

  @IsString()
  @IsOptional()
  subcuenta3?: string;

  @IsInt()
  @Min(1)
  nivel: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  codigoAnterior?: string;

  @IsBoolean()
  esImputable: boolean;

  @IsString()
  @IsNotEmpty()
  naturaleza: string;

  @IsString()
  @IsNotEmpty()
  tipoElemento: string;

  @IsBoolean()
  esMonetaria: boolean;

  @IsBoolean()
  @IsOptional()
  aplicaExtraPresupuestaria?: boolean;

  @IsBoolean()
  @IsOptional()
  esReciproca?: boolean;

  @IsBoolean()
  @IsOptional()
  tieneDinamicaContable?: boolean;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  dinamicaDebita?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  dinamicaAcredita?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  dinamicaObjeto?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || null)
  dinamicaSaldos?: string;

  @IsBoolean()
  @IsOptional()
  esParaEntidadEstado?: boolean;

  // Requerido si esParaEntidadEstado = true
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CuentaEntidadDto)
  entidades?: CuentaEntidadDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CuentaAmbitoDto)
  ambitos?: CuentaAmbitoDto[];

  // Secciones que se modifican (para tipoAccion = modificacion)
  @IsArray()
  @IsOptional()
  seccionesModificadas?: string[];
}

export class CreateSolicitudDto {
  @IsUUID('4')
  tipoDocumentoId: string;

  @IsString()
  @IsNotEmpty()
  tipoAccion: string;

  @IsDateString()
  fechaRequerimiento: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  organoLinea: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  justificacion: string;

  @IsBoolean()
  @IsOptional()
  provieneEntidadExterna?: boolean;

  @IsUUID('4')
  @IsOptional()
  entidadExternaId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos una cuenta contable' })
  @ValidateNested({ each: true })
  @Type(() => SolicitudCuentaDto)
  cuentas: SolicitudCuentaDto[];
}
