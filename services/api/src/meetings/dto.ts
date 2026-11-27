import { IsOptional, IsString, IsBoolean, IsISO8601, MaxLength, MinLength } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsISO8601()
  scheduledStart?: string;

  @IsOptional()
  @IsISO8601()
  scheduledEnd?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  recordingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  lowBandwidthDefault?: boolean;
}

export class JoinDto {
  @IsString()
  @MinLength(4)
  @MaxLength(12)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;
}
