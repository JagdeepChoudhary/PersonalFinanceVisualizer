import { Schema, model, models, Document,} from 'mongoose';


// Category Interface
export interface ICategory extends Document {
  name: string;
  monthlySpend: number;
  budget?: number;
  monthlyLimit: number;
  month: string;
}

// Mongoose Schema
const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, default: 'Uncategorized' },
  monthlySpend: { type: Number, default: 0 },
  monthlyLimit: { type: Number, },
  month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
}, { timestamps: true });

export const Category = models.Category || model<ICategory>('Category', categorySchema);


