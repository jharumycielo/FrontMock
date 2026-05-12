import { IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class SolicitarOtpDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}
