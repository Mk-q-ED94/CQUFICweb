/**
 * Cloudflare Worker — CQU FIC
 * 路由：
 *   GET  /api/posts                  公开：获取帖子列表
 *   GET  /api/comments               公开：获取指定帖子的已审核评论
 *   POST /api/submit-comment         公开：提交评论（含审核）
 *   POST /api/admin/login            管理员登录
 *   GET  /api/admin/comments         管理员：获取所有评论
 *   POST /api/admin/posts            管理员：新建帖子
 *   PUT  /api/admin/posts/:id        管理员：编辑帖子
 *   DELETE /api/admin/posts/:id      管理员：删除帖子
 *   PATCH  /api/admin/comments/:id   管理员：切换审核状态
 *   DELETE /api/admin/comments/:id   管理员：删除评论
 *
 * Secrets（wrangler secret put <NAME>）：
 *   ADMIN_PASSWORD  — 管理员登录密码
 *   ADMIN_SECRET    — HMAC 签名密钥（任意随机字符串）
 *   ALLOWED_ORIGIN  — https://cqufic.cn
 *   MAPBOX_TOKEN    — Mapbox public access token (pk.eyJ1Ij...)
 *
 * D1 数据库：
 *   wrangler d1 create cqufic-db
 *   wrangler d1 execute cqufic-db --file=setup-d1.sql
 */

const BLOCKED_WORDS = [
    '傻逼','傻B','沙比','煞笔','煞B','智障','废物','蠢货','白痴',
    '脑残','残废','畜生','狗东西','混蛋','王八蛋','杂种','贱人',
    '臭婊子','婊子','妓女','鸡巴','屌','操你','操你妈','操你全家',
    '妈的','他妈','你妈','草泥马','卧槽','我靠','日你','艹',
    '去死','死去','滚开','滚蛋',
    'fuck','f**k','fck','shit','sh1t','sht','bitch','b1tch',
    'asshole','ass hole','bastard','cunt','cock','dick','pussy',
    'motherfucker','whore','slut','retard','retarded','idiot','moron',
    'kill yourself','kys','go die','nigger','nigga','chink','gook',
    '加微信','加我微信','加QQ','加我QQ','加群','进群',
    '点击链接','点击这里','长按识别','扫描二维码',
    '免费领取','免费领','限时免费','限时优惠',
    '私聊','私信我','联系我','代购','代办','刷单','兼职招募',
    '法轮功','法轮大法','大法弟子','李洪志',
    '六四','天安门事件','坦克人',
    '藏独','台独','港独','疆独','达赖',
    '共产党倒台','推翻共产党','反党','颠覆政权',
    'uyghur genocide','tiananmen massacre','ccp collapse',
    'falun gong','falun dafa',
    '我要杀你','杀了你','弄死你','废了你',
    '报复社会','持刀','炸弹','爆炸物','bomb threat','i will kill',
];
const MAX_VIOLATIONS = 3;

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') return makeCors(null, 204, request, env);

        const url      = new URL(request.url);
        const pathname = url.pathname;
        const method   = request.method;
        const cors     = (data, status) => makeCors(data, status, request, env);

        /* ── 公开接口 ──────────────────────────────────── */
        if (method === 'GET' && pathname === '/api/posts') {
            return handleGetPosts(env, cors);
        }
        if (method === 'GET' && pathname === '/api/comments') {
            return handleGetComments(env, url, cors);
        }
        if (method === 'POST' && pathname === '/api/submit-comment') {
            return handleSubmitComment(request, env, cors);
        }
        if (method === 'POST' && pathname === '/api/admin/login') {
            return handleAdminLogin(request, env, cors);
        }

        /* ── 管理员接口 ────────────────────────────────── */
        if (pathname.startsWith('/api/admin/')) {
            const token = request.headers.get('X-Admin-Token');
            if (!await isValidToken(token, env.ADMIN_SECRET)) {
                return cors({ error: '未授权，请先登录' }, 401);
            }

            if (method === 'GET' && pathname === '/api/admin/comments') {
                return handleGetAllComments(env, url, cors);
            }
            if (method === 'POST' && pathname === '/api/admin/posts') {
                return handleCreatePost(request, env, cors);
            }
            if (method === 'PUT' && pathname.startsWith('/api/admin/posts/')) {
                return handleUpdatePost(request, env, decodeURIComponent(pathname.split('/').pop()), cors);
            }
            if (method === 'DELETE' && pathname.startsWith('/api/admin/posts/')) {
                return handleDeletePost(env, decodeURIComponent(pathname.split('/').pop()), cors);
            }
            if (method === 'PATCH' && pathname.startsWith('/api/admin/comments/')) {
                return handleToggleComment(request, env, pathname.split('/').pop(), cors);
            }
            if (method === 'DELETE' && pathname.startsWith('/api/admin/comments/')) {
                return handleDeleteComment(env, pathname.split('/').pop(), cors);
            }
        }

        /* ── 未知 /api/* 路由 ──────────────────────────── */
        if (pathname.startsWith('/api/')) {
            return cors({ error: '接口不存在' }, 404);
        }

        /* ── 静态文件：对 map.html 注入 Mapbox token ────── */
        const assetRes = await env.ASSETS.fetch(request);

        if ((pathname === '/map.html' || pathname === '/map') && env.MAPBOX_TOKEN) {
            const ct = assetRes.headers.get('content-type') || '';
            if (ct.includes('text/html')) {
                const html = await assetRes.text();
                const patched = html.replace("'YOUR_MAPBOX_TOKEN'", `'${env.MAPBOX_TOKEN}'`);
                const headers = new Headers(assetRes.headers);
                headers.delete('content-length');
                return new Response(patched, { status: assetRes.status, headers });
            }
        }

        return assetRes;
    },
};

