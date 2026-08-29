
import mongoose, { type Connection } from "mongoose";
import "dotenv/config";

// Force Node's DNS resolver to a working DNS server. On this dev machine the
// default resolver is pointed at 127.0.0.1 and refuses SRV lookups, which makes
// every mongodb+srv:// connection fail with querySrv ECONNREFUSED. Bypassing it
// with a public resolver fixes Atlas connectivity.
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const LOCAL_URI = "mongodb://127.0.0.1:27017/queueflow";
const ATLAS_URI = process.env.MONGO_URI as string;

const COLLECTIONS = [
    "users",
    "branches",
    "departments",
    "agents",
    "queues",
    "notifications",
] as const;

const copyCollection = async (src: Connection, dst: Connection, name: string) => {
    const srcDocs = await src.db!.collection(name).find({}).toArray();
    if (srcDocs.length === 0) {
        console.log(`  ${name}: 0 docs (nothing to copy)`);
        return 0;
    }

    await dst.db!.collection(name).deleteMany({});

    // Insert documents with their original _id preserved so cross-collection
    // references (branch -> department -> agent/queue, etc.) stay valid.
    await dst.db!.collection(name).insertMany(srcDocs, { ordered: false });
    // Note: ordered:false so one bad doc doesn't abort the rest; Mongoose casts
    // ObjectId back to the driver string first, so this needs the raw docs.
    console.log(`  ${name}: copied ${srcDocs.length} docs`);
    return srcDocs.length;
};

const run = async () => {
    if (!ATLAS_URI) {
        throw new Error("MONGO_URI (Atlas) is not set in .env");
    }

    console.log("Connecting to local MongoDB...");
    const local = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log("  local connected");

    console.log("Connecting to MongoDB Atlas...");
    const atlas = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log("  atlas connected");

    console.log("\nCopying collections local -> Atlas...");
    const totals: Record<string, number> = {};
    for (const name of COLLECTIONS) {
        const n = await copyCollection(local, atlas, name);
        totals[name] = n;
    }

    console.log("\nMigration complete!");
    console.table(totals);

    await local.close();
    await atlas.close();
    console.log("Disconnected. Bye!");
};

run().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
