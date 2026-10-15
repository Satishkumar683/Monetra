import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = Global Community Lounge
    },

    conversationId: {
      type: String,
      required: true,
      index: true, // "global" or "userId1_userId2"
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    campaignRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fundraiser",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
