const expoPushUrl = "https://exp.host/--/api/v2/push/send";
const fcmPushUrl = "https://fcm.googleapis.com/fcm/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { push_token, push_provider, title, message, data } = body;

    if (!push_token || !push_provider || !title || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }

    if (push_provider === "expo") {
      const response = await fetch(expoPushUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: push_token,
          title,
          body: message,
          data,
        }),
      });

      const result = await response.json();
      return new Response(JSON.stringify({ data: result }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    if (push_provider === "fcm") {
      const serverKey = process.env.FCM_SERVER_KEY;
      if (!serverKey) {
        return new Response(
          JSON.stringify({ error: "FCM_SERVER_KEY no configurada" }),
          {
            status: 500,
            headers: { "content-type": "application/json" },
          },
        );
      }

      const response = await fetch(fcmPushUrl, {
        method: "POST",
        headers: {
          Authorization: `key=${serverKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: push_token,
          notification: {
            title,
            body: message,
          },
          data,
        }),
      });

      const result = await response.json();
      return new Response(JSON.stringify({ data: result }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid push provider" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
