import { CustomerDraft } from "@commercetools/platform-sdk";

export const prepareCTPayload = (customerData: any, customFields: any): CustomerDraft => {
    const accountRegisterBody = customerData || {};
    const customFieldsData = customFields ? { ...customFields, "phone": undefined } : {
        phone: undefined
    }
    const firstName = accountRegisterBody?.firstName
    const lastName = accountRegisterBody?.lastName;
    const organizationName = accountRegisterBody?.organizationName;
    const siteKey = Deno.env.get("KWH_SITE_KEY") ?? 'kitchenwarehouse';
    const customer = {
        email: accountRegisterBody?.email,
        password: accountRegisterBody?.password,
        salutation: accountRegisterBody?.salutation ?? "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        dateOfBirth: accountRegisterBody?.dateOfBirth ?? null,
        addresses: [],
        isEmailVerified: true,
        custom: {
            type: {
                key: "customerCustomFields",
                typeId: "type"
            }, fields: {
                ...customFieldsData,
                "siteKey": [`${organizationName}|${siteKey}`],
            }
        }
    };
    return customer as CustomerDraft;
}