export default {
  async fetch(request, env) {
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Mümin Pusulası Web Sitesi", { status: 200 });
  },
};
