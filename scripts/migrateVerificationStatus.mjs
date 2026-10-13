import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.log("No MONGODB_URI in process.env, loading from dotenv...");
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  const collection = mongoose.connection.collection("fundraisers");
  const result = await collection.updateMany(
    {
      $or: [
        { verificationStatus: { $exists: false } },
        { verificationStatus: null },
      ],
    },
    {
      $set: {
        verificationStatus: "verified",
        verificationBadge: "standard",
        verifiedAt: new Date(),
        verificationNote: "Verified initial platform campaign",
      },
    }
  );

  console.log(`Updated ${result.modifiedCount} existing campaigns to 'verified'.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
