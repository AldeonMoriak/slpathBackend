import { Tag } from '../tag.entity';

export default interface TagResponse {
  tag: Tag;
  message: string;
}
