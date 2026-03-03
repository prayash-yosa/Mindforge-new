import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'MPIN must be exactly 6 digits' })
  @Matches(/^[0-9]{6}$/, { message: 'MPIN must be numeric' })
  mpin: string;
}
