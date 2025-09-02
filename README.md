# 🎮 3D轟炸機遊戲

一個使用 Three.js 開發的3D轟炸機遊戲，支持紋理系統和載入進度條。

## 🚀 快速開始

### 啟動遊戲
```bash
npm run dev
# 訪問 http://localhost:3000
```

### 遊戲特色
- ✅ 完整的紋理系統
- ✅ 載入進度條
- ✅ 高級光照效果
- ✅ 粒子特效
- ✅ 中文界面

## 🎯 遊戲控制

- **移動**: WASD 或 方向鍵
- **放置炸彈**: 空白鍵
- **重新開始**: R 鍵

## 🛠️ 開發工具

### 測試頁面
- `texture-test.html` - 紋理系統測試
- `simple-texture-test.html` - 簡單紋理測試
- `texture-preview.html` - 紋理資源預覽

### 腳本命令
```bash
npm run dev          # 啟動開發服務器
npm run build        # 構建生產版本
npm run preview      # 預覽構建結果
npm run textures     # 生成紋理資源
```

## 📁 項目結構

```
├── index.html                    # 主遊戲入口
├── game-with-textures.html       # 紋理遊戲備份
├── src/
│   ├── game-with-textures.ts     # 主遊戲邏輯
│   ├── art/                      # 藝術資源管理
│   ├── effects/                  # 特效系統
│   ├── lighting/                 # 光照系統
│   ├── materials/                # 材質系統
│   └── textures/                 # 紋理系統
├── public/textures/              # 紋理資源
└── scripts/                      # 工具腳本
```

## 🎨 特色功能

- **載入進度條**: 實時顯示載入進度
- **紋理系統**: 支持多種材質和紋理
- **光照效果**: 動態光照和陰影
- **粒子特效**: 爆炸和火焰效果
- **響應式設計**: 適配不同屏幕尺寸

## 🔧 技術棧

- **Three.js**: 3D圖形渲染
- **TypeScript**: 類型安全的JavaScript
- **Vite**: 快速開發和構建工具