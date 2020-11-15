import { CategoriesService } from '../categories.service';
import { Category } from '../category.entity';

export default interface CategoryResponse {
  category: Category;
  message: string;
}
