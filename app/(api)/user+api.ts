import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
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
    const { name, email, clerkId, role } = await request.json();

    if (!name || !email || !clerkId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id,
        role
      ) 
      VALUES (
        ${name}, 
        ${email},
        ${clerkId},
        ${role || "client"}
     );`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
