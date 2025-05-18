import mongoose, { Document, Model, Schema } from 'mongoose';

interface IGroupMember extends Document {
    user: string;
    group: string;
}

const GroupMemberSchema: Schema<IGroupMember> = new mongoose.Schema({
    user: { type: String, required: true },
    group: { type: String, required: true }
});

export const GroupMember: Model<IGroupMember> = mongoose.model<IGroupMember>('GroupMember', GroupMemberSchema);