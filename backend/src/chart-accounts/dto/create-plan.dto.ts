import {
  IsString, IsNotEmpty, IsEnum,
  IsDateString, IsBoolean, IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty({ message: 'El número de plan es obligatorio' })
  @Transform(({ value }) => value?.trim())
  numeroPlanContable: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @Transform(({ value }) => value?.trim())
  descripcion: string;

  @IsDateString()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  vigenciaPlanContable: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @IsEnum(['gubernamental_unico', 'general_empresarial', 'sistema_financiero'], {
    message: 'tipoPlan debe ser: gubernamental_unico, general_empresarial o sistema_financiero',
  })
  tipoPlan: string;
}
