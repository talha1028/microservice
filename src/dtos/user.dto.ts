import { 
  IsEmail, 
  IsUrl, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  Matches, 
  MaxLength 
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class createuserdto {
  @ApiProperty({
    example: "john.doe@example.com",
    description: "The email address of the user",
  })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({
    example: "12345678",
    description: "Password (min 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character)",
  })
  @IsNotEmpty({ message: "Password cannot be empty" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @MaxLength(32, { message: "Password cannot exceed 32 characters" })

  password: string;

  @ApiProperty({
    example: "John Doe",
    description: "Full name of the user",
  })
  @IsNotEmpty({ message: "Name cannot be empty" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @MaxLength(50, { message: "Name cannot exceed 50 characters" })
  @Matches(/^[A-Za-z\s]+$/, {
    message: "Name must contain only alphabets and spaces",
  })
  @Matches(/^(?!\s)(?!.*\s$)(?!.*\s{2,}).*$/, {
    message: "Name cannot have leading, trailing, or multiple consecutive spaces",
  })
  name: string;


}
