import { CustomerDraft, StoreResourceIdentifier } from "@commercetools/platform-sdk";
import { AccountRegisterBody } from "@projectTypes/index";

export const prepareCTPayload = (customerData: AccountRegisterBody, customFields: any, stores: StoreResourceIdentifier[] = [], isKwh: boolean): CustomerDraft => {
    const accountRegisterBody = customerData || {} ;
    const customFieldsData = customFields ? { ...customFields, "phone": undefined } : {
        phone: undefined
    }
    const firstName = accountRegisterBody?.firstName
    const lastName = accountRegisterBody?.lastName;
    const organizationName = accountRegisterBody?.orgCode;
    const currentSiteKey = accountRegisterBody?.siteKey;
    const storesDraft = [...stores,
    {
        "typeId": "store",
        "key": isKwh ? "kwh" : "kwss"
    }
    ];
    const uniqueStores = Array.from(
        new Map(storesDraft.map(store => [store.key, store])).values()
    );
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
                "siteKey": [...customFieldsData.siteKey ?? '', `${organizationName}|${currentSiteKey}`],
            }
        },
        stores: uniqueStores
    };
    console.log("CUSTOMER", customer);
    return customer as CustomerDraft;
}