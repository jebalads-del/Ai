export async function GET(request) {
  const url = new URL('/account/signin', request.url);
  const error = new URL(request.url).searchParams.get('error');
  if (error) url.searchParams.set('error', error.slice(0, 80));
  return Response.redirect(url, 302);
}
