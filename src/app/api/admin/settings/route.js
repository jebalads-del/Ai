import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const settings = await sql`SELECT * FROM admin_settings`;
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.setting_key] = curr.setting_value;
      return acc;
    }, {});
    return Response.json(settingsMap);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    await sql`
      INSERT INTO admin_settings (setting_key, setting_value)
      VALUES (${key}, ${value})
      ON CONFLICT (setting_key) DO UPDATE SET setting_value = ${value}
    `;

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
