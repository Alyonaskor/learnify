import { ObjectType, Field } from '@nestjs/graphql';
import { UserOutput } from '@/modules/user/user.output'

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  accessToken: string;

  @Field(() => UserOutput)
  user: UserOutput;
}