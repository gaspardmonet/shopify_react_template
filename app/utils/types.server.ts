export type RegisterForm = {
  email: string;
  password: string;
  stripeId?: string;
  isSubscriptionActive?: string;
};
export type PlanUser = {
  price_id: string;
  session_id: string;
  user_id: string;
  subscription_id: string;
};
export type UpdatePlanUser = {
  subscription_id: string;
};
export type UpdatePlan = {
  price_id: string;
  session_id: string;
  user_id: string;
  subscription_id: string;
};
