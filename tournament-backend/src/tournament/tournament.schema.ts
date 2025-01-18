import { Schema, Document } from 'mongoose';

// Tournament Schema
export const TournamentSchema = new Schema({
  entryFee: { type: String, required: true }, // Fee in ETH or Tokens (you may convert this to a string if using token)
  onchainId:  {type: Number,},
  maxPlayers: { type: Number, required: true },
  startTime: { type: Number, required: true },
  gameType: { type: String, required: true }, // You can link this to the Game Schema if needed
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true }, // Reference to Game model
  isActive: { type: Boolean, default: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }]  // Add users as an array of references to the User model
}, { timestamps: true });

// Tournament Interface
export interface Tournament extends Document {
  entryFee: string;
  onchainId: number;
  maxPlayers: number;
  startTime: number;
  gameType: string;
  gameId: string;
  isActive: boolean;
  users: string[];  // Array of User ObjectId references
}
