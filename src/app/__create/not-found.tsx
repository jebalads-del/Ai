export default function CreateDefaultNotFoundPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '28px', color: '#111' }}>404 - Page Not Found</h1>
      <p style={{ color: '#666', marginTop: '10px' }}>The page you are looking for could not be found.</p>
      <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
        Return Home
      </a>
    </div>
  );
}
