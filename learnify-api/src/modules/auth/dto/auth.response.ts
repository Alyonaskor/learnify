import { Field, ObjectType } from '@nestjs/graphql';
import { UserOutput } from '@/modules/user/user.entity';

@ObjectType()
export class AuthResponse {
  
  @Field(() => UserOutput)
  user: UserOutput;

  @Field()
  refreshToken: string;

  @Field()
  accessToken: string;
}