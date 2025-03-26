import { createApiBuilderFromCtpClient } from "@commercetools/platform-sdk";
import { ClientBuilder, HttpMiddlewareOptions } from "@commercetools/sdk-client-v2";

const envVars = [
    "CTP_CLIENT_ID",
    "CTP_CLIENT_SECRET",
    "CTP_PROJECT_KEY",
    "CTP_API_URL",
    "CTP_AUTH_URL",
    "CTP_SCOPES"
];

const {
    CTP_CLIENT_ID,
    CTP_CLIENT_SECRET,
    CTP_PROJECT_KEY,
    CTP_API_URL,
    CTP_AUTH_URL,
    CTP_SCOPES
} = Object.fromEntries(envVars.map((key) => [key, Deno.env.get(key) ?? ""]));;

export const getClient = async () => {
    const projectKey = `${CTP_PROJECT_KEY}`;
    // Create a httpMiddleware for the your project AUTH URL
    const authMiddleware: any = {
        host: `${CTP_AUTH_URL}`,
        projectKey: `${CTP_PROJECT_KEY}`,
        credentials: {
            clientId: `${CTP_CLIENT_ID}`,
            clientSecret: `${CTP_CLIENT_SECRET}`,
        },
        scopes: [`${CTP_SCOPES}`],
        httpClient: fetch,
    };

    // Create a httpMiddleware for the your project API URL
    const httpMiddleware: HttpMiddlewareOptions = {
        host: `${CTP_API_URL}`,
    };

    const ctpClient = new ClientBuilder()
        .withProjectKey(projectKey) // .withProjectKey() is not required if the projectKey is included in authMiddlewareOptions
        .withClientCredentialsFlow(authMiddleware)
        .withHttpMiddleware(httpMiddleware)
        .withLoggerMiddleware() // Include middleware for logging
        .build();

    const apiRoot = createApiBuilderFromCtpClient(ctpClient)
        .withProjectKey({ projectKey: projectKey });
    return apiRoot;
}