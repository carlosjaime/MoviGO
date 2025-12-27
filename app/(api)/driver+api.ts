import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
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
    const response = await sql`SELECT * FROM drivers`;

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
