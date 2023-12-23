import { prisma } from "./prisma.server";
import { PlanUser, UpdatePlan } from "./types.server";

export const createUserPlan = async (plan: PlanUser) => {
  const newUserPlan = await prisma.userPlan.create({
    data: {
      price_id: plan.price_id,
      session_id: plan.session_id,
      user_id: plan.user_id,
      subscription_id: plan.subscription_id,
    },
  });
  return {
    id: newUserPlan.id,
    price_id: plan.price_id,
    session_id: plan.session_id,
    user_id: plan.user_id,
    subscription_id: plan.subscription_id,
  };
};

export const updatePlan = async (updateplan: UpdatePlan, id: string) => {
  await prisma.userPlan.updateMany({
    where: { user_id: id },
    data: {
      price_id: updateplan.price_id,
      session_id: updateplan.session_id,
      user_id: updateplan.user_id,
      subscription_id: updateplan.subscription_id,
    },
  });
};

export const updateUserPlan = async (id: string, subscription_id: any) => {
  return await prisma.userPlan.updateMany({
    where: { user_id: id },
    data: {
      subscription_id: subscription_id,
    },
  });
};
