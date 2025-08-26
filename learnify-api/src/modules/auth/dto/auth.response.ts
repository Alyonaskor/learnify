import { Field, ObjectType } from '@nestjs/graphql';
import { UserOutput } from '@/modules/user/user.output';

@ObjectType()
export class AuthResponse {
  @Field(() => UserOutput)
  user: UserOutput;

  @Field(() => String)
  refreshToken: string;

  @Field(() => String)
  accessToken: string;
}