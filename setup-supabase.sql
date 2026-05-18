-- ============================================================
-- CQU FIC 论坛 — Supabase 数据库初始化脚本
-- 在 Supabase 后台 → SQL Editor → 粘贴运行
-- ============================================================

-- ── 帖子表 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
    id          TEXT        PRIMARY KEY,
    title       TEXT        NOT NULL,
    category    TEXT        NOT NULL,
    summary     TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    date        DATE        NOT NULL DEFAULT CURRENT_DATE,
    is_pinned   BOOLEAN     NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_date     ON posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned   ON posts (is_pinned DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 任何人可读帖子
CREATE POLICY "public can read posts"
    ON posts FOR SELECT
    USING (true);

-- ── 评论表 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     TEXT        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id   UUID        REFERENCES comments(id) ON DELETE CASCADE,
    nickname    TEXT        NOT NULL,
    contact     TEXT,                               -- 仅后台可见
    content     TEXT        NOT NULL,
    is_approved BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id   ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments (parent_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 游客可读已审核评论
CREATE POLICY "public can read approved comments"
    ON comments FOR SELECT
    USING (is_approved = true);

-- 游客可提交评论（由 Worker 写入，使用 service role key 绕过 RLS）
CREATE POLICY "public can insert comments"
    ON comments FOR INSERT
    WITH CHECK (true);

-- ── IP 违规记录表 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ip_violations (
    ip          TEXT        PRIMARY KEY,
    count       INTEGER     NOT NULL DEFAULT 0,
    banned      BOOLEAN     NOT NULL DEFAULT false,
    last_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ip_violations ENABLE ROW LEVEL SECURITY;
-- 该表仅由 Worker（service role key）访问，不对外暴露

-- ── 被拦截评论存档表 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_comments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ip          TEXT        NOT NULL,
    post_id     TEXT        NOT NULL,
    nickname    TEXT        NOT NULL,
    content     TEXT        NOT NULL,
    reason      TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ip ON blocked_comments (ip);

ALTER TABLE blocked_comments ENABLE ROW LEVEL SECURITY;
-- 该表仅由 Worker（service role key）访问，不对外暴露

-- ── 验证 ──────────────────────────────────────────────────
-- 运行后执行以下语句确认所有表已创建：
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
