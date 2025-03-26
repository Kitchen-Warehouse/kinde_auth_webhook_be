import { createUserCt } from "@customers/createUserCt";

export default async (request: Request, context: any): Promise<Response> => {

    try {
        const payload = await request.text();
        const customer = await createUserCt(payload) || {};

        return new Response(JSON.stringify(customer), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500, statusText: "Internal Server Error" });
    }
};