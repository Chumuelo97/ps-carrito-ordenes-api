import { IsOptional, IsEnum } from 'class-validator';
import { OrdenStatus } from '../orden-status.enum';

export class FiltersOrdenDto {
  @IsOptional()
  @IsEnum(OrdenStatus)
  estado?: OrdenStatus;

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}
