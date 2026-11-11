export function UnauthorizedAccess() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F5F4FB] font-tajawal px-4"
      dir="rtl"
    >
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-indigo-950/5 text-center max-w-sm border border-violet-100">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-3">وصول غير مصرح</h2>
        <a
          href="/dashboard"
          className="inline-block bg-gradient-to-l from-[#312E81] to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md shadow-indigo-200"
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
