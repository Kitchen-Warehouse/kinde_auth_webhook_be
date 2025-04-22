import { getClient } from "@ctController/index";
import { prepareCTPayload } from "@utils/customerCreateMapper";
import { AccountRegisterBody, KindeOrganization, KindePayload, KindeUser } from "@projectTypes/index";
import { ByProjectKeyRequestBuilder, Customer, CustomerUpdateAction } from "@commercetools/platform-sdk";

const orgEnvMap = {
  KWH_STG_ORG_ID: Deno.env.get("KWH_STG_ORG_ID"),
  KWSS_STG_ORG_ID: Deno.env.get("KWSS_STG_ORG_ID"),
  KWH_PROD_ORG_ID: Deno.env.get("KWH_PROD_ORG_ID"),
  KWSS_PROD_ORG_ID: Deno.env.get("KWSS_PROD_ORG_ID"),
} as { [key: string]: string };

export const createUserCt = async (kindePayload: KindePayload) => {
  try {
    const data = kindePayload?.data?.user as KindeUser;
    const matchedOrg = data?.organizations?.find((org: any) =>
      Object.values(orgEnvMap).includes(org.code)
    ) as KindeOrganization;
    const matchedEnvVarName = Object?.keys(orgEnvMap)?.find(
      key => orgEnvMap[key] === matchedOrg?.code
    ) as string;
    const customerPayloadByKinde = await getCustomerPayloadByToken(data, matchedOrg, matchedEnvVarName) as AccountRegisterBody;
    const isKwh = matchedEnvVarName?.includes("KWH");
    const accessToken = await getAccesstoken(isKwh);
    const adminClient = await getClient();
    const userExist = await isUserExist(adminClient, kindePayload?.data?.user?.email as string) as Customer;
    let kindeResponse;
    if (userExist && Object.keys(userExist).length > 0) {
      const ctPayload = prepareCTPayload(customerPayloadByKinde, userExist?.custom?.fields);

      const updateActions: CustomerUpdateAction[] = [];
      kindeResponse = await updateKindePropertyValue({
        userId: kindePayload?.data?.user?.id as string ?? '',
        kindeAccessToken: accessToken?.access_token ?? '',
        customerId: userExist?.id ?? '',
        isKwh
      });
      const rawSiteKey = ctPayload?.custom?.fields?.siteKey ?? [];

      const cleanSiteKey = Array.isArray(rawSiteKey)
        ? [...new Set(rawSiteKey.map(key => key?.trim())?.filter(key => key))]
        : [];
      updateActions.push({
        action: "setCustomField",
        name: "siteKey",
        value: cleanSiteKey ?? '',
      });
      adminClient.customers().withId({ ID: userExist?.id }).post({
        body: {
          version: userExist?.version,
          actions: updateActions,
        }
      }).execute();
      return {
        statusCode: kindeResponse?.statusCode,
        body: { ct: userExist, kinde: kindeResponse },
      };
    } else {
      const ctPayload = prepareCTPayload(customerPayloadByKinde, {});

      const customer = await adminClient.customers()
        .post({
          body: ctPayload,
        })
        .execute()
        .then((response) => {
          return response;
        })
        .catch((error) => {
          if (error.code && error.code === 400) {
            if (error.body && error.body?.errors?.[0]?.code === 'DuplicateField') {
              throw new Error(`The account ${ctPayload.email} does already exist.`);
            }
          }
          throw error;
        });
      kindeResponse = await updateKindePropertyValue({
        userId: kindePayload?.data?.user?.id as string ?? '',
        kindeAccessToken: accessToken?.access_token ?? '',
        customerId: customer?.body?.customer?.id ?? '',
        isKwh
      });
      return {
        statusCode: customer?.statusCode,
        body: { ct: customer?.body, kinde: kindeResponse },
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: err
    }
  }
}

const getCustomerPayloadByToken = async (data: KindeUser, matchedOrg: KindeOrganization, matchedEnvVarName: string ) => {
  try {
    const password = generatePassword(12);
    const KWH_SITE_KEY = Deno.env.get("KWH_SITE_KEY");
    const KWSS_SITE_KEY = Deno.env.get("KWSS_SITE_KEY");
    const siteKey = matchedEnvVarName?.includes("KWH") ? KWH_SITE_KEY : KWSS_SITE_KEY;

    const customerPayload = {
      email: data?.email, //`satya${Date.now()}@gmail.com`
      firstName: data?.first_name,
      password: password,
      lastName: data?.last_name,
      orgCode: matchedOrg?.code,
      phone: data?.phone,
      username: data?.username,
      siteKey: siteKey,
    }
    return customerPayload as AccountRegisterBody;
  } catch (err) {
    return {
      statusCode: 500,
      message: "Something went wrong while getting the customer payload", err,
    }
  }
}

const generatePassword = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const getAccesstoken = async (isKwh: boolean) => {
  try {
    let url, client_id, client_secret, audience;
    if (isKwh) {
      url = Deno.env.get('KWH_STG_KINDE_URL');
      client_id = Deno.env.get('KWH_STG_KINDE_CLIENT_ID');
      client_secret = Deno.env.get('KWH_STG_KINDE_CLIENT_SECRET');
      audience = Deno.env.get('KWH_STG_KINDE_AUDIENCE_URL');
    } else {
      url = Deno.env.get('KWSS_STG_KINDE_URL');
      client_id = Deno.env.get('KWSS_STG_KINDE_CLIENT_ID');
      client_secret = Deno.env.get('KWSS_STG_KINDE_CLIENT_SECRET');
      audience = Deno.env.get('KWSS_STG_KINDE_AUDIENCE_URL');
    }
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', client_id as string);
    body.append('client_secret', client_secret as string);
    body.append('audience', audience as string);

    const response = await fetch(`${url}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const responseData = await response.json();

    return responseData;
  } catch (err) {
    return {
      statusCode: 500,
      message: "Something went wrong while getting the access token", err,
    }
  }
};
export const updateKindePropertyValue = async ({
  userId,
  kindeAccessToken,
  customerId,
  isKwh,
}: {
  userId: string;
  kindeAccessToken: string;
  customerId: string;
  isKwh: boolean;
}) => {
  try {
    let url;
    if (isKwh) {
      url = Deno.env.get('KWH_STG_KINDE_URL');
    } else {
      url = Deno.env.get('KWSS_STG_KINDE_URL');
    }

    const response = await fetch(`${url}/api/v1/users/${userId}/properties`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${kindeAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'properties': {
          'customer_id': `${customerId}`,
        },
      }),
    });
    const responseData = await response.json();
    return responseData;
  } catch (err) {
    return {
      statusCode: 500,
      message: "Something went wrong while updating the kinde property value", err,
    }
  }
};

export const isUserExist = async (adminClient: ByProjectKeyRequestBuilder, email: string) => {
  try {
    const data = await adminClient
      .customers().get({
        queryArgs: { where: `lowercaseEmail="${email.toLowerCase()}"` }
      })
      .execute();
    return data?.body?.results[0] ?? {} as Customer;
  } catch (err: any) {
    return {
      statusCode: err.statusCode,
      body: JSON.stringify({ 'Message': err.message, data: err })
    };
  }

};
