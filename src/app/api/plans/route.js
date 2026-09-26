import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const plans = await sql`SELECT * FROM plans ORDER BY price ASC`;
    return Response.json(plans);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, price, tokens_limit, description } = await request.json();
    if (!name || price === undefined || !tokens_limit) {
      return Response.json({ error: "بيانات ناقصة" }, { status: 400 });
    }
    const result = await sql`
      INSERT INTO plans (name, price, tokens_limit, description)
      VALUES (${name}, ${Number(price)}, ${Number(tokens_limit)}, ${description || ""})
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, price, tokens_limit, description } = await request.json();
    if (!id) return Response.json({ error: "المعرف مطلوب" }, { status: 400 });
    const result = await sql`
      UPDATE plans SET
        name = ${name},
        price = ${Number(price)},
        tokens_limit = ${Number(tokens_limit)},
        description = ${description || ""}
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await sql`DELETE FROM plans WHERE id = ${id}`;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
