export interface KindePayload {
    data?: {
        user?: {
            email?: string;
            first_name?: string;
            id?: string;
            is_password_reset_requested?: boolean;
            is_suspended?: boolean;
            last_name?: string;
            organizations?: KindeOrganization[];
            phone?: string;
            username?: string;
        };
    };
    event_id?: string;
    event_timestamp?: string;
    source?: string;
    timestamp?: string;
    type?: string;
}

interface KindeOrganization {
    code?: string;
    permissions?: string[];
    roles?: string[];
}

export interface AccountRegisterBody {
    email?: string;
    password?: string;
    salutation?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    storeKey?: string;
    isSubscribed?: boolean;
    orgCode?: string;
    siteKey?: string;
}

// Add more as required for versatility of Api
export interface ClientConfig {
    authUrl: string;
    clientId: string;
    clientSecret: string;
    hostUrl: string;
    projectKey: string;
    scopes: string[];
}

export interface ProjectConfiguration {
    CONFIG_ADMIN_CLIENT_ENGINE: string;
    CONFIG_ADMIN_CLIENT_ID: string;
    CONFIG_ADMIN_CLIENT_SECRET?: null;
    CONFIG_ADMIN_CLIENT_PROJECT_KEY: string;
    CONFIG_ADMIN_CLIENT_AUTH_URL: string;
    CONFIG_ADMIN_CLIENT_HOST_URL: string;
}
