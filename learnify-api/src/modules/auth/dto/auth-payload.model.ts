import { ObjectType, Field } from '@nestjs/graphql';
import { UserOutput } from '@/modules/user/user.entity'

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => UserOutput)
  user: UserOutput;
}