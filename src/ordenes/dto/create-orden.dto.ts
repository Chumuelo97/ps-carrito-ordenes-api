import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray } from 'class-validator';

export class CreateOrdenDto {
  @IsString()
  @IsNotEmpty()
  nombreCliente: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsArray()
  @IsOptional()
  productos?: string[];
}
