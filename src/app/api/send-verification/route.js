export async function POST() {
  return Response.json({ error: 'استخدم إعادة إرسال التأكيد من صفحة الحساب' }, { status: 410 });
}
