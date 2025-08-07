import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '@/modules/user/user.entity'

@ObjectType()
export class AuthPayload {
  @Field()
  token: string;

  @Field(() => User)
  user: User;
}