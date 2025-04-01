import { createUserCt } from "@customers/createUserCt";
import { KindePayload } from "@projectTypes/index";
import { jwtDecode } from "jwt-decode";

export default async (request: Request, context: any): Promise<Response> => {

    try {
        const payload = await request.text();
        const kindePayload: KindePayload = jwtDecode(payload);
        if (kindePayload?.type === "user.created") {
            const customer = await createUserCt(payload) || {};

            return new Response(JSON.stringify(customer), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            });
        } else {
            return new Response(JSON.stringify({ error: "Invalid event type" }), { status: 400, statusText: "Invalid Event type" });
        }
    } catch (error) {
        return new Response(JSON.stringify(error), { status: 500, statusText: "Internal Server Error" });
    }
};