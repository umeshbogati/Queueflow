
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../src/config/db.js";
import { User } from "../src/models/User.js";
import Branch from "../src/models/Branch.js";
import Department from "../src/models/Department.js";
import Queue from "../src/models/Queue.js";
import Notification from "../src/models/Notification.js";
import Agent from "../src/models/Agent.js";

// Helper to get today's date in YYYY-MM-DD format (used for seeding queues)
const today = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const run = async () => {
    await connectDB();

    // --- 1) Clear existing data ------------------------------------------------
    console.log(" Clearing existing data...");
    await Promise.all([
        User.deleteMany({}),
        Branch.deleteMany({}),
        Department.deleteMany({}),
        Queue.deleteMany({}),
        Notification.deleteMany({}),
        Agent.deleteMany({}),
    ]);

    // ---- 2) Users -----------------------------------------------------------
    console.log("Creating users...");
    // Same hashing approach as authService.registerUser (12 rounds)
    const hashedPassword = await bcrypt.hash("password123", 12);

    const [admin, user1, user2, user3] = await User.create([
        { name: "Umesh Bogati", email: "umesh14@gmail.com", password: hashedPassword, role: "admin" },
        { name: "Ramesh Kumar", email: "ramesh20@gmail.com", password: hashedPassword, role: "user" },
        { name: "Shyam Bhatta", email: "shyam20@gmail.com", password: hashedPassword, role: "user" },
        { name: "Sita Sharma", email: "sita20@gmail.com", password: hashedPassword, role: "user" },
    ]);
    if (!admin || !user1 || !user2 || !user3) {
        throw new Error("User seeding failed");
    }

    // ---- 3) Branches --------------------------------------------------------
    console.log(" Creating branches...");
    const [mainBranch, cityBranch] = await Branch.create([
        { name: "Main Branch - Downtown", location: "123 Main Street,Kathmandu" },
        { name: "City Center Branch", location: "456 City Avenue, Dhangadhi" },
    ]);
    if (!mainBranch || !cityBranch) {
        throw new Error("Branch seeding failed");
    }

    // ---- 4) Departments -----------------------------------------------------
    console.log(" Creating departments...");
    const [
        mainReception,
        mainPharmacy,
        mainBilling,
        cityReception,
        cityPharmacy,
        citySupport,
    ] = await Department.create([
        { name: "Reception", prefix: "REC", branch: mainBranch._id, description: "General reception desk" },
        { name: "Pharmacy", prefix: "PHR", branch: mainBranch._id, description: "Medicine pickup & prescriptions" },
        { name: "Billing", prefix: "BIL", branch: mainBranch._id, description: "Payments & invoices" },
        { name: "Reception", prefix: "REC", branch: cityBranch._id, description: "General reception desk" },
        { name: "Pharmacy", prefix: "PHR", branch: cityBranch._id, description: "Medicine pickup & prescriptions" },
        { name: "Customer Support", prefix: "SUP", branch: cityBranch._id, description: "Complaints & inquiries" },
    ]);
    if (!mainReception || !mainPharmacy || !mainBilling || !cityReception || !cityPharmacy || !citySupport) {
        throw new Error("Department seeding failed");
    }

    // ---- 5) Agents ----------------------------------------------------------
    console.log("Creating agents...");
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

    const [agent1, agent2, agent3] = await Agent.create([
        {
            user: user1._id,
            branch: mainBranch._id,
            department: mainReception._id,
            counterNumber: 1,
            officeStart: 9,
            officeEnd: 17,
            maxTokensPerDay: 20,
            tokensServedToday: 0,
            lastResetDate: todayStr,
            isActive: true,
            status: "available",
        },
        {
            user: user2._id,
            branch: mainBranch._id,
            department: mainPharmacy._id,
            counterNumber: 2,
            officeStart: 9,
            officeEnd: 17,
            maxTokensPerDay: 20,
            tokensServedToday: 0,
            lastResetDate: todayStr,
            isActive: true,
            status: "available",
        },
        {
            user: user3._id,
            branch: cityBranch._id,
            department: cityReception._id,
            counterNumber: 1,
            officeStart: 9,
            officeEnd: 17,
            maxTokensPerDay: 15,
            tokensServedToday: 0,
            lastResetDate: todayStr,
            isActive: true,
            status: "available",
        },
    ]);
    if (!agent1 || !agent2 || !agent3) {
        throw new Error("Agent seeding failed");
    }

    // ---- 6) Queues ----------------------------------------------------------
    // Helper to build one ticket. `status` decides which timestamps we set,
    // mirroring what updateQueueStatus/callNextQueue do in real usage.
    // Ticket numbers restart at 1 per department per day, like createQueue.
    console.log(" Creating queues...");
    const date = today();
    const seqByDepartment = new Map<string, number>();

    const makeTicket = async (
        department: typeof mainReception,
        customer: typeof admin,
        status: "waiting" | "called" | "serving" | "completed",
        counterNumber?: number
    ) => {
        const deptKey = department._id.toString();
        const seq = (seqByDepartment.get(deptKey) ?? 0) + 1;
        seqByDepartment.set(deptKey, seq);
        const displayNumber = `${department.prefix}${String(seq).padStart(3, "0")}`;

        return Queue.create({
            ticketNumber: seq,
            displayNumber,
            branch: department.branch,
            department: department._id,
            customer: customer._id,
            status,
            date,
            ...(counterNumber ? { counterNumber } : {}),
            ...(status === "called" || status === "serving" ? { calledAt: new Date(Date.now() - 10 * 60000) } : {}),
            ...(status === "serving" ? { servingAt: new Date(Date.now() - 5 * 60000) } : {}),
            ...(status === "completed"
                ? { calledAt: new Date(Date.now() - 30 * 60000), servingAt: new Date(Date.now() - 25 * 60000), completedAt: new Date(Date.now() - 15 * 60000) }
                : {}),
        });
    };

    // Main branch - Reception: history + live activity
    await makeTicket(mainReception, user1, "completed");
    await makeTicket(mainReception, user2, "completed");
    await makeTicket(mainReception, user3, "serving", 1);
    await makeTicket(mainReception, user1, "waiting");
    await makeTicket(mainReception, user2, "waiting");

    // Main branch - Pharmacy & Billing: mostly waiting lines
    await makeTicket(mainPharmacy, user2, "called");
    await makeTicket(mainPharmacy, user3, "waiting");
    await makeTicket(mainBilling, user1, "waiting");
    await makeTicket(mainBilling, user3, "waiting");

    // City branch: light traffic
    await makeTicket(cityReception, user3, "completed");
    await makeTicket(cityReception, user1, "waiting");
    await makeTicket(cityPharmacy, user2, "waiting");
    await makeTicket(citySupport, user1, "called");

    // ---- 7) Done ------------------------------------------------------------
    console.log("\n Seed complete!");
    console.log("──────────────────────────────────────────────");
    console.log("Login accounts (password for ALL: password123)");
    console.log("──────────────────────────────────────────────");
    console.log(`  Admin     : ${admin.email}`);
    console.log(`  Customer 1: ${user1.email}  (Ramesh Kumar)`);
    console.log(`  Customer 2: ${user2.email}  (shyam Bhatta)`);
    console.log(`  Customer 3: ${user3.email}  (Sita Sharma)`);
    console.log("──────────────────────────────────────────────");
    console.log("Agents created:");
    console.log(`  ${user1.name} -> ${mainReception.name} (Counter 1, 9-17h, 20 tokens/day)`);
    console.log(`  ${user2.name} -> ${mainPharmacy.name} (Counter 2, 9-17h, 20 tokens/day)`);
    console.log(`  ${user3.name} -> ${cityReception.name} (Counter 1, 9-17h, 15 tokens/day)`);
    console.log("──────────────────────────────────────────────");

    await mongoose.disconnect();
    console.log("Disconnected. Bye!");
};

// Any error -> print it and exit non-zero so npm run seed visibly fails
run().catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
});
