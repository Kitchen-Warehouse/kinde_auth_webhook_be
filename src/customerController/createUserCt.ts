import { jwtDecode } from "jwt-decode";
import { getClient } from "@ctController/index";
import { prepareCTPayload } from "@utils/customerCreateMapper";
import { AccountRegisterBody, KindePayload } from "@projectTypes/index";

export const createUserCt = async (kindeToken: string) => {
  try {
    const kindePayload: any = jwtDecode(kindeToken);
        if (kindePayload?.type === "user.created"){
            const customerPayloadByKinde = await getCustomerPayloadByToken(kindePayload);
      const ctPayload = prepareCTPayload(customerPayloadByKinde, {});
      const accessToken = await getAccesstoken();
      const adminClient = await getClient();

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
      await updateKindePropertyValue({
        userId: kindePayload.data.user.id,
        kindeAccessToken: accessToken.access_token,
        customerId: customer.body.customer.id,
      });
      return {
        statusCode: customer.statusCode,
        body: customer.body,
      };
    } else {
            return {}
    }
  } catch (err) {
    return {
      statusCode: 500,
            body: err
  }
    }
}

const getCustomerPayloadByToken = async (kindePayload: KindePayload) => {
  try {
    const password = generatePassword(12);
    const data = kindePayload?.data?.user;
        const orgId = Deno.env.get("KWH_STG_ORG_ID");

    const customerPayload = {
      email: data?.email, //`satya${Date.now()}@gmail.com`
      firstName: data?.first_name,
      password: password,
      lastName: data?.last_name,
            organizationName: data?.organizations?.filter((org: any) => org.code === orgId)?.[0]?.code,
      phone: data?.phone,
      username: data?.username,
    }
    return customerPayload as AccountRegisterBody;
  } catch (err) {
    return {
      statusCode: 500,
            message: "Something went wrong while getting the customer payload",
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

export const getAccesstoken = async () => {
  try {
    const url = Deno.env.get('KINDE_URL');
    const client_id = Deno.env.get('KINDE_CLIENT_ID');
    const client_secret = Deno.env.get('KINDE_CLIENT_SECRET');
    const audience = Deno.env.get('KINDE_AUDIENCE_URL');
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
    console.log(err);
  }
};

export const updateKindePropertyValue = async ({
  userId,
  kindeAccessToken,
  customerId,
}: {
  userId: string;
  kindeAccessToken: string;
  customerId: string;
}) => {
  try {
    const url = Deno.env.get('KINDE_URL');

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
    console.log(err);
  }
};
