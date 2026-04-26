import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV === "production") {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

const QuestSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  target: { type: Number, required: true },
  unit: { type: String, required: true },
  step: { type: Number, required: true },
  xp: { type: Number, required: true },
  description: { type: String },
  rewards: {
    vitality: { type: Number, default: 0 },
    wealth: { type: Number, default: 0 },
    intellect: { type: Number, default: 0 },
    focus: { type: Number, default: 0 },
  },
  progress: { type: Number, default: 0 },
  dueTime: { type: String },
  completed: { type: Boolean, default: false },
  completedAt: { type: String, default: null },
  custom: { type: Boolean, default: false },
  createdAt: { type: String },
});

const HistoryEntrySchema = new mongoose.Schema({
  date: { type: String, required: true },
  completionRate: { type: Number, required: true },
  completedCount: { type: Number, required: true },
  totalCount: { type: Number, required: true },
  xpEarned: { type: Number, required: true },
});

const ProfileSchema = new mongoose.Schema({
  displayName: { type: String },
  timeZone: { type: String, default: "UTC" },
  lastReset: { type: String },
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  stats: {
    vitality: { type: Number, default: 0 },
    wealth: { type: Number, default: 0 },
    intellect: { type: Number, default: 0 },
    focus: { type: Number, default: 0 },
  },
  quests: [QuestSchema],
  history: [HistoryEntrySchema],
});

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  profile: ProfileSchema,
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);

let isConnected = false;

export async function ensureDatabase() {
  if (isConnected) {
    return;
  }

  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not defined. Skipping database connection.");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function readDatabase() {
  await ensureDatabase();
  const users = await User.find({}).lean();
  return { users };
}

export async function withDatabase(mutator) {
  await ensureDatabase();
  
  // Note: This helper was originally for the file-based DB to handle locks.
  // For MongoDB, we'll try to keep it compatible but it's less efficient
  // than using direct Mongoose operations.
  const database = await readDatabase();
  const result = await mutator(database);
  
  // This is a naive implementation of withDatabase for MongoDB.
  // In a real app, we should use atomic updates.
  // For now, we'll iterate and save changed users.
  for (const userData of database.users) {
    await User.updateOne({ id: userData.id }, userData, { upsert: true });
  }
  
  return result;
}
