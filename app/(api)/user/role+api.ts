import { neon } from "@neondatabase/serverless";

const allowedRoles = new Set(["client", "driver"]);

const getSqlClient = () => {
  let url = process.env.DATABASE_URL || "";
  if (!/^postgres(ql)?:\/\//.test(url)) {
    return null;
  }
  if (!url.includes("sslmode=")) {
    url = url.includes("?") ? `${url}&sslmode=require` : `${url}?sslmode=require`;
  }
  return neon(url);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clerkId = searchParams.get("clerk_id");

  if (!clerkId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const sql = getSqlClient();
  if (!sql) {
    return new Response(
      JSON.stringify({ error: "DATABASE_URL inválida o no configurada" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }

  try {
    const response = await sql`
      SELECT role
      FROM users
      WHERE clerk_id = ${clerkId};
    `;

    if (!response.length) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, role } = body;

    if (!clerk_id || !role || !allowedRoles.has(role)) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid fields" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const sql = getSqlClient();
    if (!sql) {
      return new Response(
        JSON.stringify({ error: "DATABASE_URL inválida o no configurada" }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        },
      );
    }

    const response = await sql`
      UPDATE users
      SET role = ${role}
      WHERE clerk_id = ${clerk_id}
      RETURNING role;
    `;

    if (!response.length) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
