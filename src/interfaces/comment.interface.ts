import { Comment } from 'src/comments/comment.entity';

export interface CommentInterface extends Comment {
  replies?: Comment[];
}
