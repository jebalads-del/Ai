export function UserAvatar({ name, email }) {
  const initial = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
      {initial}
    </div>
  );
}
