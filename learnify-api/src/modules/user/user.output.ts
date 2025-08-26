import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';



@ObjectType()

export class UserOutput {
  @Field(() => ID) 
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}