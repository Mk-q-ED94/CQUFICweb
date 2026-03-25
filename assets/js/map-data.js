/**
 * CQU FIC — map-data.js
 * ======================
 * 地图数据层：校区边界 + 地标数据
 *
 * 与 map.html 的渲染逻辑完全解耦。
 * 新增/修改地标只需改此文件，无需触碰地图逻辑代码。
 *
 * 数据格式说明
 * ─────────────
 * RAW_BOUNDARIES  每个校区的边界多边形，[lng, lat] 数组
 * CAMPUS_DATA     每个校区的基础信息 + 地标列表
 *
 * 地标字段：
 *   name   显示名称
 *   type   分类 key（对应 filter chips）
 *   lng    经度
 *   lat    纬度
 *   desc   卡片副标题
 *   class  图标背景色 CSS 类
 *   icon   emoji 图标
 *
 * 分类 type 与 CSS class 对照表：
 *   landmark → c-main    （地标，红橙渐变）
 *   library  → c-library （图书馆，CQU蓝）
 *   gate     → c-gate    （校门，深灰）
 *   teach    → c-teach   （教学楼，金黄）
 *   lab      → c-lab     （实验楼，紫蓝）
 *   college  → c-college （学院，青绿）
 *   food     → c-food    （食堂，绿）
 *   sport    → c-sport   （运动，青蓝）
 *   life     → c-life    （生活，紫）
 * =====================================================
 */

/* eslint-disable */

// ── 校区边界多边形 ─────────────────────────────────────
const RAW_BOUNDARIES = {
  'A': [
    [106.46268,29.57373],[106.46026,29.57292],[106.45816,29.57264],
    [106.45946,29.57021],[106.45964,29.56862],[106.45888,29.56698],
    [106.4583, 29.56594],[106.45837,29.56464],[106.46337,29.56406],
    [106.46628,29.56243],[106.46785,29.56297],[106.46835,29.56422],
    [106.46956,29.56313],[106.47141,29.56432],[106.47076,29.56634],
    [106.4674, 29.56947]
  ],
  'B': [
    [106.45014,29.56823],[106.45053,29.5701], [106.45032,29.57163],
    [106.45151,29.57317],[106.45094,29.5694], [106.45161,29.56905],
    [106.45338,29.57108],[106.45646,29.57216],[106.45831,29.57177],
    [106.4594, 29.57004],[106.45934,29.56786],[106.45619,29.56775],
    [106.45603,29.56673],[106.45488,29.56671],[106.45263,29.56744],
    [106.45134,29.56765]
  ],
  'C': [
    [106.44861,29.56429],[106.44807,29.56364],[106.44744,29.56266],
    [106.4481, 29.56212],[106.44839,29.56133],[106.44882,29.56072],
    [106.45038,29.56048],[106.45123,29.56067],[106.45063,29.56179],
    [106.45192,29.56308],[106.45103,29.56388],[106.44998,29.56401],
    [106.44944,29.56442],[106.44896,29.56451],[106.44879,29.5644],
    [106.44871,29.56434]
  ],
  'HUXI': [
    [106.28364,29.60115],[106.2831, 29.59845],[106.28881,29.59842],
    [106.28788,29.59519],[106.28806,29.59125],[106.2882, 29.5891],
    [106.2913, 29.58824],[106.29533,29.58941],[106.29798,29.59351],
    [106.29922,29.59331],[106.3032, 29.59584],[106.30312,29.59881],
    [106.30325,29.60105],[106.2974, 29.60114],[106.28999,29.60111],
    [106.28664,29.60114]
  ],
  'LIANGJIANG': [
    [106.80246,29.74256],[106.80402,29.74354],[106.80465,29.74378],
    [106.80513,29.74309],[106.8056, 29.74245],[106.80709,29.74332],
    [106.80763,29.74256],[106.80621,29.74171],[106.80616,29.74058],
    [106.80571,29.7402], [106.80491,29.74027],[106.8046, 29.74054],
    [106.80459,29.74109],[106.80425,29.7414], [106.80328,29.74096],
    [106.80275,29.74189]
  ]
};

