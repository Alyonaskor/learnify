import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(6)
  password: string;

  // if needed
   @Field({ nullable: true }) 
   name?: string;
}