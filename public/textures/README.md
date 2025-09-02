# 🎨 紋理資源目錄

這個目錄包含了為3D轟炸機遊戲生成的所有紋理文件。

## 📁 目錄結構

```
textures/
├── ground/          # 地面紋理
│   ├── base.svg     # 基礎地面 (512x512)
│   ├── grass.svg    # 草地 (512x512)
│   └── concrete.svg # 混凝土 (512x512)
├── blocks/          # 方塊紋理
│   ├── stone.svg    # 石塊 (512x512)
│   └── metal.svg    # 金屬 (512x512)
├── player/          # 玩家紋理
│   └── player.svg   # 玩家角色 (512x512)
├── bomb/            # 炸彈紋理
│   └── bomb.svg     # 炸彈 (512x512)
├── fire/            # 火焰紋理
│   └── fire.svg     # 火焰 (512x512)
├── walls/           # 牆壁紋理
│   └── wall.svg     # 牆壁 (512x512)
└── particles/       # 粒子紋理
    ├── spark.svg    # 火花 (128x128)
    ├── smoke.svg    # 煙霧 (128x128)
    └── explosion.svg # 爆炸 (256x256)
```

## 🚀 使用方法

### 1. 在Three.js中加載

```typescript
import * as THREE from 'three';

// 加載SVG紋理
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('textures/ground/base.svg');

// 創建材質
const groundMaterial = new THREE.MeshStandardMaterial({
    map: groundTexture,
    roughness: 0.8,
    metalness: 0.2
});
```

### 2. 使用我們的藝術系統

```typescript
import { ArtResourceManager } from '../art/ArtResourceManager';

// 創建藝術資源管理器
const artManager = new ArtResourceManager(scene, renderer, camera);

// 等待初始化完成
await artManager.initialize();

// 創建材質
const groundMaterial = artManager.createMaterial('ground', 'base');
const blockMaterial = artManager.createMaterial('blocks', 'stone');
```

## ✨ 紋理特點

- **SVG格式**: 矢量圖形，支持無限縮放
- **程序化生成**: 無需外部素材，完全自定義
- **遊戲優化**: 專為3D遊戲設計的尺寸和樣式
- **即開即用**: 可以直接在遊戲中使用

## 🎯 自定義選項

### 修改顏色
編輯SVG文件中的 `fill` 屬性來改變顏色：

```xml
<!-- 原始顏色 -->
<rect fill="#8B7355"/>

<!-- 自定義顏色 -->
<rect fill="#FF6B6B"/>
```

### 修改尺寸
調整 `width` 和 `height` 屬性：

```xml
<!-- 原始尺寸 -->
<svg width="512" height="512">

<!-- 自定義尺寸 -->
<svg width="1024" height="1024">
```

## 🔧 轉換格式

如果需要PNG或JPG格式，可以使用以下方法：

1. **瀏覽器轉換**: 在瀏覽器中打開SVG，右鍵另存為PNG
2. **在線工具**: 使用SVG到PNG的轉換工具
3. **圖像編輯軟件**: 在Photoshop、GIMP等軟件中打開並導出

## 📱 性能建議

- **低端設備**: 使用512x512或更小的紋理
- **中端設備**: 可以使用1024x1024紋理
- **高端設備**: 支持更高分辨率的紋理

## 🎮 遊戲集成

這些紋理已經與我們的藝術系統完全集成：

- 自動紋理加載和緩存
- 材質工廠支持
- 粒子系統集成
- 光照和陰影支持
- 後處理效果兼容

## 🚀 下一步

1. 運行遊戲查看紋理效果
2. 根據需要調整紋理樣式
3. 添加更多自定義紋理
4. 優化性能和視覺效果

享受您的3D轟炸機遊戲！🎯💥
