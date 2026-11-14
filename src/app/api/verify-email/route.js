export async function GET() {
  return Response.json({ error: 'استخدم رابط التأكيد الصادر من Supabase' }, { status: 410 });
}
