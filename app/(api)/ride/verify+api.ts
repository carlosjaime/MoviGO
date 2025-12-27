import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ride_id, code } = body;

    if (!ride_id || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
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

    const existing = await sql`
      SELECT ride_id, verification_code
      FROM rides
      WHERE ride_id = ${ride_id};
    `;

    if (!existing.length) {
      return new Response(JSON.stringify({ error: "Ride not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    if (existing[0].verification_code !== String(code)) {
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const updated = await sql`
      UPDATE rides
      SET status = 'in_progress'
      WHERE ride_id = ${ride_id}
      RETURNING ride_id, status;
    `;

    return new Response(JSON.stringify({ data: updated[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error verifying ride code:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
