import { useLoaderData } from "@remix-run/react";

export const action = async ({ request }) => {
  return { request };
};

export default function update() {
  const { request } = useLoaderData();

  if (request.method === "POST") {
    // Handle subscription update logic and return JSON
    return json({ message: "Subscription updated" });
  } else {
    // Render the root page's HTML content
    return "";
  }
}
