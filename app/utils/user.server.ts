import bcrypt from "bcryptjs";
import type { RegisterForm } from "./types.server";
import { prisma } from "./prisma.server";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51OOgBTAiuAnA1QvWLYIl8XYgDTpVdeMfDBAk1PPMcdMaprHUWctj2JMOiLMVV8a6i03RjYIsAhFf1suduExyj2ay00KfxhW2qH"
);

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 12);
  const stripeUser = await stripe.customers.create({
    email: user.email,
  });
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      stripeId: stripeUser.id,
      isSubscriptionActive: "unactive",
    },
  });
  return {
    id: newUser.id,
    email: user.email,
    stripeId: stripeUser.id,
    isSubscriptionActive: false,
  };
};

export const updateUser = async (id: string, active: string) => {
  return await prisma.user.updateMany({
    where: { id: id },
    data: {
      isSubscriptionActive: active,
    },
  });
};
