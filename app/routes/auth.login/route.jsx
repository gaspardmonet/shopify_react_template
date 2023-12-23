import { useState } from "react";
import { Form, Link, useActionData } from "@remix-run/react";
import { Layout } from "../../components/layout/layout";
import { FormField } from "../../components/form-field/form-field";
import { authenticator } from "../../utils/auth.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return user;
};

export const action = async ({ request }) => {
  try {
    const form = await request.formData();
    const email = form.get("email");

    const errors = {};

    if (!email.includes("@")) {
      errors.email = "Invalid email address";
    }

    if (Object.keys(errors).length > 0) {
      return json({ errors });
    }

    return authenticator.authenticate("form", request, {
      successRedirect: "/",
      failureRedirect: "auth/login",
      context: { formData: form },
    });
  } catch (error) {
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

export default function Login() {
  const actionData = useActionData();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInpuChange = (event, fields) => {
    setFormData((prev) => ({ ...prev, [fields]: event.target.value }));
  };

  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <h2 className="text-5xl font-extrabold ">Sign In </h2>

        <Form method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
          <div>
            <FormField
              htmlFor="email"
              label="Email"
              value={formData.email}
              onChange={(e) => handleInpuChange(e, "email")}
            />
            {actionData?.errors?.email ? (
              <em className="text-red-600 font-semibold">
                {actionData?.errors.email}
              </em>
            ) : null}
          </div>
          <div>
            <FormField
              htmlFor="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInpuChange(e, "password")}
            />
            {actionData?.errors?.password ? (
              <em className="text-red-600 font-semibold">
                {actionData?.errors.password}
              </em>
            ) : null}
          </div>
          <div className="w-full text-center">
            <input
              type="submit"
              className="rounded-xl mt-2 bg-yellow-300 px-3 py-2  font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
              value="Sign In"
            />
          </div>
        </Form>
        <p className="text-gray-600">
          Create account?
          <Link to="/auth/signup">
            <span className="text-red-600 px-2 underline">Sign Up</span>
          </Link>
        </p>
      </div>
    </Layout>
  );
}
