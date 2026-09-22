export async function onRequest(context) {
  const { request } = context;

  // CORS 头，允许你的 GitHub Pages 前端跨域访问
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=UTF-8',
  };

  // 处理浏览器的预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  try {
    // 请求 TruckersMP API
    const res = await fetch('https://api.truckersmp.com/v2/vtc/86009', {
      headers: { 'User-Agent': 'ChinaGC-Team-Website/1.0' },
    });

    if (!res.ok) {
      throw new Error(`TMP API 返回 HTTP ${res.status}`);
    }

    const json = await res.json();
    const memberCount = (json.response && json.response.members_count) || 0;

    // 返回标准化响应
    return new Response(JSON.stringify({
      success: true,
      memberCount: memberCount,
      vtcId: '86009',
      fetchedAt: new Date().toISOString(),
    }), { status: 200, headers });
  } catch (err) {
    // 错误处理
    return new Response(JSON.stringify({
      success: false,
      error: '无法获取 VTC 数据',
      detail: err.message,
    }), { status: 502, headers });
  }
}