// ── 校区数据 ───────────────────────────────────────────
const CAMPUS_DATA = {

  'A': {
    name: 'A区', badge: 'badge-A',
    locations: [

      // ── 地标 ───────────────────────────────────────
      { name: '主教学楼', type: 'landmark', lng: 106.46669, lat: 29.56846, desc: '地标', class: 'c-main', icon: '🏛️' },
      { name: '钟塔', type: 'landmark', lng: 106.46335, lat: 29.56993, desc: '地标', class: 'c-main', icon: '🕰️' },
      { name: '民主湖', type: 'landmark', lng: 106.46592, lat: 29.56620, desc: '地标', class: 'c-main', icon: '🌊' },
      { name: '菜鸟驿站', type: 'life', lng: 106.46416, lat: 29.56516, desc: '生活', class: 'c-life', icon: '📦' },

      // ── 图书馆 ─────────────────────────────────────
      { name: '图书馆', type: 'library', lng: 106.46453, lat: 29.56792, desc: '地标', class: 'c-library', icon: '📖' },
      { name: '民主湖学术报告厅', type: 'library', lng: 106.46664, lat: 29.56676, desc: '地标', class: 'c-library', icon: '🎓' },

      // ── 校门 ───────────────────────────────────────
      { name: '西北门', type: 'gate', lng: 106.46109, lat: 29.57314, desc: '大门', class: 'c-gate', icon: '🚪' },
      { name: '正门', type: 'gate', lng: 106.45993, lat: 29.56995, desc: '大门', class: 'c-gate', icon: '🏛️' },
      { name: '中门', type: 'gate', lng: 106.46300, lat: 29.56421, desc: '大门', class: 'c-gate', icon: '🚪' },
      { name: '南一门', type: 'gate', lng: 106.46612, lat: 29.56246, desc: '大门', class: 'c-gate', icon: '🚪' },
      { name: '柏树林门', type: 'gate', lng: 106.46860, lat: 29.56491, desc: '大门', class: 'c-gate', icon: '🚪' },
      { name: '松林坡门', type: 'gate', lng: 106.46859, lat: 29.56602, desc: '大门', class: 'c-gate', icon: '🚪' },

      // ── 教学楼 ─────────────────────────────────────
      { name: '第一教学楼', type: 'teach', lng: 106.46474, lat: 29.57053, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第二教学楼', type: 'teach', lng: 106.46362, lat: 29.57200, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第三教学楼', type: 'teach', lng: 106.46268, lat: 29.57111, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第四教学楼', type: 'teach', lng: 106.46156, lat: 29.57124, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第五教学楼', type: 'teach', lng: 106.46294, lat: 29.56892, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第六教学楼', type: 'teach', lng: 106.46222, lat: 29.56724, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第七教学楼', type: 'teach', lng: 106.46394, lat: 29.57132, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第八教学楼', type: 'teach', lng: 106.46164, lat: 29.56897, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '第九教学楼', type: 'teach', lng: 106.46160, lat: 29.56836, desc: '教学楼', class: 'c-teach', icon: '📚' },

      // ── 实验楼 ─────────────────────────────────────
      { name: '综合实验大楼', type: 'lab', lng: 106.46196, lat: 29.57043, desc: '实验楼', class: 'c-lab', icon: '🏗️' },
      { name: '才新科学实验楼', type: 'lab', lng: 106.46304, lat: 29.56616, desc: '实验楼', class: 'c-lab', icon: '⚗️' },
      { name: '低品位能源利用技术及系统教育部重点实验室', type: 'lab', lng: 106.46183, lat: 29.56788, desc: '实验楼', class: 'c-lab', icon: '⚡' },
      { name: '冶金工程专业教学实验中心', type: 'lab', lng: 106.46734, lat: 29.56566, desc: '实验楼', class: 'c-lab', icon: '🏭' },
      { name: '制造工程研究所', type: 'lab', lng: 106.46752, lat: 29.56643, desc: '实验楼', class: 'c-lab', icon: '🔧' },
      { name: '机械传动国家重点实验室', type: 'lab', lng: 106.46705, lat: 29.56618, desc: '实验楼', class: 'c-lab', icon: '⚙️' },
      { name: '现代生命科学实验教学中心', type: 'lab', lng: 106.46749, lat: 29.56807, desc: '实验楼', class: 'c-lab', icon: '🧬' },
      { name: '生物流变学与基因调控技术研究院', type: 'lab', lng: 106.46745, lat: 29.56787, desc: '实验楼', class: 'c-lab', icon: '🧫' },
      { name: '汽车工程研究院', type: 'lab', lng: 106.46409, lat: 29.57113, desc: '实验楼', class: 'c-lab', icon: '🚗' },
      { name: '汽车工程学院实验楼', type: 'lab', lng: 106.46310, lat: 29.57174, desc: '实验楼', class: 'c-lab', icon: '🚗' },
      { name: '采矿楼', type: 'lab', lng: 106.46141, lat: 29.56784, desc: '实验楼', class: 'c-lab', icon: '⛏️' },

      // ── 学院 ───────────────────────────────────────
      { name: '理学院', type: 'college', lng: 106.46512, lat: 29.57015, desc: '学院', class: 'c-college', icon: '🔭' },
      { name: '研究生院', type: 'college', lng: 106.46218, lat: 29.56834, desc: '学院', class: 'c-college', icon: '🎓' },
      { name: '美视电影学院', type: 'college', lng: 106.46657, lat: 29.56515, desc: '学院', class: 'c-college', icon: '🎬' },
      { name: '公共管理学院', type: 'college', lng: 106.46671, lat: 29.56702, desc: '学院', class: 'c-college', icon: '📋' },
      { name: '生物学院', type: 'college', lng: 106.46738, lat: 29.56796, desc: '学院', class: 'c-college', icon: '🧬' },
      { name: '航空航天学院', type: 'college', lng: 106.46117, lat: 29.56840, desc: '学院', class: 'c-college', icon: '✈️' },
      { name: '资源与安全学院', type: 'college', lng: 106.46265, lat: 29.57109, desc: '学院', class: 'c-college', icon: '⛰️' },
      { name: '机械工程学院', type: 'college', lng: 106.46404, lat: 29.57117, desc: '学院', class: 'c-college', icon: '⚙️' },
      { name: '自动化学院', type: 'college', lng: 106.46477, lat: 29.57054, desc: '学院', class: 'c-college', icon: '🤖' },
      { name: '博雅学院', type: 'college', lng: 106.46613, lat: 29.56923, desc: '学院', class: 'c-college', icon: '📜' },
      { name: '经管学院', type: 'college', lng: 106.46587, lat: 29.56943, desc: '学院', class: 'c-college', icon: '📊' },
      { name: '体育学院', type: 'college', lng: 106.46862, lat: 29.56669, desc: '学院', class: 'c-college', icon: '🏅' },
      { name: '来福智能精密传动研究院', type: 'college', lng: 106.46457, lat: 29.56362, desc: '学院', class: 'c-college', icon: '🏆' },

      // ── 食堂 ───────────────────────────────────────
      { name: '柏树林食堂', type: 'food', lng: 106.46611, lat: 29.56353, desc: '食堂', class: 'c-food', icon: '🍽️' },
      { name: '学生一食堂', type: 'food', lng: 106.46267, lat: 29.56579, desc: '食堂', class: 'c-food', icon: '🍚' },
      { name: '东林食堂', type: 'food', lng: 106.46056, lat: 29.56830, desc: '食堂', class: 'c-food', icon: '🍜' },

      // ── 运动 ───────────────────────────────────────
      { name: '思群广场', type: 'sport', lng: 106.46429, lat: 29.56697, desc: '运动场', class: 'c-sport', icon: '🏃' },
      { name: '团结广场', type: 'sport', lng: 106.46536, lat: 29.56879, desc: '运动场', class: 'c-sport', icon: '🏟️' },
      { name: '风雨操场', type: 'sport', lng: 106.46789, lat: 29.56711, desc: '运动场', class: 'c-sport', icon: '⛹️' },
      { name: '五教篮球场', type: 'sport', lng: 106.46306, lat: 29.56829, desc: '运动场', class: 'c-sport', icon: '🏀' },
      { name: '钟塔篮球场', type: 'sport', lng: 106.46412, lat: 29.56963, desc: '运动场', class: 'c-sport', icon: '🏀' },
    ]
  },

  // ════════════════════════════════════════════════════
  // B 区
  // ════════════════════════════════════════════════════
  'B': {
    name: 'B区', badge: 'badge-B',
    locations: [
      { name: '建筑馆',     type: 'teach', lng: 106.45263, lat: 29.56744, desc: '建筑学院', class: 'c-teach', icon: '📐' },
      { name: 'B区综合楼', type: 'teach', lng: 106.45646, lat: 29.57216, desc: '教学楼',   class: 'c-teach', icon: '📚' },
    ]
  },

  // ════════════════════════════════════════════════════
  // C 区
  // ════════════════════════════════════════════════════
  'C': {
    name: 'C区', badge: 'badge-C',
    locations: [
      { name: '医学院',  type: 'college', lng: 106.45038, lat: 29.56048, desc: '医学',  class: 'c-college', icon: '💊' },
      { name: 'C区食堂', type: 'food',    lng: 106.44944, lat: 29.56442, desc: '食堂',  class: 'c-food',    icon: '🍚' },
    ]
  },

  // ════════════════════════════════════════════════════
  // 虎溪校区
  // ════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════
  // 虎溪校区
  // 坐标由多边形顶点中心点计算得出
  // ════════════════════════════════════════════════════
  'HUXI': {
    name: '虎溪', badge: 'badge-HUXI',
    locations: [

      // ── 地标 ───────────────────────────────────────
      { name: '乘车站', type: 'landmark', lng: 106.29973, lat: 29.59848, desc: '交通', class: 'c-main', icon: '🚉' },

      // ── 图书馆 ─────────────────────────────────────
      { name: '虎溪图书馆', type: 'library', lng: 106.29807, lat: 29.59492, desc: '图书馆', class: 'c-library', icon: '📖' },

      // ── 教学楼 ─────────────────────────────────────
      { name: '第一教学楼',       type: 'teach', lng: 106.29846, lat: 29.59791, desc: '教学楼', class: 'c-teach', icon: '📚' },
      { name: '综合楼',           type: 'teach', lng: 106.29582, lat: 29.59850, desc: '教学楼', class: 'c-teach', icon: '🏛️' },
      { name: '艺术楼',           type: 'teach', lng: 106.29957, lat: 29.59584, desc: '教学楼', class: 'c-teach', icon: '🎨' },
      { name: '学生交叉创新中心', type: 'teach', lng: 106.28920, lat: 29.59609, desc: '教学楼', class: 'c-teach', icon: '💡' },
      { name: '理科大楼',         type: 'teach', lng: 106.29321, lat: 29.59360, desc: '教学楼', class: 'c-teach', icon: '🏛️' },

      // ── 实验楼 ─────────────────────────────────────
      { name: '第一实验楼',           type: 'lab', lng: 106.30027, lat: 29.59802, desc: '实验楼', class: 'c-lab', icon: '🔬' },
      { name: '第二实验楼',           type: 'lab', lng: 106.29614, lat: 29.59457, desc: '实验楼', class: 'c-lab', icon: '🔬' },
      { name: '物理实验中心',         type: 'lab', lng: 106.30023, lat: 29.59747, desc: '实验楼', class: 'c-lab', icon: '⚛️'  },
      { name: '信息技术科研楼',       type: 'lab', lng: 106.30186, lat: 29.59902, desc: '实验楼', class: 'c-lab', icon: '💻' },
      { name: '基础化学实验教学中心', type: 'lab', lng: 106.29630, lat: 29.59509, desc: '实验楼', class: 'c-lab', icon: '⚗️'  },
      { name: '工程材料实验教学中心', type: 'lab', lng: 106.29578, lat: 29.59450, desc: '实验楼', class: 'c-lab', icon: '🔧' },
      { name: '工科实验大楼',         type: 'lab', lng: 106.29294, lat: 29.59160, desc: '实验楼', class: 'c-lab', icon: '🔧' },

      // ── 学院 ───────────────────────────────────────
      { name: '人文艺术学院',   type: 'college', lng: 106.30014, lat: 29.59610, desc: '学院', class: 'c-college', icon: '🎨' },
      { name: '文理学部',       type: 'college', lng: 106.29376, lat: 29.59319, desc: '学院', class: 'c-college', icon: '📜' },
      { name: '物理学院',       type: 'college', lng: 106.29291, lat: 29.59312, desc: '学院', class: 'c-college', icon: '⚛️'  },
      { name: '数学与统计学院', type: 'college', lng: 106.29318, lat: 29.59279, desc: '学院', class: 'c-college', icon: '📐' },
      { name: '资源与安全学院', type: 'college', lng: 106.29293, lat: 29.59158, desc: '学院', class: 'c-college', icon: '⛏️' },
      { name: '电气工程学院',   type: 'college', lng: 106.29187, lat: 29.59157, desc: '学院', class: 'c-college', icon: '⚡' },
      { name: '生命科学学院',   type: 'college', lng: 106.29296, lat: 29.59212, desc: '学院', class: 'c-college', icon: '🧬' },
      { name: '新闻学院',       type: 'college', lng: 106.29288, lat: 29.59783, desc: '学院', class: 'c-college', icon: '📺' },
      { name: '艺术学院',       type: 'college', lng: 106.30014, lat: 29.59633, desc: '学院', class: 'c-college', icon: '🎨' },

      // ── 食堂 ───────────────────────────────────────
      { name: '竹园食堂', type: 'food', lng: 106.29433, lat: 29.60012, desc: '食堂', class: 'c-food', icon: '🍚' },
      { name: '松园食堂', type: 'food', lng: 106.29109, lat: 29.59866, desc: '食堂', class: 'c-food', icon: '🍚' },
      { name: '第三食堂', type: 'food', lng: 106.29582, lat: 29.59284, desc: '食堂', class: 'c-food', icon: '🍚' },

      // ── 运动 ───────────────────────────────────────
      { name: '兰园运动场', type: 'sport', lng: 106.29359, lat: 29.59089, desc: '运动', class: 'c-sport', icon: '🏃' },
      { name: '游泳池',     type: 'sport', lng: 106.28934, lat: 29.59699, desc: '运动', class: 'c-sport', icon: '🏊' },
      { name: '松园篮球场', type: 'sport', lng: 106.29032, lat: 29.59687, desc: '运动', class: 'c-sport', icon: '🏀' },
      { name: '田径场',     type: 'sport', lng: 106.29974, lat: 29.59966, desc: '运动', class: 'c-sport', icon: '🏅' },
      { name: '体育馆',     type: 'sport', lng: 106.30176, lat: 29.60046, desc: '运动', class: 'c-sport', icon: '🏟️' },
    ]
  },

  // ════════════════════════════════════════════════════
  // 两江校区
  // ════════════════════════════════════════════════════
  'LIANGJIANG': {
    name: '两江', badge: 'badge-LJ',
    locations: [
      { name: '两江主楼', type: 'landmark', lng: 106.8056,  lat: 29.74245, desc: '主楼', class: 'c-main',  icon: '🏢' },
      { name: '两江宿舍', type: 'life',     lng: 106.80328, lat: 29.74096, desc: '宿舍', class: 'c-life',  icon: '🛏️' },
    ]
  }
};
