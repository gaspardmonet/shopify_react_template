import { useState } from "react";
import Stripe from "stripe";

import { useSubmit } from "@remix-run/react";
import { toast } from "react-toastify";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const action = async ({ request }) => {
  console.log({ request });
  return { request };
};

export function Card({ card, index, handleClick, user, session }) {
  const submit = useSubmit();
  const [updatedUser, setUpdatedUser] = useState(user);
  const [subscriptionId, setSubscriptionId] = useState(
    session?.subscription_id
  );
  const formData = new FormData();
  console.log({ subscriptionId, session, user });
  const handleDisabled = async (id) => {
    try {
      setUpdatedUser({
        ...updatedUser,
        isSubscriptionActive: "active",
      });

      if (!subscriptionId) {
        const customer = await stripe.customers.retrieve(
          updatedUser?.stripeId,
          {
            expand: ["subscriptions"],
          }
        );
        const subscriptions = customer?.subscriptions?.data;
        await stripe.subscriptions.update(subscriptions[0]?.id, {
          pause_collection: {
            behavior: "void",
          },
        });
        setSubscriptionId(subscriptions[0]?.id);
        formData.append("supervisor_id", subscriptions[0]?.id);
        formData.append("user_id", updatedUser.id);
        formData.append("to_enabled", "Disbaled");
        submit(formData, { method: "post" });
        toast("Plan Disabled", {
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

      if (subscriptionId) {
        await stripe.subscriptions.update(subscriptionId, {
          pause_collection: {
            behavior: "void",
          },
        });
        formData.append("supervisor_id", subscriptionId);
        formData.append("user_id", updatedUser.id);
        formData.append("to_enabled", "Disbaled");
        submit(formData, { method: "post" });
        toast("Plan Disabled", {
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
      console.error("Error retrieving customer subscriptions:", error);
      throw error;
    }
  };

  const handleEnabled = async (id) => {
    try {
      setUpdatedUser({
        ...updatedUser,
        isSubscriptionActive: "unactive",
      });
      if (subscriptionId) {
        await stripe.subscriptions.update(subscriptionId, {
          pause_collection: "",
        });
        formData.append("user_id", updatedUser.id);
        formData.append("to_enabled", "Enabled");
        submit(formData, { method: "post" });
        toast("Plan Enabled", {
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
      console.error("Error retrieving customer subscriptions:", error);
      throw error;
    }
  };

  return (
    <div
      key={index}
      className={`w-full shadow-xl flex flex-col p-4 my-4 rounded-lg hover:scale-105 duration-300`}
    >
      <img
        className="w-20 mx-auto mt-[-3rem] bg-white"
        src={card.image}
        alt="/"
      />

      <h2 className="text-2xl font-bold text-center py-8">{card.title}</h2>
      <p className="text-center text-4xl font-bold">{card.price}</p>
      <div className="text-center font-medium">
        <p className={`py-2 border-b mx-8`}>{card.features}</p>
      </div>

      <button
        className={`bg-[#00df9a] hover:text-[#00df9a] hover:bg-gray-50 duration-150 w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3`}
        onClick={() => handleClick(card.priceId)}
      >
        Buy Plan
      </button>
      {updatedUser?.isSubscriptionActive === "active" ? (
        <button
          className={`bg-[#0029df] hover:text-[#0029df] hover:bg-gray-50 duration-150 w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3`}
          onClick={handleEnabled}
        >
          Enabled
        </button>
      ) : (
        <button
          className={`bg-[#0029df] hover:text-[#0029df] hover:bg-gray-50 duration-150 w-[200px] rounded-md font-medium my-6 mx-auto px-6 py-3`}
          onClick={handleDisabled}
        >
          Disbaled
        </button>
      )}
    </div>
  );
}
