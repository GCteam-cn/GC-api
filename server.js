const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.static(path.join(__dirname)));

const CACHE_TTL = 5 * 60 * 1000;
let cache = { data: null, timestamp: 0 };

app.get('/api/vtc-members', async (req, res) => {
  const now = Date.now();

  if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
    console.log('[Cache] 返回缓存数据');
    return res.json(cache.data);
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
    console.log('[TMP] 成员数：', memberCount);
    res.json(result);
  } catch (err) {
    console.error('[TMP] 请求失败：', err.message);

    if (cache.data) {
      console.log('[Cache] API 失败，返回过期缓存');
      return res.json({ ...cache.data, stale: true });
    }

    res.status(502).json({
      success: false,
      error: '无法获取 VTC 数据',
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});