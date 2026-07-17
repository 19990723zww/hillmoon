/* 初始商品数据：Blob 中尚无 data/products.json 时使用；后台首次保存后即以 Blob 为准 */

export const SEED = {
  settings: {
    visibleCats: ["bracelet", "necklace", "earring"],
  },
  products: [
    {
      id: "yingyue", cat: "necklace", mat: "pearl", price: 1690000, stock: 20,
      tag: "hero", featured: true, visible: true, img: null,
      name: {
        vi: "Ánh Trăng · Dây chuyền ngọc trai nước ngọt",
        en: "Moonlit · Freshwater Pearl Necklace",
        zh: "映月 · 淡水珍珠项链",
      },
    },
    {
      id: "shanlan", cat: "bracelet", mat: "crystal", price: 1150000, stock: 30,
      tag: "", featured: true, visible: true, img: null,
      name: {
        vi: "Sương Núi · Vòng tay pha lê trắng",
        en: "Mountain Mist · White Crystal Bracelet",
        zh: "山岚 · 白水晶手链",
      },
    },
    {
      id: "qingciyue", cat: "earring", mat: "ceramic", price: 890000, stock: 25,
      tag: "new", featured: true, visible: true, img: null,
      name: {
        vi: "Trăng Thanh Từ · Hoa tai gốm sứ",
        en: "Celadon Moon · Ceramic Earrings",
        zh: "青瓷月 · 陶瓷耳坠",
      },
    },
    {
      id: "suxian", cat: "necklace", mat: "silver", price: 1390000, stock: 18,
      tag: "", featured: true, visible: true, img: null,
      name: {
        vi: "Dây Tơ · Dây chuyền mạ bạc",
        en: "Plain String · Silver-plated Chain",
        zh: "素弦 · 镀银锁骨链",
      },
    },
    {
      id: "mofeng", cat: "bracelet", mat: "titanium", price: 1190000, stock: 40,
      tag: "", featured: true, visible: true, img: null,
      name: {
        vi: "Đỉnh Mực · Vòng tay thép titan",
        en: "Ink Peak · Titanium Steel Bangle",
        zh: "墨峰 · 钛钢手环",
      },
    },
    {
      id: "yueman", cat: "earring", mat: "pearl", price: 750000, stock: 35,
      tag: "", featured: true, visible: true, img: null,
      name: {
        vi: "Trăng Tròn · Khuyên tai ngọc trai",
        en: "Full Moon · Pearl Studs",
        zh: "月满 · 珍珠耳钉",
      },
    },
    {
      id: "yanshui", cat: "necklace", mat: "crystal", price: 1590000, stock: 15,
      tag: "", featured: false, visible: true, img: null,
      name: {
        vi: "Khói Nước · Dây chuyền thạch anh tím",
        en: "Misty Waters · Amethyst Necklace",
        zh: "烟水 · 紫水晶项链",
      },
    },
    {
      id: "diezhang", cat: "bracelet", mat: "ceramic", price: 990000, stock: 22,
      tag: "new", featured: false, visible: true, img: null,
      name: {
        vi: "Trùng Điệp · Vòng tay hạt gốm",
        en: "Layered Peaks · Ceramic Bead Bracelet",
        zh: "叠嶂 · 陶瓷串珠手链",
      },
    },
    {
      id: "shuangzhi", cat: "earring", mat: "silver", price: 820000, stock: 28,
      tag: "", featured: false, visible: true, img: null,
      name: {
        vi: "Cành Sương · Khuyên tai dài mạ bạc",
        en: "Frosted Branch · Silver Threader Earrings",
        zh: "霜枝 · 镀银耳线",
      },
    },
    {
      id: "zhi", cat: "necklace", mat: "titanium", price: 1490000, stock: 12,
      tag: "", featured: false, visible: true, img: null,
      name: {
        vi: "Thế Núi · Vòng cổ thép titan",
        en: "Standing Stone · Titanium Steel Collar",
        zh: "峙 · 钛钢项圈",
      },
    },
    {
      id: "shilu", cat: "bracelet", mat: "pearl", price: 1250000, stock: 26,
      tag: "", featured: false, visible: true, img: null,
      name: {
        vi: "Hứng Sương · Vòng tay ngọc trai",
        en: "Gathered Dew · Pearl Bracelet",
        zh: "拾露 · 珍珠手链",
      },
    },
    {
      id: "kongshan", cat: "earring", mat: "crystal", price: 920000, stock: 32,
      tag: "", featured: false, visible: true, img: null,
      name: {
        vi: "Núi Vắng · Hoa tai pha lê",
        en: "Empty Mountain · Crystal Earrings",
        zh: "空山 · 水晶耳饰",
      },
    },
  ],
};
