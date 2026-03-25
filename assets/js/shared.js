/* ============================================================
   shared.js — CQU FIC 统一脚本库
   维护说明：
   - 修改 NAV_ITEMS 即可更新全站导航菜单
   - 修改 FOOTER_CONFIG 即可更新全站页脚
   - 修改 SITE_CONFIG 即可更新全站基础信息
   ============================================================ */

(function () {
    'use strict';

    /* --------------------------------------------------------
       1. 全站配置 — 只需在此处修改，全站自动同步
    -------------------------------------------------------- */
    const SITE_CONFIG = {
        name:     '重庆大学新生服务融合中心平台',
        nameEn:   'Chong Qing University Freshman Integration Center',
        abbr:     'CQUFIC',
        logoSrc:  'assets/images/CQUS.svg',
        logoAlt:  '重庆大学校徽',
        homeUrl:  'index.html',
        easterEgg: 'easter-egg.html',
        year:      new Date().getFullYear(),
    };

    /* 导航菜单配置 */
    const NAV_ITEMS = [
        { label: '首页',   href: 'index.html' },
        {
            label: '功能',
            href:  '#features',
            children: [
                { label: '入学流程',   href: 'admission-process.html' },
                { label: '信息汇总库', href: 'info-library.html'      },
                { label: '超好用地图', href: 'map.html'               },
                { label: '仍在开发…', href: 'continued.html'          },
            ],
        },
        { label: '论坛',   href: '#forum'  },
        {
            label: '反馈',
            href:  '#feedback',
            children: [
                { label: '问题反馈', href: 'problem-feedback.html' },
                { label: '功能建议', href: 'fs.html'               },
                { label: '体验评价', href: 'ty.html'               },
            ],
        },
        { label: '关于',   href: '#about' },
    ];

    /* 页脚配置 */
    const FOOTER_CONFIG = {
        columns: [
            {
                title: 'CQU FIC',
                links: [
                    { label: '首页',     href: 'index.html'   },
                    { label: '功能',     href: '#features'    },
                    { label: '论坛',     href: '#forum'       },
                    { label: '反馈',     href: '#feedback'    },
                ],
            },
            {
                title: '资源',
                links: [
                    { label: '入学流程',   href: 'admission-process.html' },
                    { label: '信息汇总库', href: 'info-library.html'      },
                    { label: '校园地图',   href: 'map.html'               },
                    { label: '更多功能',   href: 'continued.html'         },
                ],
            },
            {
                title: '支持',
                links: [
                    { label: '问题反馈', href: 'problem-feedback.html' },
                    { label: '功能建议', href: 'fs.html'               },
                    { label: '体验评价', href: 'ty.html'               },
                    { label: '关于我们', href: '#about'                },
                ],
            },
            {
                title: '关注我们',
                links: [
                    { label: '微信公众号', href: '#', icon: 'fab fa-weixin'   },
                    { label: 'QQ群',       href: '#', icon: 'fab fa-qq'       },
                    { label: '微博',       href: '#', icon: 'fab fa-weibo'    },
                    { label: '邮箱',       href: '#', icon: 'fas fa-envelope' },
                ],
            },
        ],
    };

    /* --------------------------------------------------------
       2. 工具函数
    -------------------------------------------------------- */

    /** 获取当前页面文件名 */
    function currentPage() {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    }

    /** 构建 HTML 字符串（避免 XSS，属性值通过函数传入） */
    function el(tag, attrs, ...children) {
        const attrStr = Object.entries(attrs || {})
            .map(([k, v]) => v != null ? ` ${k}="${v}"` : '')
            .join('');
        return `<${tag}${attrStr}>${children.join('')}</${tag}>`;
    }

    /* --------------------------------------------------------
       3. 构建导航 HTML
    -------------------------------------------------------- */
    function buildNav(showFull) {
        if (!showFull) {
            // 子页面：简化导航，只显示返回首页
            return `
              <ul class="nav-links" id="navLinks">
                <li><a href="${SITE_CONFIG.homeUrl}" class="nav-link">← 返回首页</a></li>
              </ul>`;
        }

        const page = currentPage();
        const items = NAV_ITEMS.map(item => {
            const isActive = item.href === page ? ' active-page' : '';
            if (item.children) {
                const sub = item.children.map(c =>
                    `<a href="${c.href}" class="dropdown-item">${c.label}</a>`
                ).join('');
                return `
                  <li class="dropdown">
                    <a href="${item.href}" class="nav-link${isActive}">${item.label}</a>
                    <div class="dropdown-content">${sub}</div>
                  </li>`;
            }
            return `<li><a href="${item.href}" class="nav-link${isActive}">${item.label}</a></li>`;
        }).join('');

        return `<ul class="nav-links" id="navLinks">${items}</ul>`;
    }

    /* --------------------------------------------------------
       4. 注入 Header
    -------------------------------------------------------- */
    function injectHeader(showFullNav) {
        // 如果页面已有 header，不重复注入
        if (document.getElementById('cqu-header')) return;

        const logoSubText = showFullNav ? SITE_CONFIG.nameEn : 'Back to Home';

        const easterEggBtn = showFullNav
            ? `<div class="nav-center">
                 <div class="school-badge" id="easterEggTrigger" title="（点击5次试试）">
                   <img src="${SITE_CONFIG.logoSrc}" alt="${SITE_CONFIG.logoAlt}" class="school-logo">
                 </div>
               </div>`
            : '';

        const header = document.createElement('header');
        header.id = 'cqu-header';
        header.innerHTML = `
          <div class="nav-container">
            <a href="${SITE_CONFIG.homeUrl}" class="logo">
              <div class="logo-icon">${SITE_CONFIG.abbr}</div>
              <div class="logo-text">
                <div class="logo-main">${SITE_CONFIG.name}</div>
                <div class="logo-sub">${logoSubText}</div>
              </div>
            </a>
            ${easterEggBtn}
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="菜单">
              <span></span><span></span><span></span>
            </button>
            ${buildNav(showFullNav)}
          </div>`;

        document.body.prepend(header);
    }

    /* --------------------------------------------------------
       5. 注入 Footer（只在首页显示完整页脚）
    -------------------------------------------------------- */
    function injectFooter() {
        if (document.getElementById('cqu-footer')) return;
        if (document.querySelector('footer')) return; // 页面已有 footer

        const columns = FOOTER_CONFIG.columns.map(col => {
            const links = col.links.map(link => {
                const icon = link.icon ? `<i class="${link.icon}"></i> ` : '';
                return `<li><a href="${link.href}">${icon}${link.label}</a></li>`;
            }).join('');
            return `
              <div class="footer-column">
                <h3>${col.title}</h3>
                <ul class="footer-links">${links}</ul>
              </div>`;
        }).join('');

        const footer = document.createElement('footer');
        footer.id = 'cqu-footer';
        footer.innerHTML = `
          <div class="container">
            <div class="footer-content">${columns}</div>
            <div class="copyright">
              <p>&copy; ${SITE_CONFIG.year} ${SITE_CONFIG.name} (CQU FIC). 保留所有权利.</p>
            </div>
          </div>`;

        document.body.appendChild(footer);
    }

    /* --------------------------------------------------------
       6. 公共行为：滚动、移动菜单、彩蛋、卡片动画
    -------------------------------------------------------- */
    function initScrollBehavior() {
        const header = document.getElementById('cqu-header');
        if (!header) return;

        let isScrolling = false;
        let scrollTimer;

        window.addEventListener('scroll', () => {
            // Header 毛玻璃增强
            header.classList.toggle('scrolled', window.scrollY > 50);

            // 功能卡片入场动画
            document.querySelectorAll('.feature-card').forEach(card => {
                if (card.getBoundingClientRect().top < window.innerHeight - 100) {
                    card.classList.add('visible');
                }
            });

            // 页面轻微缩放感
            if (!isScrolling) {
                document.querySelectorAll('section').forEach(s => s.style.transform = 'scale(0.98)');
                isScrolling = true;
            }
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                document.querySelectorAll('section').forEach(s => s.style.transform = 'scale(1)');
                isScrolling = false;
            }, 100);
        });

        // 初始触发一次
        window.dispatchEvent(new Event('scroll'));
    }

    function initMobileMenu() {
        const toggle  = document.getElementById('mobileMenuToggle');
        const navList = document.getElementById('navLinks');
        if (!toggle || !navList) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            navList.classList.toggle('active');
        });

        // 点击导航项后关闭菜单
        navList.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                navList.classList.remove('active');
            });
        });
    }

    function initEasterEgg() {
        const trigger = document.getElementById('easterEggTrigger');
        if (!trigger) return;

        let count = 0;
        let timer;

        trigger.addEventListener('click', () => {
            count++;
            clearTimeout(timer);
            timer = setTimeout(() => { count = 0; }, 2000);
            if (count >= 5) {
                count = 0;
                window.location.href = SITE_CONFIG.easterEgg;
            }
        });
    }

    function initCardAnimations() {
        // 对已在视口内的卡片立即显示
        document.querySelectorAll('.feature-card').forEach(card => {
            if (card.getBoundingClientRect().top < window.innerHeight - 100) {
                card.classList.add('visible');
            }
        });
    }

    /* --------------------------------------------------------
       7. 页面特殊配置（个别页面覆盖默认行为）
    -------------------------------------------------------- */
    const PAGE_OVERRIDES = {
        'talking.html': {
            logoMain: '包罗万象社区',
            logoSub:  'All-Encompassing Community',
            navItems: [
                { label: '← 返回首页', href: SITE_CONFIG.homeUrl },
                { label: '帖子',       href: '#posts' },
                { label: '社区规则',   href: '#rules' },
            ],
        },
    };

    function buildCustomNav(items) {
        const itemsHtml = items.map(item =>
            `<li><a href="${item.href}" class="nav-link">${item.label}</a></li>`
        ).join('');
        return `<ul class="nav-links" id="navLinks">${itemsHtml}</ul>`;
    }

    function injectHeaderWithOverride(page) {
        if (document.getElementById('cqu-header')) return;

        const override   = PAGE_OVERRIDES[page];
        const logoMain   = override ? override.logoMain   : SITE_CONFIG.name;
        const logoSub    = override ? override.logoSub    : SITE_CONFIG.nameEn;
        const isHome     = (page === 'index.html' || page === '');
        const navHtml    = override
            ? buildCustomNav(override.navItems)
            : buildNav(isHome);
        const badgeHtml  = isHome
            ? `<div class="nav-center">
                 <div class="school-badge" id="easterEggTrigger" title="（点击5次试试）">
                   <img src="${SITE_CONFIG.logoSrc}" alt="${SITE_CONFIG.logoAlt}" class="school-logo">
                 </div>
               </div>`
            : '';

        const header = document.createElement('header');
        header.id = 'cqu-header';
        header.innerHTML = `
          <div class="nav-container">
            <a href="${SITE_CONFIG.homeUrl}" class="logo">
              <div class="logo-icon">${SITE_CONFIG.abbr}</div>
              <div class="logo-text">
                <div class="logo-main">${logoMain}</div>
                <div class="logo-sub">${logoSub}</div>
              </div>
            </a>
            ${badgeHtml}
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="菜单">
              <span></span><span></span><span></span>
            </button>
            ${navHtml}
          </div>`;

        document.body.prepend(header);
    }

    /* --------------------------------------------------------
       8. 入口：根据页面类型决定注入策略
    -------------------------------------------------------- */
    function init() {
        const page = currentPage();

        // 这些页面有完全自定义的设计，不注入共享组件
        const standalonePages = ['map.html', '地图开发者.html', 'easter-egg.html'];
        if (standalonePages.includes(page)) return;

        const isHome = (page === 'index.html' || page === '');

        injectHeaderWithOverride(page);

        if (isHome) {
            injectFooter();
        }

        initScrollBehavior();
        initMobileMenu();
        initEasterEgg();
        initCardAnimations();
    }

    // DOM 就绪后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
