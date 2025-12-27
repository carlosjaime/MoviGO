import { neon } from "@neondatabase/serverless";

const allowedStatuses = new Set([
  "driver_en_route",
  "arrived",
  "in_progress",
  "completed",
]);

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ride_id, status } = body;

    if (!ride_id || !status || !allowedStatuses.has(status)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid fields" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }

    let url = process.env.DATABASE_URL || "";
    if (!/^postgres(ql)?:\/\//.test(url)) {
      return new Response(
        JSON.stringify({ error: "DATABASE_URL inválida o no configurada" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }
    if (!url.includes("sslmode=")) {
      url = url.includes("?")
        ? `${url}&sslmode=require`
        : `${url}?sslmode=require`;
    }
    const sql = neon(url);

    const response = await sql`
      UPDATE rides
      SET status = ${status}
      WHERE ride_id = ${ride_id}
      RETURNING ride_id, status;
    `;

    if (!response.length) {
      return new Response(JSON.stringify({ error: "Ride not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
