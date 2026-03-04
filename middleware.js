import { NextResponse } from '@vercel/edge';

export default async function middleware(request) {
  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    return response;
  }

  let html = await response.text();

  const gaScript = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-3PSD4SKHVM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-3PSD4SKHVM');
</script>`;

  html = html.replace('</head>', gaScript + '\n</head>');

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\.(?:css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)).*)',
};
