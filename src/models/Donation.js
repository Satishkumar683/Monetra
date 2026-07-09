import mongoose, { Schema } from "mongoose";

const DonationSchema = new Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fundraiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fundraiser",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    anonymous: {
      type: Boolean,
      default: false,
    },

    paymentId: {
      type: String,
      default: null, // will hold Razorpay payment ID once Phase 5 is wired in
    },

    status: {
      type: String,
      enum: ["Success", "Pending", "Failed"],
      default: "Success", // simulated donations are marked Success immediately for now
    },
  },
  {
    timestamps: true,
  }
);

const Donation =
  mongoose.models.Donation || mongoose.model("Donation", DonationSchema);

export default Donation;