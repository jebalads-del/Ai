export default function CreateDefaultNotFoundPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Page Not Found</h2>
      <p>The requested page could not be found.</p>
      <a href="/" style={{ color: '#0066cc', textDecoration: 'underline' }}>Go Home</a>
    </div>
  );
}
