import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🕑 Runs daily at 02:00 AM server time
cron.schedule('0 2 * * *', async () => {
    await runUnSuspendUsers();
});

/**
 * Unsuspends users whose suspension period has expired
 * Can be reused from a manual trigger route
 */
export async function runUnSuspendUsers(): Promise<number> {
    try {
        const now = new Date();

        const result = await prisma.user.updateMany({
            where: {
                StatusId: 2, // Suspended
                SuspendedUntil: {
                    lte: now,
                },
            },
            data: {
                StatusId: 1, // Active
                SuspendedUntil: null,
            },
        });

        console.log(`✅ Un-suspended ${result.count} user(s) at ${now.toISOString()}`);
        return result.count;
    } catch (error) {
        console.error('❌ Failed to unsuspend users:', error);
        return 0;
    }
}