import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterOnline =
      searchParams.get("online") === "1" ||
      searchParams.get("online") === "true";
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
    let response;
    if (filterOnline) {
      try {
        response = await sql`SELECT * FROM drivers WHERE is_online = true`;
      } catch {
        response = await sql`SELECT * FROM drivers`;
      }
    } else {
      response = await sql`SELECT * FROM drivers`;
    }

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clerk_id,
      first_name,
      last_name,
      profile_image_url,
      car_image_url,
      car_seats,
      rating,
    } = body;

    if (!clerk_id || !first_name || !last_name) {
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
    const fallbackProfile =
      profile_image_url ||
      "https://placehold.co/96x96/png?text=Driver";
    const fallbackCar =
      car_image_url || "https://placehold.co/96x64/png?text=Taxi";

    const insert = await sql`
      INSERT INTO drivers (
        clerk_id,
        first_name,
        last_name,
        profile_image_url,
        car_image_url,
        car_seats,
        rating
      ) VALUES (
        ${clerk_id},
        ${first_name},
        ${last_name},
        ${fallbackProfile},
        ${fallbackCar},
        ${car_seats ?? 4},
        ${rating ?? 4.8}
      )
      ON CONFLICT (clerk_id) DO NOTHING
      RETURNING *;
    `;

    const driver =
      insert[0] ||
      (
        await sql`
          SELECT * FROM drivers
          WHERE clerk_id = ${clerk_id};
        `
      )[0];

    return new Response(JSON.stringify({ data: driver }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating driver:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { clerk_id, push_token, push_provider, is_online } = body;

    if (!clerk_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }
    if (
      push_token === undefined &&
      push_provider === undefined &&
      is_online === undefined
    ) {
      return new Response(
        JSON.stringify({ error: "No fields to update" }),
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
      UPDATE drivers
      SET push_token = COALESCE(${push_token}, push_token),
          push_provider = COALESCE(${push_provider}, push_provider),
          is_online = COALESCE(${is_online}, is_online)
      WHERE clerk_id = ${clerk_id}
      RETURNING *;
    `;

    if (!response.length) {
      return new Response(JSON.stringify({ error: "Driver not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: response[0] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating driver token:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
