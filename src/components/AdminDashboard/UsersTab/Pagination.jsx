export function Pagination({ page, pages, setPage }) {
  return (
    <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-50">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium disabled:opacity-40"
      >
        ← السابق
      </button>
      <span className="text-sm text-gray-500">
        صفحة {page} من {pages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(pages, p + 1))}
        disabled={page === pages}
        className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium disabled:opacity-40"
      >
        التالي →
      </button>
    </div>
  );
}
