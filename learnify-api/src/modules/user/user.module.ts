
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()               // имя «User» попадёт в схему
export class User {
  @Field(() => ID) id: number;
  @Field() email: string;
  @Field({ nullable: true }) name?: string;
  @Field() createdAt: Date;
  @Field() updatedAt: Date;
}
export class UserModule {}
