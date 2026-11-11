export function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] px-5 sm:px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 text-sm font-bold z-50 text-white ${toast.type === "error" ? "bg-red-600" : "bg-[#312E81]"}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${toast.type === "error" ? "bg-red-300" : "bg-green-400"}`}
      />
      {toast.msg}
    </div>
  );
}
