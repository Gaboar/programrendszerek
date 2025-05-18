import mongoose, { Document, Model, Schema } from 'mongoose';

interface IGroup extends Document {
    name: string;
    imageUrl: string;
    description: string;
}

const GroupSchema: Schema<IGroup> = new mongoose.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true }
});

export const Group: Model<IGroup> = mongoose.model<IGroup>('Group', GroupSchema);