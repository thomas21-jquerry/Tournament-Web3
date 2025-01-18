import { Schema, Document } from 'mongoose';

// Game Schema
export const GameSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

// Game Interface
export interface Game extends Document {
  name: string;
  description: string;
}
