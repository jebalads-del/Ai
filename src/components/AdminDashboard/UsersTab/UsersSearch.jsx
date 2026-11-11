export function UsersSearch({ search, setSearch, setPage, fetchUsers }) {
  return (
    <div className="flex gap-2 sm:gap-3 mb-5">
      <input
        type="text"
        placeholder="ابحث بالاسم أو البريد..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="min-w-0 flex-1 bg-white border border-violet-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-sm transition-shadow"
      />
      <button
        onClick={fetchUsers}
        className="bg-gradient-to-l from-[#312E81] to-indigo-600 text-white px-4 sm:px-5 rounded-2xl text-sm font-bold hover:to-indigo-700 shadow-md shadow-indigo-200 transition-all"
      >
        بحث
      </button>
    </div>
  );
}
