import { Schema, Document } from 'mongoose';

export const PlayerSchema = new Schema({
  tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
}, { timestamps: true });

// Score Interface
export interface Player extends Document {
  tournamentId: string;  
  userId: string;        
  score: number;
}
