const fetch = require('node-fetch');

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = Date.now();

  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    return res.status(200).json({ ...cache.data, cached: true });
  }

  try {
    const response = await fetch('https://api.truckersmp.com/v2/vtc/86009', {
      headers: {
        'User-Agent': 'ChinaGC-Team-Website/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`TMP API 返回 HTTP ${response.status}`);
    }

    const json = await response.json();

    if (json.error) {
      throw new Error(json.descriptor || 'TMP API 业务错误');
    }

    const memberCount = (json.response && json.response.members_count) || 0;

    const result = {
      success: true,
      memberCount: memberCount,
      vtcId: '86009',
      fetchedAt: new Date().toISOString(),
    };

    cache = { data: result, timestamp: now };
    res.status(200).json(result);
  } catch (err) {
    console.error('[TMP] 请求失败：', err.message);

    if (cache.data) {
      return res.status(200).json({ ...cache.data, stale: true });
    }

    res.status(502).json({
      success: false,
      error: '无法获取 VTC 数据',
      detail: err.message,
    });
  }
};
