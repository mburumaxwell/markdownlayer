import feed from '@/lib/feed';

export async function GET(req: Request) {
  return new Response(feed.atom1(), {
    status: 200,
    headers: {
      'content-type': 'application/atom+xml',
      'cache-control': 's-maxage=31556952',
    },
  });
}
