import mongoose from "mongoose";
const { Schema, model } = mongoose;

const CommentSchema = new Schema({
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    content: { type: String, required: true, maxLength: 1000 },
    
    // Threading
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    
    likes: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    
    deleted: { type: Boolean, default: false },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

CommentSchema.index({ campaign: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.models.Comment || model("Comment", CommentSchema);
