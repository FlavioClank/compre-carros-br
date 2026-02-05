export const config = { runtime: "edge" };

export default async function handler(_req: Request) {
  return new Response(JSON.stringify({ ok: true, where: "vercel edge" }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
