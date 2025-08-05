import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  @MaxLength(50)
  password: string;

 
  @Field({ nullable: true }) 
  @IsString()
   name?: string;
}