/* ══════════════════════════════════════════════════════════
   公开接口
══════════════════════════════════════════════════════════ */
async function handleGetPosts(env, cors) {
    try {
        const { results } = await env.DB.prepare(
            'SELECT id, title, category, summary, date, is_pinned FROM posts ORDER BY is_pinned DESC, date DESC'
        ).all();
        return cors(results, 200);
    } catch (e) {
        return cors({ error: '获取失败' }, 500);
    }
}

async function handleGetComments(env, url, cors) {
    const postId = url.searchParams.get('post_id');
    if (!postId) return cors({ error: '缺少 post_id' }, 400);
    try {
        const { results } = await env.DB.prepare(
            'SELECT id, parent_id, nickname, content, created_at FROM comments WHERE post_id = ? AND is_approved = 1 ORDER BY created_at ASC'
        ).bind(postId).all();
        return cors(results, 200);
    } catch (e) {
        return cors({ error: '获取失败' }, 500);
    }
}

async function handleSubmitComment(request, env, cors) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const { post_id, parent_id, nickname, contact, content } = body;
    if (!post_id || !nickname?.trim() || !content?.trim()) {
        return cors({ error: '缺少必填字段' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // 检查封禁
    const violation = await env.DB.prepare(
        'SELECT count, banned FROM ip_violations WHERE ip = ?'
    ).bind(ip).first();
    if (violation?.banned) {
        return cors({ error: '您已因多次违规被限制留言功能' }, 403);
    }

    // 违禁词检测
    const contentLower = content.toLowerCase();
    const hitWord = BLOCKED_WORDS.find(w => contentLower.includes(w.toLowerCase()));
    if (hitWord) {
        await env.DB.prepare(
            'INSERT INTO blocked_comments (id, ip, post_id, nickname, content, reason) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(crypto.randomUUID(), ip, post_id, nickname.trim(), content.trim(), `命中关键词：${hitWord}`).run();

        const currentCount = violation ? (violation.count || 0) : 0;
        const newCount = currentCount + 1;
        const shouldBan = newCount >= MAX_VIOLATIONS;

        if (!violation) {
            await env.DB.prepare(
                'INSERT INTO ip_violations (ip, count, banned) VALUES (?, ?, ?)'
            ).bind(ip, 1, shouldBan ? 1 : 0).run();
        } else {
            await env.DB.prepare(
                'UPDATE ip_violations SET count = ?, banned = ?, last_at = datetime(\'now\') WHERE ip = ?'
            ).bind(newCount, shouldBan ? 1 : 0, ip).run();
        }

        if (shouldBan) return cors({ error: '您已因多次违规被限制留言功能' }, 403);
        return cors({
            error: `留言含有不当内容，请修改后重试（还有 ${MAX_VIOLATIONS - newCount} 次机会）`,
        }, 422);
    }

    try {
        await env.DB.prepare(
            'INSERT INTO comments (id, post_id, parent_id, nickname, contact, content, is_approved) VALUES (?, ?, ?, ?, ?, ?, 1)'
        ).bind(
            crypto.randomUUID(), post_id, parent_id || null,
            nickname.trim(), contact?.trim() || null, content.trim()
        ).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: '提交失败，请稍后重试' }, 500);
    }
}

/* ══════════════════════════════════════════════════════════
   管理员接口
══════════════════════════════════════════════════════════ */
async function handleAdminLogin(request, env, cors) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    if (body.password !== env.ADMIN_PASSWORD) {
        return cors({ error: '密码错误' }, 401);
    }
    const today = new Date().toISOString().slice(0, 10);
    const token = await hmacSign(env.ADMIN_SECRET, today);
    return cors({ token }, 200);
}

