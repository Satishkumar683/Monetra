import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGODB_URI found.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(uri);
  const adminEmails = ["satishkumarhp1718@gmail.com", "codex0447@gmail.com"];
  const res = await mongoose.connection.collection("users").updateMany(
    { email: { $in: adminEmails } },
    { $set: { role: "admin" } }
  );
  console.log(`Updated ${res.modifiedCount} user(s) to 'admin' role.`);
  
  const users = await mongoose.connection.collection("users").find({}).project({ email: 1, role: 1 }).toArray();
  console.log("Current users in DB:", users);
  
  await mongoose.disconnect();
}

run().catch(console.error);
