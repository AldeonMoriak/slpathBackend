import { Comment as CommentEntity } from 'src/comments/comment.entity';

export interface CommentInterface extends CommentEntity {
  replies?: CommentEntity[];
}
