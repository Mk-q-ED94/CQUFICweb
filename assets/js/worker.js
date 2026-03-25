/**
 * Cloudflare Worker — CQU FIC
 * 路由：
 *   GET  /api/posts                  公开：获取帖子列表
 *   POST /api/submit-comment         公开：提交评论（含审核）
 *   POST /api/admin/login            管理员登录
 *   GET  /api/admin/comments         管理员：获取所有评论
 *   POST /api/admin/posts            管理员：新建帖子
 *   PUT  /api/admin/posts/:id        管理员：编辑帖子
 *   DELETE /api/admin/posts/:id      管理员：删除帖子
 *   PATCH  /api/admin/comments/:id   管理员：切换审核状态
 *   DELETE /api/admin/comments/:id   管理员：删除评论
 *
 * 环境变量（Worker → Settings → Variables and Secrets）：
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_PASSWORD   ← 你设置的管理员密码
 *   ADMIN_SECRET     ← 任意随机字符串，例如 "xK9mP2qR7vL4"
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
        if (request.method === 'OPTIONS') return cors(null, 204);

        const url      = new URL(request.url);
        const pathname = url.pathname;
        const method   = request.method;
        const sb       = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        /* ── 公开接口 ──────────────────────────────────── */
        if (method === 'GET' && pathname === '/api/posts') {
            return handleGetPosts(sb);
        }
        if (method === 'POST' && pathname === '/api/submit-comment') {
            return handleSubmitComment(request, env, sb);
        }
        if (method === 'POST' && pathname === '/api/admin/login') {
            return handleAdminLogin(request, env);
        }

        /* ── 管理员接口 ────────────────────────────────── */
        if (pathname.startsWith('/api/admin/')) {
            const token = request.headers.get('X-Admin-Token');
            if (!isValidToken(token, env.ADMIN_SECRET)) {
                return cors({ error: '未授权，请先登录' }, 401);
            }

            if (method === 'GET' && pathname === '/api/admin/comments') {
                return handleGetAllComments(sb, url);
            }
            if (method === 'POST' && pathname === '/api/admin/posts') {
                return handleCreatePost(request, sb);
            }
            if (method === 'PUT' && pathname.startsWith('/api/admin/posts/')) {
                return handleUpdatePost(request, sb, decodeURIComponent(pathname.split('/').pop()));
            }
            if (method === 'DELETE' && pathname.startsWith('/api/admin/posts/')) {
                return handleDeletePost(sb, decodeURIComponent(pathname.split('/').pop()));
            }
            if (method === 'PATCH' && pathname.startsWith('/api/admin/comments/')) {
                return handleToggleComment(request, sb, pathname.split('/').pop());
            }
            if (method === 'DELETE' && pathname.startsWith('/api/admin/comments/')) {
                return handleDeleteComment(sb, pathname.split('/').pop());
            }
        }

        return cors({ error: '接口不存在' }, 404);
    },
};

/* ══════════════════════════════════════════════════════════
   公开接口
══════════════════════════════════════════════════════════ */
async function handleGetPosts(sb) {
    const { data, error } = await sb.select(
        'posts',
        'select=id,title,category,summary,date,is_pinned&order=is_pinned.desc,date.desc'
    );
    if (error) return cors({ error: '获取失败' }, 500);
    return cors(data, 200);
}

async function handleSubmitComment(request, env, sb) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const { post_id, parent_id, nickname, contact, content } = body;
    if (!post_id || !nickname?.trim() || !content?.trim()) {
        return cors({ error: '缺少必填字段' }, 400);
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { data: vData } = await sb.select(
        'ip_violations', `ip=eq.${encodeURIComponent(ip)}&select=count,banned`
    );
    if (vData?.[0]?.banned) {
        return cors({ error: '您已因多次违规被限制留言功能' }, 403);
    }

    const contentLower = content.toLowerCase();
    const hitWord = BLOCKED_WORDS.find(w => contentLower.includes(w.toLowerCase()));
    if (hitWord) {
        await sb.insert('blocked_comments', {
            ip, post_id, nickname: nickname.trim(),
            content: content.trim(), reason: `命中关键词：${hitWord}`,
        });
        const currentCount = vData?.[0]?.count || 0;
        const newCount = currentCount + 1;
        const shouldBan = newCount >= MAX_VIOLATIONS;
        if (currentCount === 0) {
            await sb.insert('ip_violations', { ip, count: 1, banned: shouldBan });
        } else {
            await sb.patch('ip_violations', `ip=eq.${encodeURIComponent(ip)}`, {
                count: newCount, banned: shouldBan, last_at: new Date().toISOString(),
            });
        }
        if (shouldBan) return cors({ error: '您已因多次违规被限制留言功能' }, 403);
        return cors({
            error: `留言含有不当内容，请修改后重试（还有 ${MAX_VIOLATIONS - newCount} 次机会）`,
        }, 422);
    }

    const { error } = await sb.insert('comments', {
        post_id,
        parent_id: parent_id || null,
        nickname: nickname.trim(),
        contact: contact?.trim() || null,
        content: content.trim(),
        is_approved: true,
    });
    if (error) return cors({ error: '提交失败，请稍后重试' }, 500);
    return cors({ success: true }, 200);
}

