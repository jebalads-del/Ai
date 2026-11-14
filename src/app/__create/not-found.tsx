export default function CreateDefaultNotFoundPage() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '32px', color: '#333' }}>404 - Page Not Found</h1>
      <p style={{ color: '#666', marginTop: '10px' }}>The page you are looking for does not exist.</p>
      <a href="/" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
        Go Back Home
      </a>
    </div>
  );
}
