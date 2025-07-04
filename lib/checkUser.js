import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return null;
    }

    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || 'Anonymous User',
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress || '',
      },
    });

    return newUser;
  } catch (error) {
    console.error('Error in checkUser:', error);
    // Return null instead of throwing to prevent server component render errors
    return null;
  }
};