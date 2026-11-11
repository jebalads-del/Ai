import { UsersSearch } from "./UsersSearch";
import { UsersTable } from "./UsersTable";
import { UsersMobileCards } from "./UsersMobileCards";
import { Pagination } from "./Pagination";

export function UsersTab({
  users,
  loading,
  search,
  setSearch,
  page,
  setPage,
  pages,
  fetchUsers,
  deletingId,
  verifyingId,
  handleDelete,
  handleVerify,
  handleRemoveSub,
  onUpgrade,
  removingSubId,
}) {
  return (
    <div className="px-4 sm:px-7 pb-10 max-w-[1800px] mx-auto">
      <UsersSearch
        search={search}
        setSearch={setSearch}
        setPage={setPage}
        fetchUsers={fetchUsers}
      />
      <div className="bg-white rounded-2xl border border-violet-100/80 shadow-[0_12px_32px_rgba(49,46,129,0.06)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-sm">جاري التحميل...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex justify-center py-20 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p>لا يوجد مستخدمون</p>
            </div>
          </div>
        ) : (
          <>
            <UsersMobileCards
              users={users}
              deletingId={deletingId}
              verifyingId={verifyingId}
              handleDelete={handleDelete}
              handleVerify={handleVerify}
              handleRemoveSub={handleRemoveSub}
              onUpgrade={onUpgrade}
              removingSubId={removingSubId}
            />
            <UsersTable
              users={users}
              deletingId={deletingId}
              verifyingId={verifyingId}
              handleDelete={handleDelete}
              handleVerify={handleVerify}
              handleRemoveSub={handleRemoveSub}
              onUpgrade={onUpgrade}
              removingSubId={removingSubId}
            />
            {pages > 1 && (
              <Pagination page={page} pages={pages} setPage={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
