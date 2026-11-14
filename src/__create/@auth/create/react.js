export function useSession() {
  return { data: null, status: "unauthenticated" };
}
export function SessionProvider({ children }) {
  return children;
}
