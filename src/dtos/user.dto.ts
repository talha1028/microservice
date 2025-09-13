import { IsEmail, IsUrl, IsNotEmpty, MinLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class createuserdto {
    @ApiProperty({
        example: "john.doe@example.com",
        description: "The email address of the user"
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: "strongPassword123",
        description: "Password (min 8 characters)"
    })
    @MinLength(8)
    password: string;

    @ApiProperty({
        example: "John Doe",
        description: "Full name of the user"
    })
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @ApiProperty({
        example: "https://example.com/avatar.jpg",
        description: "Profile picture URL"
    })
    @IsUrl()
    @IsOptional()
    avatarurl?: string;
}
