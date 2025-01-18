import { Schema, Document } from 'mongoose';

export const UserSchema = new Schema({
  address: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'user'],  // Only allow "admin" or "user"
    default: 'user'           // Set default role to 'user'
  }
});

export interface User extends Document {
  address: string;
  role: 'admin' | 'user'; 
}
