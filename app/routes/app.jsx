import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { MONTHLY_PLAN, authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const { admin, billing } = await authenticate.admin(request);

  //   const rezult = await admin.graphql(
  //     `
  //   query Shop{
  //    app{
  //     installation{
  //       launchUrl
  //       activeSubscriptions{
  //         id
  //         name
  //         createdAt
  //         status
  //         returnUrl
  //         currentPeriodEnd
  //         trialDays
  //       }
  //     }
  //   }
  //  }
  //  `
  //     // { variables: {} }
  //   );

  //   const rezult = await admin.graphql(
  //     `
  // mutation AppSubscriptionCreate( $name: String!, $test: Boolean!, $lineItems:[AppSubscriptionLineItemInput!], returnUrl: String!){
  //          appSubscriptionCreate($name: String!,$test: Boolean!, $lineItems:[AppSubscriptionLineItemInput!] returnUrl: String!,){
  //          userErrors {
  //          field,
  //          message
  //          },
  //          confirmationUrl,
  //           appSubscription {
  //           id
  //           }
  //         }
  //      }
  // `,
  //     {
  //       variable: {
  //         name: "Monthly subscription",
  //         test: true,
  //         returnUrl: "http://asrasoft.shopifyapps.com",
  //         lineItems: [
  //           {
  //             plan: {
  //               appRecurringPricingDetails: {
  //                 price: {
  //                   amount: 7,
  //                   currencyCode: "USD",
  //                 },
  //                 interval: "EVERY_30_DAYS",
  //               },
  //             },
  //           },
  //         ],
  //       },
  //     }
  //   );

  const rezult = await admin.graphql(
    `
    mutation {
      appSubscriptionCreate(
        name: "Super Duper Capped Pricing Plan",
        returnUrl: "http://asrasoft.shopifyapps.com",
        lineItems: [
          {
            plan: {
              appUsagePricingDetails: {
                terms: "$1 for 100 emails",
                cappedAmount: {
                  amount: 20.00,
                  currencyCode: USD
                }
              }
            }
          },
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: 10.00,
                  currencyCode: USD
                }
              }
            }
          }
        ]
      ) {
        userErrors {
          field,
          message
        },
        confirmationUrl,
        appSubscription {
          id,
          lineItems {
            id,
            plan {
              pricingDetails {
                __typename
              }
            }
          }
        }
      }
    }
    
    `
  );

  const rezultJson = await rezult.json();
  console.log("Rezult:", rezultJson);
  // const { activeSubscriptions, launchUrl } = rezultJson?.data?.app.installation;

  // if (activeSubscriptions.length < 1) {
  // const billingCheck = await billing.require({
  //   plans: [MONTHLY_PLAN],
  //   isTest: true,
  //   onFailure: async () =>
  //     billing.request({
  //       plan: MONTHLY_PLAN,
  //       returnUrl: launchUrl,
  //     }),
  // });

  // const subscription = billingCheck.appSubscriptions[0];
  // await billing.cancel({
  //   subscriptionId: subscription.id,
  //   isTest: true,
  //   prorate: true,
  // });

  // }

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
