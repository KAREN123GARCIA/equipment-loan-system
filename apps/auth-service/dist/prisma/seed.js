"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const username = process.env.SEED_ADMIN_USERNAME;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !username || !password) {
        console.log("Seed skipped (missing SEED_ADMIN_*).");
        return;
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: { username, passwordHash },
        create: { email, username, passwordHash },
    });
    await prisma.userRole.upsert({
        where: { userId_role: { userId: user.id, role: "ADMIN" } },
        update: {},
        create: { userId: user.id, role: "ADMIN" },
    });
    console.log("Seeded:", { id: user.id, email: user.email, username: user.username, role: "ADMIN" });
}
main().finally(async () => prisma.$disconnect());
//# sourceMappingURL=seed.js.map