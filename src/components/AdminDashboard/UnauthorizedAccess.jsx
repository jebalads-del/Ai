export function UnauthorizedAccess() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F0F2FF] font-tajawal"
      dir="rtl"
    >
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-3">وصول غير مصرح</h2>
        <a
          href="/dashboard"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm"
        >
          العودة
        </a>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }
      `}</style>
    </div>
  );
}
