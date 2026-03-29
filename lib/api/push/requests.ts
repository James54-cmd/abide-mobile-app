import { apiRequest } from "@/lib/api";

export async function postPushToken(jwt: string, pushToken: string): Promise<void> {
  await apiRequest<void>(
    "/api/push-token",
    {
      method: "POST",
      body: JSON.stringify({ pushToken })
    },
    jwt
  );
}
