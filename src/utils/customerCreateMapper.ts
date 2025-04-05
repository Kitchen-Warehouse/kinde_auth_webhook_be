import { CustomerDraft } from "@commercetools/platform-sdk";
import { AccountRegisterBody } from "@projectTypes/index";

export const prepareCTPayload = (customerData: AccountRegisterBody, customFields: any): CustomerDraft => {
    const accountRegisterBody = customerData || {} ;
    const customFieldsData = customFields ? { ...customFields, "phone": undefined } : {
        phone: undefined
    }
    const firstName = accountRegisterBody?.firstName
    const lastName = accountRegisterBody?.lastName;
    const organizationName = accountRegisterBody?.orgCode;
    const currentSiteKey = accountRegisterBody?.siteKey;

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
                "siteKey": [...customFieldsData.siteKey || '', `${organizationName}|${currentSiteKey}`],
            }
        }
    };
    return customer as CustomerDraft;
}