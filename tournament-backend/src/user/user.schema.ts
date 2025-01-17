import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  address: { type: String, required: true, unique: true },
});

export interface User extends Document {
  address: string;
}
