import mongoose, { Document, Model, Schema } from 'mongoose';

interface IPost extends Document {
    location: string;
    author: string;
    date: Date;
    text: string;
    imageUrl: string;
}

const PostSchema: Schema<IPost> = new mongoose.Schema({
    location: { type: String, required: true },
    author: { type: String, required: true },
    date: { type: Date, required: true },
    text: { type: String, required: false },
    imageUrl: { type: String, required: false }
});

export const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);