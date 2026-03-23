'use strict';
// ================================================================
//  GAMEK NEWS  —  server.js
//  Chay: node --experimental-sqlite server.js
//  Khong can DATABASE_URL, khong can thu vien ngoai
//  Chi can: npm install  (package.json khong co dependency nao)
// ================================================================

const http = require('http');
const path = require('path');
const fs   = require('fs');

// Node 22+ built-in SQLite
const { DatabaseSync } = require('node:sqlite');

// ----------------------------------------------------------------
//  CONFIG
// ----------------------------------------------------------------
const PORT     = process.env.PORT     || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const DB_FILE  = process.env.DB_FILE  || path.join('/tmp', 'gamek.db');

// ----------------------------------------------------------------
//  DATABASE  (SQLite built-in, dong bo)
// ----------------------------------------------------------------
const db = new DatabaseSync(DB_FILE);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS articles (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    excerpt    TEXT    DEFAULT '',
    content    TEXT    NOT NULL,
    image_url  TEXT    DEFAULT '',
    category   TEXT    NOT NULL,
    author     TEXT    DEFAULT 'Bien Tap Vien',
    views      INTEGER DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now','localtime')),
    updated_at TEXT    DEFAULT (datetime('now','localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_category   ON articles(category);
  CREATE INDEX IF NOT EXISTS idx_created_at ON articles(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_views      ON articles(views DESC);
`);

console.log('[DB] Schema OK —', DB_FILE);

// ── Seed du lieu mau neu bang dang trong
const rowCount = db.prepare('SELECT COUNT(*) AS c FROM articles').get();
if (rowCount.c === 0) {
  const ins = db.prepare(`
    INSERT INTO articles (title,excerpt,content,image_url,category,author,views,created_at)
    VALUES (?,?,?,?,?,?,?,datetime('now','localtime',-? ||' hours'))
  `);

  const seeds = [
    {
      title: '"Sieu pham" nhap vai the gioi mo do bo Steam: Do hoa dep me nguoi ma hoan toan mien phi',
      excerpt: 'The Seven Deadly Sins: Origin mang den trai nghiem the gioi mo an tuong voi do hoa dep me hon, hoan toan mien phi tren Steam.',
      content: `Su xuat hien cua mot tua game nhap vai the gioi mo mien phi luon du suc khien cong dong game thu chu y. Khi san pham do con so huu nen do hoa an tuong, muc do quan tam lai cang tang cao.

Moi day, nen tang Steam da chinh thuc don nhan The Seven Deadly Sins: Origin — mot du an RPG moi toanh dang nhanh chong tro thanh tam diem nho phong cach hinh anh dep me nguoi.

### The gioi mo day mau sac

Lay cam hung tu bo anime noi tieng The Seven Deadly Sins, tua game dua nguoi choi vao vai Hoang tu Tristan, bat dau hanh trinh kham pha vung dat Britannia rong lon. Phong cach do hoa ket hop voi tong mau tuoi sang mang lai cam giac vua mong mo vua song dong.

### Gameplay da dang tu do kham pha

Nguoi choi co the tu do leo tre, bay luon, kham pha ban do, che tao vat pham, nau an hay thu thap thu cuoi. Toan bo trai nghiem nay dang duoc cung cap hoan toan mien phi — mot loi the cuc lon trong boi canh nhieu tua game AAA co gia khong he re.`,
      image_url: 'https://picsum.photos/seed/g001/800/450', category: 'PC/Console', author: 'Tuan Hung', views: 12540, h: 0,
    },
    {
      title: 'Ra mat tron mot nam, tua game mien phi nay tren Steam van chat luong, rating 98%',
      excerpt: 'Sau mot nam ra mat, tua game nay van duy tri duoc luong nguoi choi on dinh voi rating cuc cao.',
      content: `Khong phai luc nao game mien phi cung dong nghia voi chat luong thap. Tua game nay la minh chung ro rang nhat cho dieu do.

### Mot nam van hot

Ra mat vao nam ngoai, rating van o muc 98% — con so ma nhieu tua game tra phi cung khong the dat duoc.

### Ly do thanh cong

Nha phat trien lien tuc cap nhat noi dung moi, lang nghe phan hoi tu cong dong va fix bug kip thoi. Chinh su tan tam nay da giup ho giu chan nguoi choi hieu qua.`,
      image_url: 'https://picsum.photos/seed/g002/800/450', category: 'PC/Console', author: 'Minh Khoa', views: 8930, h: 3,
    },
    {
      title: 'Steam tang 4 tua game mien phi tuan nay, tai ve la so huu vinh vien',
      excerpt: 'Steam vua bo sung 4 tua game hoan toan mien phi trong thoi gian gioi han cho nguoi dung.',
      content: `Steam tiep tuc chuong trinh tang game dinh ky voi 4 tua game moi tuan nay.

### Danh sach game duoc tang

Bon tua game bao gom nhieu the loai khac nhau, tu hanh dong den giai do, dap ung nhu cau da dang. Chi can dang nhap va nhan them vao thu vien la so huu vinh vien.

### Cach nhan game

Truy cap Steam Store, tim game duoc de xuat va them vao thu vien ca nhan. Game se o lai trong tai khoan mai mai ke ca khi chuong trinh ket thuc.`,
      image_url: 'https://picsum.photos/seed/g003/800/450', category: 'PC/Console', author: 'Thu Ha', views: 15200, h: 6,
    },
    {
      title: 'Lien Quan Mobile ra mat tuong moi voi bo ky nang cuc ky doc dao, meta sap thay doi',
      excerpt: 'Tuong moi nhat so huu co che chua tung co tien le, hua hen thay doi meta hoan toan.',
      content: `Garena vua chinh thuc ra mat tuong moi cho Lien Quan Mobile, ngay lap tuc nhan duoc phan ung manh tu cong dong.

### Bo ky nang doc dao

Tuong moi so huu co che hoan toan khac biet — ky nang dac trung cho phep thay doi huong tan cong theo thoi gian thuc, tao ra nhieu combo chua tung thay.

### Anh huong den meta

Cac chuyen gia cho rang tuong moi co the thay doi hoan toan cach doi hinh duoc xay dung, dac biet o vi tri jungler va support.`,
      image_url: 'https://picsum.photos/seed/m001/800/450', category: 'Game Mobile', author: 'Van Duc', views: 9800, h: 9,
    },
    {
      title: 'LMHT: Tuyen Viet Nam vao Top 8 the gioi sau loat tran kich tinh',
      excerpt: 'Doi tuyen LMHT Viet Nam co man trinh dien xuat sac tai giai dau quoc te.',
      content: `Cong dong game thu Viet Nam dang phan khich sau man trinh dien an tuong cua doi tuyen quoc gia tai giai dau quoc te.

### Hanh trinh den Top 8

Qua 3 vong dau cang thang, doi tuyen Viet Nam the hien su tien bo vuot bac ca ve chien thuat lan ky nang ca nhan. Chien thang truoc doi Han Quoc la diem nhan lon nhat.

### Phan tich hieu suat

ADC dat KDA trung binh 7.2 trong series. Duong tren va giua co nhung man trinh dien vuot ky vong cua gioi chuyen mon.`,
      image_url: 'https://picsum.photos/seed/e001/800/450', category: 'Esports', author: 'Quoc Toan', views: 22100, h: 12,
    },
    {
      title: 'One Piece tap 1120: Luffy doi dau voi ke thu manh nhat tu truoc den nay',
      excerpt: 'Chuong moi nhat khien fan toan cau sung sot voi cuoc doi dau lich su.',
      content: `One Piece tiep tuc gay soc voi arc moi khi dua Luffy vao cuoc doi dau cang thang nhat lich su series.

### Noi dung chuong 1120

Luffy o trang thai Gear 5 doi mat voi ke thu so huu suc manh chua tung thay. Oda da xay dung nhan vat phan dien nay qua nhieu thang truoc do.

### Phan ung cua fan

Cong dong fan quoc te bung no sau khi chuong phat hanh, hang nghin binh luan va phan tich xuat hien trong vai gio dau.`,
      image_url: 'https://picsum.photos/seed/a001/800/450', category: 'Anime/Film', author: 'Bao Chau', views: 18700, h: 15,
    },
    {
      title: '5 tua game indie an cua 2026 ma ban co the da bo lo',
      excerpt: 'Trong be game khong lo cua 2026, co nhung vien ngoc tho dang cho duoc kham pha.',
      content: `Giua vo so tua game lon duoc quang cao ram ro, co nhung tua game indie nho be nhung mang den trai nghiem dang nho khong kem.

### Tai sao indie dang chu y

Game indie it bi rang buoc boi ap luc thuong mai, thuong mang den y tuong sang tao va trai nghiem cam xuc doc dao ma AAA khong the co.

### Danh sach khong the bo qua

Tu game giai do logic den phieu luu cam dong — da dang du thoa man moi khau vi game thu trong nam 2026.`,
      image_url: 'https://picsum.photos/seed/k001/800/450', category: 'Kham Pha', author: 'Lan Anh', views: 6500, h: 18,
    },
    {
      title: 'Valorant Season 2026: Nhung thay doi lon khien game thu tranh cai kich liet',
      excerpt: 'Riot Games cong bo ban cap nhat lon nhat trong lich su Valorant, gay ra lan song tranh luan.',
      content: `Season moi mang den nhung thay doi lon chua tung co, khien cong dong chia lam hai phe ung ho va phan doi ro ret.

### Cac thay doi chinh

He thong rank duoc cai to hoan toan, co che headshot thay doi, mot so agent bi nerf manh tay. Nhung dieu chinh nay nham can bang gameplay nhung tao ra nhieu y kien trai chieu.

### Phan ung cong dong

Nguoi choi ky cuu cho rang nhung thay doi lam mat tinh skill-intensive. Nguoi moi lai chao don vi game de tiep can hon.`,
      image_url: 'https://picsum.photos/seed/e002/800/450', category: 'Esports', author: 'Hung Cuong', views: 13400, h: 21,
    },
  ];

db.exec('BEGIN');
  try {
    for (const s of seeds) {
      ins.run(s.title, s.excerpt, s.content, s.image_url, s.category, s.author, s.views, s.h);
    }
    db.exec('COMMIT');
  } catch(e) {
    db.exec('ROLLBACK');
    throw e;
    }
  console.log('[DB] Seed OK —', seeds.length, 'bai viet');
}

// ── Query helpers
const getArticles = ({ category, limit, offset }) => {
  if (category) {
    const rows  = db.prepare('SELECT * FROM articles WHERE category=? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(category, limit, offset);
    const total = db.prepare('SELECT COUNT(*) AS c FROM articles WHERE category=?').get(category).c;
    return { articles: rows, total };
  }
  const rows  = db.prepare('SELECT * FROM articles ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c;
  return { articles: rows, total };
};

const getById      = id   => db.prepare('SELECT * FROM articles WHERE id=?').get(id);
const getTrending  = lim  => db.prepare('SELECT * FROM articles ORDER BY views DESC LIMIT ?').all(lim);
const searchArt    = q    => db.prepare(`SELECT * FROM articles WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ? ORDER BY created_at DESC LIMIT 50`).all(`%${q}%`,`%${q}%`,`%${q}%`);
const incrViews    = id   => db.prepare('UPDATE articles SET views=views+1 WHERE id=?').run(id);
const insertArt    = (t,e,c,i,cat,a) => {
  const info = db.prepare(`INSERT INTO articles(title,excerpt,content,image_url,category,author) VALUES(?,?,?,?,?,?)`).run(t,e,c,i,cat,a);
  return db.prepare('SELECT * FROM articles WHERE id=?').get(info.lastInsertRowid);
};
const updateArt    = (id,t,e,c,i,cat,a) => {
  db.prepare(`UPDATE articles SET title=?,excerpt=?,content=?,image_url=?,category=?,author=?,updated_at=datetime('now','localtime') WHERE id=?`).run(t,e,c,i,cat,a,id);
  return db.prepare('SELECT * FROM articles WHERE id=?').get(id);
};
const deleteArt    = id   => db.prepare('DELETE FROM articles WHERE id=?').run(id);

// ----------------------------------------------------------------
//  FRONTEND HTML
// ----------------------------------------------------------------
const HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GameK - Tin Tuc Game Moi Nhat</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Source+Serif+4:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --red:#e8001c;--red-d:#b5001a;--black:#0a0a0a;--dark:#111214;
  --panel:#161719;--border:#252628;--muted:#3a3c40;--text:#e0e0e2;
  --sub:#8a8c91;--white:#f5f5f6;--accent:#ff6b35;--tag-bg:#1e1f22;
}
html{scroll-behavior:smooth}
body{font-family:'Source Serif 4',Georgia,serif;background:var(--black);color:var(--text);min-height:100vh;overflow-x:hidden}
.topbar{background:var(--red);padding:6px 0;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.08em;color:#fff;white-space:nowrap;overflow:hidden}
.topbar-inner{display:flex;align-items:center;gap:40px;width:max-content;animation:ticker 35s linear infinite}
@keyframes ticker{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}
.topbar span{opacity:.6}.topbar strong{opacity:1}
header{background:var(--dark);border-bottom:3px solid var(--red);position:sticky;top:0;z-index:100;box-shadow:0 4px 24px rgba(0,0,0,.7)}
.hdr{max-width:1280px;margin:0 auto;display:flex;align-items:center;gap:28px;padding:0 24px;height:60px}
.logo{font-family:'Bebas Neue',sans-serif;font-size:38px;letter-spacing:.05em;color:var(--white);text-decoration:none;line-height:1;flex-shrink:0}
.logo span{color:var(--red)}
nav{display:flex;gap:2px;flex:1}
nav a{font-family:'IBM Plex Mono',monospace;font-size:11.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--sub);text-decoration:none;padding:8px 13px;border-radius:3px;transition:all .2s;white-space:nowrap;cursor:pointer}
nav a:hover,nav a.active{color:var(--white);background:var(--red)}
.hs{display:flex;align-items:center;background:var(--panel);border:1px solid var(--border);border-radius:4px;padding:6px 12px;gap:8px;flex-shrink:0}
.hs input{background:none;border:none;outline:none;color:var(--text);font-family:'IBM Plex Mono',monospace;font-size:12px;width:150px}
.hs input::placeholder{color:var(--muted)}
.hs button{background:var(--red);border:none;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:4px 10px;border-radius:3px;cursor:pointer;font-weight:500}
.hs button:hover{background:var(--red-d)}
.wrap{max-width:1280px;margin:0 auto;padding:0 24px}
.hero-sec{padding:28px 0 20px}
.hero-grid{display:grid;grid-template-columns:1fr 340px;grid-template-rows:auto auto;gap:16px}
.hero-main{grid-row:1/3;position:relative;overflow:hidden;border-radius:6px;cursor:pointer;background:var(--panel)}
.hero-main img{width:100%;height:420px;object-fit:cover;display:block;transition:transform .5s}
.hero-main:hover img{transform:scale(1.04)}
.hero-ov{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.95) 60%);padding:40px 24px 24px}
.hero-ov .cat{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--red);background:rgba(232,0,28,.15);border:1px solid rgba(232,0,28,.4);padding:3px 10px;border-radius:2px;display:inline-block;margin-bottom:10px}
.hero-ov h2{font-size:26px;font-weight:700;line-height:1.3;color:#fff;margin-bottom:8px}
.hero-ov .meta{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--sub)}
.hero-side{display:flex;flex-direction:column;gap:12px}
.hsc{display:flex;gap:12px;cursor:pointer;background:var(--panel);border-radius:6px;padding:12px;border:1px solid var(--border);transition:border-color .2s,background .2s;flex:1}
.hsc:hover{border-color:var(--red);background:#1a1c1f}
.hsc img{width:120px;height:80px;object-fit:cover;border-radius:4px;flex-shrink:0}
.hsc .cat{font-family:'IBM Plex Mono',monospace;font-size:9.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--red);margin-bottom:5px;display:block}
.hsc h3{font-size:14px;font-weight:600;line-height:1.4;color:var(--text);margin-bottom:5px}
.hsc .meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--sub)}
.sec-title{display:flex;align-items:center;gap:14px;margin:32px 0 18px}
.sec-title h2{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.08em;color:var(--white)}
.sec-title .line{flex:1;height:1px;background:var(--border)}
.sec-title .stag{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--sub);cursor:pointer}
.sec-title .stag:hover{color:var(--red)}
.content-layout{display:grid;grid-template-columns:1fr 300px;gap:32px;padding-bottom:48px}
.articles-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.card{background:var(--panel);border-radius:6px;border:1px solid var(--border);overflow:hidden;cursor:pointer;transition:transform .25s,border-color .25s,box-shadow .25s;animation:fadeUp .4s ease both}
.card:hover{transform:translateY(-3px);border-color:rgba(232,0,28,.5);box-shadow:0 8px 32px rgba(0,0,0,.5)}
.card-img{overflow:hidden}
.card img{width:100%;height:170px;object-fit:cover;display:block;transition:transform .4s}
.card:hover img{transform:scale(1.05)}
.card-body{padding:14px 16px 16px}
.card-body .cat{font-family:'IBM Plex Mono',monospace;font-size:9.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--red);margin-bottom:7px;display:block}
.card-body h3{font-size:15px;font-weight:600;line-height:1.45;color:var(--text);margin-bottom:8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-body .exc{font-size:13px;color:var(--sub);line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-bottom:10px}
.card-body .meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--muted);display:flex;gap:12px}
.lcard{display:flex;gap:14px;cursor:pointer;padding:14px 0;border-bottom:1px solid var(--border)}
.lcard:last-child{border-bottom:none}
.lcard:hover h3{color:var(--red)}
.lcard img{width:100px;height:68px;object-fit:cover;border-radius:4px;flex-shrink:0}
.lcard h3{font-size:13.5px;font-weight:600;line-height:1.4;color:var(--text);margin-bottom:5px;transition:color .2s;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lcard .meta{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--sub)}
.widget{background:var(--panel);border-radius:6px;border:1px solid var(--border);margin-bottom:20px;overflow:hidden}
.wtitle{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:.1em;padding:12px 16px;background:var(--tag-bg);color:var(--white);border-bottom:2px solid var(--red)}
.hot-list{padding:8px 0}
.hot-item{display:flex;align-items:flex-start;gap:12px;padding:10px 16px;cursor:pointer;transition:background .2s}
.hot-item:hover{background:rgba(232,0,28,.07)}
.hot-num{font-family:'Bebas Neue',sans-serif;font-size:20px;color:var(--muted);flex-shrink:0;width:24px;line-height:1}
.hot-item:nth-child(1) .hot-num{color:var(--red)}
.hot-item:nth-child(2) .hot-num{color:var(--accent)}
.hot-item:nth-child(3) .hot-num{color:#f5c518}
.hot-item p{font-size:13px;font-weight:600;line-height:1.4;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.hot-item:hover p{color:var(--red)}
.tag-cloud{display:flex;flex-wrap:wrap;gap:8px;padding:14px 16px}
.tag{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;background:var(--tag-bg);border:1px solid var(--border);color:var(--sub);padding:5px 12px;border-radius:20px;cursor:pointer;transition:all .2s}
.tag:hover{background:var(--red);border-color:var(--red);color:#fff}
.detail{display:none}.detail.active{display:block}
.list-view.hidden{display:none}
.d-bc{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--sub);margin-bottom:14px;display:flex;align-items:center;gap:6px;padding:28px 0 0}
.d-bc a{color:var(--red);text-decoration:none;cursor:pointer}
.d-bc a:hover{text-decoration:underline}
.d-cat{font-family:'IBM Plex Mono',monospace;font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--red);background:rgba(232,0,28,.12);border:1px solid rgba(232,0,28,.3);padding:4px 12px;border-radius:2px;display:inline-block;margin-bottom:14px}
.d-title{font-size:32px;font-weight:700;line-height:1.3;color:var(--white);margin-bottom:16px}
.d-meta{display:flex;align-items:center;gap:20px;padding-bottom:20px;border-bottom:1px solid var(--border);font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--sub)}
.d-meta strong{color:var(--text)}
.d-img{width:100%;max-height:480px;object-fit:cover;border-radius:6px;display:block;margin:24px 0}
.d-body{font-size:16.5px;line-height:1.85;color:#c8c9cc}
.d-body p{margin-bottom:20px}
.d-body h3{font-size:20px;font-weight:700;color:var(--white);margin:30px 0 14px;padding-left:14px;border-left:3px solid var(--red)}
.load-wrap{text-align:center;padding:24px 0 8px}
.btn-more{font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;background:none;border:2px solid var(--border);color:var(--sub);padding:12px 32px;border-radius:3px;cursor:pointer;transition:all .2s}
.btn-more:hover{border-color:var(--red);color:var(--red)}
.btn-more:disabled{opacity:.4;cursor:not-allowed}
.spin-wrap{text-align:center;padding:48px}
.spin{display:inline-block;width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--red);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.admin-btn{position:fixed;bottom:24px;right:24px;background:var(--red);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:500;border:none;padding:10px 18px;border-radius:4px;cursor:pointer;z-index:999;box-shadow:0 4px 16px rgba(232,0,28,.4);letter-spacing:.06em}
.admin-btn:hover{background:var(--red-d)}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1000;align-items:center;justify-content:center;padding:24px}
.overlay.open{display:flex}
.modal{background:var(--dark);border:1px solid var(--border);border-radius:8px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.8)}
.modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border)}
.modal-hdr h3{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:.08em;color:var(--white)}
.modal-close{background:none;border:none;color:var(--sub);font-size:22px;cursor:pointer;transition:color .2s;line-height:1}
.modal-close:hover{color:var(--red)}
.modal-body{padding:24px}
.fg{margin-bottom:18px}
.fg label{display:block;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--sub);margin-bottom:7px}
.fg input,.fg select,.fg textarea{width:100%;background:var(--panel);border:1px solid var(--border);color:var(--text);font-family:'Source Serif 4',serif;font-size:14px;padding:10px 14px;border-radius:4px;outline:none;transition:border-color .2s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--red)}
.fg textarea{min-height:140px;resize:vertical}
.fg select option{background:var(--dark)}
.btn-sub{width:100%;background:var(--red);border:none;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;padding:13px;border-radius:4px;cursor:pointer;transition:background .2s}
.btn-sub:hover{background:var(--red-d)}
.btn-sub:disabled{opacity:.5;cursor:not-allowed}
.toast{position:fixed;bottom:80px;right:24px;font-family:'IBM Plex Mono',monospace;font-size:12px;padding:12px 18px;border-radius:4px;z-index:2000;transform:translateY(20px);opacity:0;transition:all .3s;pointer-events:none}
.toast.ok{background:#1a4a1a;border:1px solid #2d7a2d;color:#7dde7d}
.toast.er{background:#4a1a1a;border:1px solid #7a2d2d;color:#de7d7d}
.toast.show{transform:translateY(0);opacity:1}
.empty{grid-column:1/-1;text-align:center;padding:64px 24px;color:var(--sub);font-family:'IBM Plex Mono',monospace;font-size:13px}
.empty h3{font-family:'Bebas Neue',sans-serif;font-size:24px;color:var(--muted);margin-bottom:8px;letter-spacing:.08em}
footer{background:var(--dark);border-top:2px solid var(--red);padding:36px 0 20px;margin-top:40px}
.ftr{max-width:1280px;margin:0 auto;padding:0 24px}
.fgrid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:32px;margin-bottom:28px}
.f-about .logo{font-size:32px;display:block;margin-bottom:12px}
.f-about p{font-size:13px;line-height:1.7;color:var(--sub)}
.fcol h4{font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--white);margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.fcol ul{list-style:none}
.fcol ul li{margin-bottom:8px}
.fcol ul li a{font-size:13px;color:var(--sub);text-decoration:none;transition:color .2s;cursor:pointer}
.fcol ul li a:hover{color:var(--red)}
.fbot{border-top:1px solid var(--border);padding-top:18px;display:flex;justify-content:space-between;align-items:center}
.fbot p{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--muted)}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:900px){
  .hero-grid{grid-template-columns:1fr}.hero-main{grid-row:auto}
  .hero-side{flex-direction:row;overflow-x:auto;padding-bottom:8px}.hsc{min-width:260px}
  .content-layout{grid-template-columns:1fr}.articles-grid{grid-template-columns:1fr}
  .fgrid{grid-template-columns:1fr 1fr}nav{display:none}
}
@media(max-width:600px){.d-title{font-size:22px}.fgrid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="topbar">
  <div class="topbar-inner">
    <span>TIN MOI</span>
    <strong>The Seven Deadly Sins: Origin ra mat mien phi tren Steam</strong>
    <span>//</span><strong>Steam tang 4 tua game mien phi tuan nay</strong>
    <span>//</span><strong>Lien Quan Mobile cap nhat mua giai moi</strong>
    <span>//</span><strong>Game thu Viet vo dich giai dau quoc te LMHT</strong>
    <span>//</span><strong>Elden Ring DLC thu 2 duoc xac nhan</strong>
  </div>
</div>
<header>
  <div class="hdr">
    <a class="logo" href="#" onclick="showHome();return false"><span>G</span>AME<span>K</span></a>
    <nav id="mainNav">
      <a class="active" onclick="filterCat(null,this)">Tat Ca</a>
      <a onclick="filterCat('PC/Console',this)">PC / Console</a>
      <a onclick="filterCat('Game Mobile',this)">Game Mobile</a>
      <a onclick="filterCat('Esports',this)">eSports</a>
      <a onclick="filterCat('Anime/Film',this)">Anime / Film</a>
      <a onclick="filterCat('Kham Pha',this)">Kham Pha</a>
    </nav>
    <div class="hs">
      <input id="sInput" type="text" placeholder="Tim kiem..." onkeydown="if(event.key==='Enter')doSearch()">
      <button onclick="doSearch()">Tim</button>
    </div>
  </div>
</header>
<main class="wrap">
  <div id="listView">
    <div class="hero-sec"><div class="hero-grid" id="heroGrid"><div class="spin-wrap" style="grid-column:1/-1"><div class="spin"></div></div></div></div>
    <div class="sec-title"><h2 id="secLabel">TIN MOI NHAT</h2><div class="line"></div><span class="stag" onclick="showHome()">Xem tat ca</span></div>
    <div class="content-layout">
      <div>
        <div class="articles-grid" id="artGrid"><div class="spin-wrap" style="grid-column:1/-1"><div class="spin"></div></div></div>
        <div class="load-wrap"><button class="btn-more" id="btnMore" onclick="loadMore()">Tai them bai viet</button></div>
      </div>
      <aside id="sidebar"></aside>
    </div>
  </div>
  <div class="detail" id="detailView"></div>
</main>
<footer>
  <div class="ftr">
    <div class="fgrid">
      <div class="f-about">
        <a class="logo" href="#" onclick="showHome();return false"><span>G</span>AME<span>K</span></a>
        <p>Trang tin tuc game hang dau Viet Nam. Cap nhat tin tuc nhanh nhat ve game online, game mobile, eSports va giai tri so.</p>
      </div>
      <div class="fcol"><h4>Chuyen Muc</h4><ul>
        <li><a onclick="filterCat('PC/Console',null)">PC / Console</a></li>
        <li><a onclick="filterCat('Game Mobile',null)">Game Mobile</a></li>
        <li><a onclick="filterCat('Esports',null)">eSports</a></li>
        <li><a onclick="filterCat('Anime/Film',null)">Anime / Film</a></li>
        <li><a onclick="filterCat('Kham Pha',null)">Kham Pha</a></li>
      </ul></div>
      <div class="fcol"><h4>Tro Choi</h4><ul>
        <li><a>Lien Minh Huyen Thoai</a></li>
        <li><a>Lien Quan Mobile</a></li>
        <li><a>PUBG Mobile</a></li>
        <li><a>Valorant</a></li>
        <li><a>Steam</a></li>
      </ul></div>
      <div class="fcol"><h4>Ho Tro</h4><ul>
        <li><a>Gioi thieu</a></li><li><a>Lien he</a></li>
        <li><a>Quang cao</a></li><li><a>Dieu khoan</a></li><li><a>Bao mat</a></li>
      </ul></div>
    </div>
    <div class="fbot"><p>2026 GameK.vn — Ban quyen thuoc ve GameK</p><p>Phien ban 3.0</p></div>
  </div>
</footer>
<button class="admin-btn" onclick="openModal()">+ Dang Bai</button>
<div class="overlay" id="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-hdr"><h3>DANG BAI VIET MOI</h3><button class="modal-close" onclick="closeModal()">x</button></div>
    <div class="modal-body">
      <div class="fg"><label>Tieu de *</label><input id="f_title" type="text" placeholder="Nhap tieu de..."></div>
      <div class="fg"><label>Tom tat</label><input id="f_excerpt" type="text" placeholder="Mo ta ngan..."></div>
      <div class="fg"><label>Noi dung *</label><textarea id="f_content" placeholder="Noi dung day du. Dung ### de tao tieu de phu..."></textarea></div>
      <div class="fg"><label>URL Anh bia</label><input id="f_image" type="text" placeholder="https://..."></div>
      <div class="fg"><label>Danh muc *</label>
        <select id="f_cat">
          <option value="PC/Console">PC / Console</option>
          <option value="Game Mobile">Game Mobile</option>
          <option value="Esports">eSports</option>
          <option value="Anime/Film">Anime / Film</option>
          <option value="Kham Pha">Kham Pha</option>
        </select>
      </div>
      <div class="fg"><label>Tac gia</label><input id="f_author" type="text" placeholder="Ten bien tap vien"></div>
      <button class="btn-sub" id="btnSub" onclick="submitArticle()">DANG BAI NGAY</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
<script>
const ST={filter:null,offset:0,total:0,pageSize:8,loading:false};
const $get=(p)=>fetch('/api'+p).then(r=>r.json());
const $post=(p,b)=>fetch('/api'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Loi server');return d;});
function ago(ts){const s=Math.floor((Date.now()-new Date(ts))/1000);if(s<60)return 'vua xong';if(s<3600)return Math.floor(s/60)+' phut truoc';if(s<86400)return Math.floor(s/3600)+' gio truoc';return Math.floor(s/86400)+' ngay truoc';}
const fv=n=>n>=1000?(n/1000).toFixed(1)+'k':String(n);
const fb=id=>'https://picsum.photos/seed/'+id+'/800/450';
const im=a=>'src="'+(a.image_url||fb(a.id))+'" onerror="this.src=\''+fb(a.id)+'\'" alt=""';
function toast(msg,t='ok'){const el=document.getElementById('toast');el.textContent=msg;el.className='toast '+t+' show';setTimeout(()=>el.classList.remove('show'),3200);}
async function renderHero(){
  const g=document.getElementById('heroGrid');
  g.innerHTML='<div class="spin-wrap" style="grid-column:1/-1"><div class="spin"></div></div>';
  try{
    const qs=ST.filter?'?category='+encodeURIComponent(ST.filter)+'&limit=3':'?limit=3';
    const {articles:a}=await $get('/articles'+qs);
    if(!a||!a.length){g.innerHTML='';return;}
    const[m,...s]=a;
    g.innerHTML=\`<div class="hero-main" onclick="openArticle(\${m.id})"><img \${im(m)}><div class="hero-ov"><div class="cat">\${m.category}</div><h2>\${m.title}</h2><div class="meta">\${m.author} &nbsp;•&nbsp; \${ago(m.created_at)} &nbsp;•&nbsp; \${fv(m.views)} luot xem</div></div></div>
    <div class="hero-side">\${s.slice(0,2).map(x=>\`<div class="hsc" onclick="openArticle(\${x.id})"><img \${im(x)}><div><span class="cat">\${x.category}</span><h3>\${x.title}</h3><div class="meta">\${ago(x.created_at)} &nbsp;•&nbsp; \${fv(x.views)} luot xem</div></div></div>\`).join('')}</div>\`;
  }catch(e){g.innerHTML='<div class="empty"><h3>Loi tai du lieu</h3><p>'+e.message+'</p></div>';}
}
async function renderArticles(append=false){
  const g=document.getElementById('artGrid');
  if(!append)g.innerHTML='<div class="spin-wrap" style="grid-column:1/-1"><div class="spin"></div></div>';
  ST.loading=true;
  try{
    const off=append?ST.offset:3;
    let qs='?limit='+ST.pageSize+'&offset='+off;
    if(ST.filter)qs+='&category='+encodeURIComponent(ST.filter);
    const{articles,total}=await $get('/articles'+qs);
    ST.total=total;
    if(!append){ST.offset=3;g.innerHTML='';}
    if(!articles.length&&!append){g.innerHTML='<div class="empty"><h3>Chua co bai viet</h3><p>Danh muc nay chua co noi dung.</p></div>';return;}
    ST.offset+=articles.length;
    articles.forEach((a,i)=>{
      const c=document.createElement('div');c.className='card';c.style.animationDelay=(i*.08)+'s';c.onclick=()=>openArticle(a.id);
      c.innerHTML=\`<div class="card-img"><img \${im(a)}></div><div class="card-body"><span class="cat">\${a.category}</span><h3>\${a.title}</h3><p class="exc">\${a.excerpt}</p><div class="meta"><span>\${a.author}</span><span>\${ago(a.created_at)}</span><span>\${fv(a.views)} luot xem</span></div></div>\`;
      g.appendChild(c);
    });
    const btn=document.getElementById('btnMore');
    btn.disabled=ST.offset>=ST.total;btn.textContent=ST.offset>=ST.total?'Da tai het':'Tai them bai viet';
  }catch(e){if(!append)g.innerHTML='<div class="empty"><h3>Loi ket noi</h3><p>'+e.message+'</p></div>';}
  finally{ST.loading=false;}
}
async function renderSidebar(id='sidebar'){
  const el=document.getElementById(id);if(!el)return;
  el.innerHTML='<div class="spin-wrap"><div class="spin"></div></div>';
  try{
    const{articles:tr}=await $get('/articles/trending?limit=6');
    const tags=['Steam','PC','Mobile','eSports','Anime','Free-to-Play','RPG','Battle Royale','MOBA','Indie','Gacha','Console','Viet Nam'];
    el.innerHTML=\`<div class="widget"><div class="wtitle">BAI VIET HOT NHAT</div><div class="hot-list">\${tr.map((a,i)=>\`<div class="hot-item" onclick="openArticle(\${a.id})"><div class="hot-num">\${i+1}</div><p>\${a.title}</p></div>\`).join('')}</div></div>
    <div class="widget"><div class="wtitle">CHU DE NOI BAT</div><div class="tag-cloud">\${tags.map(t=>\`<span class="tag" onclick="doSearchTag('\${t}')">\${t}</span>\`).join('')}</div></div>\`;
  }catch(e){el.innerHTML='';}
}
async function openArticle(id){
  const dv=document.getElementById('detailView'),lv=document.getElementById('listView');
  lv.classList.add('hidden');dv.classList.add('active');
  dv.innerHTML='<div class="spin-wrap" style="padding:80px"><div class="spin"></div></div>';
  window.scrollTo({top:0,behavior:'smooth'});
  try{
    const{article:a}=await $get('/articles/'+id);
    const body=a.content.split('\\n').filter(l=>l.trim()).map(l=>l.startsWith('### ')?'<h3>'+l.slice(4)+'</h3>':'<p>'+l+'</p>').join('');
    dv.innerHTML=\`<div class="content-layout"><div>
      <div class="d-bc"><a onclick="showHome()">Trang chu</a> / <span>\${a.category}</span></div>
      <div class="d-cat">\${a.category}</div><h1 class="d-title">\${a.title}</h1>
      <div class="d-meta"><span>Tac gia: <strong>\${a.author}</strong></span><span>\${ago(a.created_at)}</span><span>\${fv(a.views)} luot xem</span></div>
      <img class="d-img" \${im(a)}>
      <div class="d-body">\${body}</div>
      <div style="margin-top:24px;display:flex;gap:8px;flex-wrap:wrap">\${[a.category,'Game','Tin Tuc'].map(t=>\`<span class="tag">\${t}</span>\`).join('')}</div>
      <div id="relSec"></div>
    </div><aside id="dSidebar"></aside></div>\`;
    renderSidebar('dSidebar');
    $get('/articles?category='+encodeURIComponent(a.category)+'&limit=6').then(({articles:rel})=>{
      const r=rel.filter(x=>x.id!==a.id).slice(0,3);if(!r.length)return;
      document.getElementById('relSec').innerHTML=\`<div class="sec-title" style="margin-top:36px"><h2>BAI VIET LIEN QUAN</h2><div class="line"></div></div>
      \${r.map(x=>\`<div class="lcard" onclick="openArticle(\${x.id})"><img \${im(x)}><div><h3>\${x.title}</h3><div class="meta">\${x.author} &nbsp;•&nbsp; \${ago(x.created_at)}</div></div></div>\`).join('')}\`;
    }).catch(()=>{});
  }catch(e){dv.innerHTML='<div class="empty"><h3>Loi tai bai viet</h3><p>'+e.message+'</p></div>';}
}
function showHome(){
  ST.filter=null;ST.offset=0;
  document.getElementById('listView').classList.remove('hidden');
  const dv=document.getElementById('detailView');dv.classList.remove('active');dv.innerHTML='';
  document.getElementById('secLabel').textContent='TIN MOI NHAT';
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  document.querySelector('nav a').classList.add('active');
  renderHero();renderArticles(false);renderSidebar();window.scrollTo({top:0,behavior:'smooth'});
}
function filterCat(cat,el){
  ST.filter=cat;ST.offset=0;
  document.getElementById('listView').classList.remove('hidden');
  const dv=document.getElementById('detailView');dv.classList.remove('active');dv.innerHTML='';
  document.getElementById('secLabel').textContent=cat?cat.toUpperCase():'TIN MOI NHAT';
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));if(el)el.classList.add('active');
  renderHero();renderArticles(false);renderSidebar();window.scrollTo({top:0,behavior:'smooth'});
}
function loadMore(){if(!ST.loading)renderArticles(true);}
async function doSearch(){
  const q=document.getElementById('sInput').value.trim();if(!q)return showHome();
  ST.filter=null;
  document.getElementById('listView').classList.remove('hidden');
  document.getElementById('detailView').classList.remove('active');
  document.getElementById('detailView').innerHTML='';
  document.getElementById('heroGrid').innerHTML='';
  const g=document.getElementById('artGrid');
  g.innerHTML='<div class="spin-wrap" style="grid-column:1/-1"><div class="spin"></div></div>';
  document.getElementById('secLabel').textContent='TIM KIEM: "'+q+'"';
  try{
    const{articles,total}=await $get('/articles/search?q='+encodeURIComponent(q));
    g.innerHTML='';
    if(!articles.length){g.innerHTML='<div class="empty"><h3>Khong co ket qua</h3><p>Khong tim thay ket qua nao cho "'+q+'"</p></div>';return;}
    document.getElementById('secLabel').textContent='KET QUA: "'+q+'" ('+total+')';
    articles.forEach((a,i)=>{
      const c=document.createElement('div');c.className='card';c.style.animationDelay=(i*.08)+'s';c.onclick=()=>openArticle(a.id);
      c.innerHTML=\`<div class="card-img"><img \${im(a)}></div><div class="card-body"><span class="cat">\${a.category}</span><h3>\${a.title}</h3><p class="exc">\${a.excerpt}</p><div class="meta"><span>\${a.author}</span><span>\${ago(a.created_at)}</span></div></div>\`;
      g.appendChild(c);
    });
    document.getElementById('btnMore').style.display='none';
  }catch(e){g.innerHTML='<div class="empty"><h3>Loi tim kiem</h3><p>'+e.message+'</p></div>';}
}
function doSearchTag(t){document.getElementById('sInput').value=t;doSearch();}
function openModal(){document.getElementById('overlay').classList.add('open');}
function closeModal(){document.getElementById('overlay').classList.remove('open');}
async function submitArticle(){
  const btn=document.getElementById('btnSub');
  const body={title:document.getElementById('f_title').value.trim(),excerpt:document.getElementById('f_excerpt').value.trim(),content:document.getElementById('f_content').value.trim(),image_url:document.getElementById('f_image').value.trim(),category:document.getElementById('f_cat').value,author:document.getElementById('f_author').value.trim()};
  if(!body.title)return toast('Tieu de khong duoc trong','er');
  if(!body.content)return toast('Noi dung khong duoc trong','er');
  btn.disabled=true;btn.textContent='Dang xu ly...';
  try{
    await $post('/articles',body);closeModal();
    ['f_title','f_excerpt','f_content','f_image','f_author'].forEach(id=>document.getElementById(id).value='');
    toast('Dang bai thanh cong!');ST.offset=0;renderHero();renderArticles(false);renderSidebar();
  }catch(e){toast('Loi: '+e.message,'er');}
  finally{btn.disabled=false;btn.textContent='DANG BAI NGAY';}
}
renderHero();renderArticles(false);renderSidebar();
</script>
</body>
</html>`;

// ----------------------------------------------------------------
//  HTTP UTILITIES
// ----------------------------------------------------------------
function sendJSON(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}
const ok  = (res, data)      => sendJSON(res, 200, { success: true,  ...data });
const err = (res, code, msg) => sendJSON(res, code, { success: false, error: msg });

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 5_000_000) reject(new Error('Payload qua lon')); });
    req.on('end', () => { try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

function parseQS(url) {
  const p = new URL(url, 'http://x');
  return {
    limit:    Math.min(Math.max(parseInt(p.searchParams.get('limit'))  || 8, 1), 50),
    offset:   Math.max(parseInt(p.searchParams.get('offset')) || 0, 0),
    category: p.searchParams.get('category') || null,
    q:        (p.searchParams.get('q') || '').trim(),
  };
}

// ----------------------------------------------------------------
//  ROUTER
// ----------------------------------------------------------------
async function router(req, res) {
  const { method: M, url: U } = req;

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (M === 'OPTIONS') { res.writeHead(204); return res.end(); }

  // GET /api/health
  if (M === 'GET' && U === '/api/health')
    return ok(res, { status: 'ok', env: NODE_ENV, db: DB_FILE, time: new Date().toISOString() });

  // GET /api/articles/trending
  if (M === 'GET' && U.startsWith('/api/articles/trending')) {
    try {
      const limit = Math.min(parseInt(new URL(U,'http://x').searchParams.get('limit')) || 6, 20);
      return ok(res, { articles: getTrending(limit) });
    } catch(e) { return err(res, 500, e.message); }
  }

  // GET /api/articles/search?q=
  if (M === 'GET' && U.startsWith('/api/articles/search')) {
    try {
      const { q } = parseQS(U);
      if (!q) return err(res, 400, 'Query khong duoc trong');
      const articles = searchArt(q);
      return ok(res, { articles, total: articles.length });
    } catch(e) { return err(res, 500, e.message); }
  }

  // GET /api/articles  (list)
  if (M === 'GET' && /^\/api\/articles(\?|$)/.test(U)) {
    try {
      const { limit, offset, category } = parseQS(U);
      return ok(res, getArticles({ category, limit, offset }));
    } catch(e) { return err(res, 500, e.message); }
  }

  // GET /api/articles/:id
  const mGet = U.match(/^\/api\/articles\/(\d+)$/);
  if (M === 'GET' && mGet) {
    try {
      const article = getById(+mGet[1]);
      if (!article) return err(res, 404, 'Khong tim thay bai viet');
      setImmediate(() => incrViews(article.id));
      return ok(res, { article });
    } catch(e) { return err(res, 500, e.message); }
  }

  // POST /api/articles
  if (M === 'POST' && U === '/api/articles') {
    try {
      const b = await readBody(req);
      if (!b.title?.trim())   return err(res, 400, 'Tieu de khong duoc trong');
      if (!b.content?.trim()) return err(res, 400, 'Noi dung khong duoc trong');
      if (!b.category)        return err(res, 400, 'Danh muc khong duoc trong');
      const article = insertArt(b.title.trim(), b.excerpt||'', b.content.trim(), b.image_url||'', b.category, b.author||'Bien Tap Vien');
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, article }));
    } catch(e) { return err(res, 500, e.message); }
  }

  // PUT /api/articles/:id
  const mPut = U.match(/^\/api\/articles\/(\d+)$/);
  if (M === 'PUT' && mPut) {
    try {
      const id = +mPut[1];
      const existing = getById(id);
      if (!existing) return err(res, 404, 'Khong tim thay bai viet');
      const b = await readBody(req);
      const article = updateArt(id, b.title??existing.title, b.excerpt??existing.excerpt, b.content??existing.content, b.image_url??existing.image_url, b.category??existing.category, b.author??existing.author);
      return ok(res, { article });
    } catch(e) { return err(res, 500, e.message); }
  }

  // DELETE /api/articles/:id
  const mDel = U.match(/^\/api\/articles\/(\d+)$/);
  if (M === 'DELETE' && mDel) {
    try {
      const existing = getById(+mDel[1]);
      if (!existing) return err(res, 404, 'Khong tim thay bai viet');
      deleteArt(+mDel[1]);
      return ok(res, { message: 'Da xoa bai viet' });
    } catch(e) { return err(res, 500, e.message); }
  }

  // Serve frontend
  if (M === 'GET' && !U.startsWith('/api')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML);
  }

  err(res, 404, 'Not found');
}

// ----------------------------------------------------------------
//  START
// ----------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  try { await router(req, res); }
  catch(e) { console.error('[ERROR]', e.message); if (!res.headersSent) err(res, 500, 'Internal server error'); }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  GAMEK SERVER DANG CHAY');
  console.log('  Port  :', PORT);
  console.log('  Env   :', NODE_ENV);
  console.log('  DB    :', DB_FILE);
  console.log('  URL   : http://0.0.0.0:' + PORT);
  console.log('');
});
