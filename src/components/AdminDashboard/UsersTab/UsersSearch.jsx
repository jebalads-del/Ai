export function UsersSearch({ search, setSearch, setPage, fetchUsers }) {
  return (
    <div className="flex gap-3 mb-5">
      <input
        type="text"
        placeholder="ابحث بالاسم أو البريد..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
      />
      <button
        onClick={fetchUsers}
        className="bg-indigo-600 text-white px-5 rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-md"
      >
        بحث
      </button>
    </div>
  );
}
