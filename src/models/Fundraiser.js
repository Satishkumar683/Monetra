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

    documents: {
      type: [DocumentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Fundraiser =
  mongoose.models.Fundraiser ||
  mongoose.model("Fundraiser", FundraiserSchema);

export default Fundraiser;