import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFriend extends Document {
    user1: string;
    user2: string;
    accepted: Boolean;
}

const FriendSchema: Schema<IFriend> = new mongoose.Schema({
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    accepted: { type: Boolean, required: true }
});

export const Friend: Model<IFriend> = mongoose.model<IFriend>('Friend', FriendSchema);