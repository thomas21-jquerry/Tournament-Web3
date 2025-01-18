import { Schema, Document } from 'mongoose';

// Tournament Schema
export const TournamentSchema = new Schema({
  entryFee: { type: Number, required: true }, // Fee in ETH or Tokens (you may convert this to a string if using token)
  maxPlayers: { type: Number, required: true },
  startTime: { type: Date, required: true },
  gameType: { type: String, required: true }, // You can link this to the Game Schema if needed
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true }, // Reference to Game model
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Tournament Interface
export interface Tournament extends Document {
  entryFee: number;
  maxPlayers: number;
  startTime: Date;
  gameType: string;
  gameId: string;
  isActive: boolean;
}
