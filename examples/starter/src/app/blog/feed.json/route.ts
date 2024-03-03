import feed from '@/lib/feed';

export async function GET(req: Request) {
  return new Response(feed.json1(), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=31556952',
    },
  });
}
