export function UNSAFE_withComponentProps(Component) {
  return Component;
}

export default function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go Home</a>
    </div>
  );
}
