import { Resolver, Query } from '@nestjs/graphql';
import { PostService } from './post.service';

@Resolver()
export class PostResolver {
  constructor(private readonly PostService: PostService) {}

  @Query(() => String)
  PostPing() {
    return this.PostService.ping();
  }
}