/* ══════════════════════════════════════════════════════════
   管理员接口
══════════════════════════════════════════════════════════ */
async function handleAdminLogin(request, env) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    if (body.password !== env.ADMIN_PASSWORD) {
        return cors({ error: '密码错误' }, 401);
    }
    const today = new Date().toISOString().slice(0, 10);
    const token = btoa(`${env.ADMIN_SECRET}:${today}`);
    return cors({ token }, 200);
}

async function handleGetAllComments(sb, url) {
    const postId = url.searchParams.get('post_id');
    let query = 'select=id,post_id,parent_id,nickname,contact,content,is_approved,created_at&order=created_at.desc';
    if (postId) query += `&post_id=eq.${encodeURIComponent(postId)}`;
    const { data, error } = await sb.select('comments', query);
    if (error) return cors({ error: '获取失败' }, 500);
    return cors(data, 200);
}

async function handleCreatePost(request, sb) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const { id, title, category, summary, content, date } = body;
    if (!id || !title || !category || !summary || !content) {
        return cors({ error: '缺少必填字段' }, 400);
    }
    const { error } = await sb.insert('posts', {
        id: id.trim(), title: title.trim(), category: category.trim(),
        summary: summary.trim(), content: content.trim(),
        date: date || new Date().toISOString().slice(0, 10),
    });
    if (error) return cors({ error: `创建失败: ${error}` }, 500);
    return cors({ success: true }, 200);
}

async function handleUpdatePost(request, sb, id) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }

    const allowed = ['title', 'category', 'summary', 'content', 'date', 'is_pinned'];
    const updates = {};
    allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });

    const { error } = await sb.patch('posts', `id=eq.${encodeURIComponent(id)}`, updates);
    if (error) return cors({ error: '更新失败' }, 500);
    return cors({ success: true }, 200);
}

async function handleDeletePost(sb, id) {
    const { error } = await sb.delete('posts', `id=eq.${encodeURIComponent(id)}`);
    if (error) return cors({ error: '删除失败' }, 500);
    return cors({ success: true }, 200);
}

async function handleToggleComment(request, sb, id) {
    let body;
    try { body = await request.json(); }
    catch { return cors({ error: '请求格式错误' }, 400); }
    const { error } = await sb.patch('comments', `id=eq.${id}`, { is_approved: body.is_approved });
    if (error) return cors({ error: '操作失败' }, 500);
    return cors({ success: true }, 200);
}

async function handleDeleteComment(sb, id) {
    const { error } = await sb.delete('comments', `id=eq.${id}`);
    if (error) return cors({ error: '删除失败' }, 500);
    return cors({ success: true }, 200);
}

/* ══════════════════════════════════════════════════════════
   Token 验证（每日过期）
══════════════════════════════════════════════════════════ */
function isValidToken(token, secret) {
    if (!token || !secret) return false;
    try {
        const today = new Date().toISOString().slice(0, 10);
        return token === btoa(`${secret}:${today}`);
    } catch { return false; }
}

/* ══════════════════════════════════════════════════════════
   Supabase REST 客户端
══════════════════════════════════════════════════════════ */
function createClient(url, key) {
    const h = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
    };
    return {
        async select(table, query = '') {
            const res = await fetch(`${url}/rest/v1/${table}?${query}`, { headers: h });
            return { data: res.ok ? await res.json() : null, error: res.ok ? null : await res.text() };
        },
        async insert(table, body) {
            const res = await fetch(`${url}/rest/v1/${table}`, {
                method: 'POST', headers: { ...h, Prefer: 'return=minimal' },
                body: JSON.stringify(body),
            });
            return { error: res.ok ? null : await res.text() };
        },
        async patch(table, query, body) {
            const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
                method: 'PATCH', headers: { ...h, Prefer: 'return=minimal' },
                body: JSON.stringify(body),
            });
            return { error: res.ok ? null : await res.text() };
        },
        async delete(table, query) {
            const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
                method: 'DELETE', headers: { ...h, Prefer: 'return=minimal' },
            });
            return { error: res.ok ? null : await res.text() };
        },
    };
}

function cors(data, status = 200) {
    return new Response(data ? JSON.stringify(data) : null, {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
        },
    });
}
