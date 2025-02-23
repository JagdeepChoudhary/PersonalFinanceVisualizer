import { Schema, model, models, Document, Types } from 'mongoose';

// Transaction Interface
export interface ITransaction extends Document {
  date: Date;
  amount: number;
  description: string;
  category?: Types.ObjectId;
}

// Mongoose Schema
const transactionSchema = new Schema<ITransaction>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
}, { timestamps: true });

export const Transaction = models.Transaction || model<ITransaction>('Transaction', transactionSchema);

