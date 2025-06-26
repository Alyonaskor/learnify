import { Injectable } from '@nestjs/common';

@Injectable()
export class PostService {
  ping() {
    return 'post pong';
  }
}