async function handleGetAllComments(env, url, cors) {
    const postId = url.searchParams.get('post_id');
    try {
        const sql = postId
            ? 'SELECT id, post_id, parent_id, nickname, contact, content, is_approved, created_at FROM comments WHERE post_id = ? ORDER BY created_at DESC'
            : 'SELECT id, post_id, parent_id, nickname, contact, content, is_approved, created_at FROM comments ORDER BY created_at DESC';
        const { results } = postId
            ? await env.DB.prepare(sql).bind(postId).all()
            : await env.DB.prepare(sql).all();
        return cors(results, 200);
    } catch (e) {
        return cors({ error: '获取失败' }, 500);
    }
}

async function handleCreatePost(request, env, cors) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const { id, title, category, summary, content, date } = body;
    if (!id || !title || !category || !summary || !content) {
        return cors({ error: '缺少必填字段' }, 400);
    }
    try {
        await env.DB.prepare(
            'INSERT INTO posts (id, title, category, summary, content, date) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
            id.trim(), title.trim(), category.trim(),
            summary.trim(), content.trim(),
            date || new Date().toISOString().slice(0, 10)
        ).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: `创建失败: ${e.message}` }, 500);
    }
}

async function handleUpdatePost(request, env, id, cors) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const allowed = ['title', 'category', 'summary', 'content', 'date', 'is_pinned'];
    const fields = allowed.filter(k => body[k] !== undefined);
    if (!fields.length) return cors({ error: '无有效字段' }, 400);

    const set = fields.map(k => `${k} = ?`).join(', ');
    const vals = fields.map(k => body[k]);
    try {
        await env.DB.prepare(`UPDATE posts SET ${set} WHERE id = ?`).bind(...vals, id).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: '更新失败' }, 500);
    }
}

async function handleDeletePost(env, id, cors) {
    try {
        await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: '删除失败' }, 500);
    }
}

async function handleToggleComment(request, env, id, cors) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }
    try {
        await env.DB.prepare('UPDATE comments SET is_approved = ? WHERE id = ?')
            .bind(body.is_approved ? 1 : 0, id).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: '操作失败' }, 500);
    }
}

async function handleDeleteComment(env, id, cors) {
    try {
        await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
        return cors({ success: true }, 200);
    } catch (e) {
        return cors({ error: '删除失败' }, 500);
    }
}

/* ══════════════════════════════════════════════════════════
   HMAC-SHA256 Token（每日过期）
══════════════════════════════════════════════════════════ */
async function hmacSign(secret, message) {
    const key = await crypto.subtle.importKey(
        'raw', new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function isValidToken(token, secret) {
    if (!token || !secret) return false;
    try {
        const today = new Date().toISOString().slice(0, 10);
        const expected = await hmacSign(secret, today);
        return token === expected;
    } catch { return false; }
}

/* ══════════════════════════════════════════════════════════
   CORS 响应工厂
══════════════════════════════════════════════════════════ */
function makeCors(data, status = 200, request, env) {
    const allowedOrigin = env?.ALLOWED_ORIGIN || '';
    const requestOrigin = request?.headers?.get('Origin') || '';
    const origin = allowedOrigin
        ? (requestOrigin === allowedOrigin ? allowedOrigin : 'null')
        : requestOrigin;
    return new Response(data ? JSON.stringify(data) : null, {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
            'Vary': 'Origin',
        },
    });
}
