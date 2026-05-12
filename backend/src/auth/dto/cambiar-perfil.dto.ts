import { IsUUID, IsNotEmpty } from 'class-validator';

export class CambiarPerfilDto {
  @IsUUID('4', { message: 'El perfilId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El perfilId es obligatorio' })
  perfilId: string;
}
