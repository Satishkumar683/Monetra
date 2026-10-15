// src/models/Fundraiser.js
import mongoose, { Schema } from "mongoose";

const DocumentSchema = new Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Medical Bill", "Hospital Certificate", "ID Proof", "Other"],
      default: "Other",
    },
    fileData: { type: String, required: true }, // base64 data URI
  },
  { _id: true, timestamps: true }
);

const FundraiserSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    targetAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    currentAmount: {
      type: Number,
      default: 0,
    },

    coverImage: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      default: "General",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isUrgent: {
      type: Boolean,
      default: false,
    },

    urgentReason: {
      type: String,
      default: "",
      trim: true,
    },

    deadline: {
      type: Date,
      default: null,
    },

    documents: {
      type: [DocumentSchema],
      default: [],
    },

    updates: [
      {
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "action_required"],
      default: "pending",
    },

    verificationBadge: {
      type: String,
      enum: ["standard", "hospital_verified", "field_verified", "none"],
      default: "none",
    },

    verificationNote: {
      type: String,
      default: "",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

FundraiserSchema.index({ isActive: 1, createdAt: -1 });
FundraiserSchema.index({ isUrgent: 1, isActive: 1, createdAt: -1 });
FundraiserSchema.index({ verificationStatus: 1, createdAt: -1 });
FundraiserSchema.index({ owner: 1 });
FundraiserSchema.index({ category: 1 });

const Fundraiser =
  mongoose.models.Fundraiser ||
  mongoose.model("Fundraiser", FundraiserSchema);

export default Fundraiser;