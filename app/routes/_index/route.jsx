import { Form, useLoaderData } from "@remix-run/react";
import { Layout } from "../../components/layout/layout";
import { authenticator } from "../../utils/auth.server";
import { Card } from "../../components/card/Card";
import { cardData } from "../../helpers";
import Stripe from "stripe";
import {
  createUserPlan,
  updatePlan,
  updateUserPlan,
} from "../../utils/plan.server";
import { updateUser } from "../../utils/user.server";
import { prisma } from "../../utils/prisma.server";
import { toast } from "react-toastify";
import { json } from "@remix-run/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "auth/login",
  });
  const url = new URL(request.url);
  const id = url.searchParams.get("session_id");
  const session = await prisma.userPlan.findFirst({
    where: { user_id: user.id },
  });

  if (id) {
    const lineItems = await stripe.checkout.sessions.listLineItems(id);
    if (lineItems) {
      const session = await prisma.userPlan.findFirst({
        where: { user_id: user.id, price_id: lineItems?.data[0]?.price?.id },
      });
      if (!session) {
        if (session?.session_id !== id) {
          await updatePlan({
            price_id: lineItems?.data[0]?.price?.id,
            session_id: id,
            user_id: user?.id,
            subscription_id: "",
          });
        } else
          await createUserPlan({
            price_id: lineItems?.data[0]?.price?.id,
            session_id: id,
            user_id: user?.id,
            subscription_id: "",
          });
      }
    }
  }

  return { user, session };
};

export const action = async ({ request }) => {
  const form = await request.formData();
  const user_id = form.get("user_id");
  const supervisor_id = form.get("supervisor_id");
  const to_enabled = form.get("to_enabled");
  if (to_enabled) {
    if (to_enabled === "Disbaled") {
      await updateUser(user_id, "active");
      await updateUserPlan(user_id, supervisor_id);
      return json(
        { message: `successFully Updated Disabled` },
        { status: 200 }
      );
    } else {
      await updateUser(user_id, "unactive");
      return json({ message: `successFully Updated Enabled` }, { status: 200 });
    }
  } else {
    return await authenticator.logout(request, {
      redirectTo: "/",
    });
  }
};

export default function Index() {
  const { user, session } = useLoaderData();

  const handleClick = async (id) => {
    try {
      if (session == null || session?.price_id !== id) {
        const session = await stripe.checkout.sessions.create({
          success_url:
            "http://localhost:54764?success=true&session_id={CHECKOUT_SESSION_ID}",
          customer: user?.stripeId,
          line_items: [
            {
              price: id,
              quantity: 1,
            },
          ],
          mode: "subscription",
        });
        if (session.url) {
          window.location.href = session.url;
        }
      } else {
        toast("Plan already selected", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (error) {
      console.log({ id });
      console.log({ error });
    }
  };

  return (
    <Layout>
      <Form method="post" className="p-6 flex justify-end">
        <button
          type="submit"
          name="action"
          value="logout"
          className="text-red-500 py-1 border px-3 text-sm rounded-md font-semibold"
        >
          Logout
        </button>
      </Form>
      <div className="w-full py-[10rem] px-4 bg-white">
        <div className="max-w-[1240px] mx-auto grid md:grid-cols-2 gap-8">
          {cardData.map((item, index) => (
            <Card
              card={item}
              index={index}
              handleClick={handleClick}
              user={user}
              session={session}
              stripe={stripe}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
