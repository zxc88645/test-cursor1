# 🎨 3D炸彈人遊戲美術系統

這是一個完整的3D遊戲美術系統，為您的炸彈人遊戲提供了豐富的視覺效果和美術資源管理功能。

## ✨ 主要功能

### 🖼️ 紋理管理系統
- **自動紋理加載**: 支持JPG和PNG格式的紋理文件
- **紋理緩存**: 智能緩存機制，提高性能
- **多種紋理類型**: 地面、方塊、玩家、炸彈、火焰、牆壁等
- **材質工廠**: 統一的材質創建和管理

### ✨ 粒子效果系統
- **爆炸效果**: 真實的爆炸粒子和煙霧
- **火花效果**: 方向性火花粒子
- **火焰效果**: 動態火焰粒子
- **軌跡效果**: 物體移動軌跡
- **可配置參數**: 粒子數量、生命週期、速度等

### 💡 高級光照系統
- **環境光**: 基礎環境照明
- **方向光**: 主光源，支持陰影
- **點光源**: 動態點光源
- **聚光燈**: 可調節的聚光效果
- **晝夜循環**: 動態太陽光照系統
- **體積光**: 高級體積光效果

### 🎭 後處理效果
- **Bloom效果**: 發光效果增強
- **色差效果**: 電影級色差
- **暗角效果**: 鏡頭暗角
- **顆粒效果**: 電影顆粒感
- **運動模糊**: 高速運動模糊

### ⚙️ 美術設置面板
- **實時調整**: 所有效果可實時調整
- **質量預設**: 低/中/高質量快速切換
- **個性化設置**: 每個效果可單獨控制
- **用戶友好**: 直觀的UI界面

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install three @types/three
```

### 2. 導入美術系統
```typescript
import { ArtResourceManager } from './src/art/ArtResourceManager'
import { ArtSettingsPanel } from './src/ui/ArtSettingsPanel'
```

### 3. 初始化美術管理器
```typescript
const artManager = new ArtResourceManager(scene, renderer, camera, {
  enableTextures: true,
  enableParticles: true,
  enableAdvancedLighting: true,
  enablePostProcessing: true,
  textureQuality: 'medium',
  particleCount: 'medium',
  shadowQuality: 'medium'
})
```

### 4. 創建材質
```typescript
// 地面材質
const groundMaterial = artManager.createGroundMaterial('base')

// 方塊材質
const blockMaterial = artManager.createBlockMaterial('stone')

// 玩家材質
const playerMaterial = artManager.createPlayerMaterial()
```

### 5. 創建特效
```typescript
// 爆炸效果
artManager.createExplosionEffect(position, intensity)

// 火焰效果
artManager.createFireEffect(position, intensity)

// 火花效果
artManager.createSparkEffect(position, direction, intensity)
```

## 📁 目錄結構

```
src/
├── art/                    # 美術資源管理
│   └── ArtResourceManager.ts
├── materials/              # 材質管理
│   └── MaterialFactory.ts
├── effects/                # 特效系統
│   ├── ParticleSystem.ts
│   └── PostProcessingManager.ts
├── lighting/               # 光照管理
│   └── LightingManager.ts
├── ui/                     # 用戶界面
│   └── ArtSettingsPanel.ts
├── textures/               # 紋理管理
│   └── index.ts
└── examples/               # 使用示例
    └── ArtSystemExample.ts
```

## 🎮 使用示例

### 基本遊戲集成
```typescript
class Bomber3DGame {
  private artManager: ArtResourceManager
  private settingsPanel: ArtSettingsPanel

  constructor() {
    // 初始化美術系統
    this.artManager = new ArtResourceManager(scene, renderer, camera)
    
    // 創建設置面板
    this.settingsPanel = new ArtSettingsPanel(this.artManager)
  }

  private placeBomb() {
    // 使用美術系統創建炸彈
    const bombMaterial = this.artManager.createBombMaterial()
    const bomb = new THREE.Mesh(bombGeometry, bombMaterial)
    
    // 添加爆炸效果
    this.artManager.createExplosionEffect(bomb.position, 1.5)
  }

  private render() {
    // 使用美術系統渲染
    this.artManager.render()
  }
}
```

### 特效演示
```typescript
// 點擊創建爆炸
renderer.domElement.addEventListener('click', (event) => {
  const point = getClickPoint(event)
  artManager.createExplosionEffect(point, 2.0)
})

// 鍵盤快捷鍵
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'e': // 爆炸
      artManager.createExplosionEffect(position, 2.0)
      break
    case 'f': // 火焰
      artManager.createFireEffect(position, 1.0)
      break
    case 's': // 火花
      artManager.createSparkEffect(position, direction, 1.0)
      break
  }
})
```

## 🎨 紋理資源

### 支持的紋理類型
- **地面**: base, tile1, tile2, grass, concrete
- **方塊**: brick, stone, wood, metal, cracked
- **玩家**: body, eyes, glow
- **炸彈**: body, fuse, sparkle
- **火焰**: flame, smoke, spark
- **牆壁**: stone, metal, concrete
- **粒子**: spark, smoke, explosion

### 紋理規格
- **格式**: JPG (有損), PNG (無損)
- **尺寸**: 256x256, 512x512, 1024x1024
- **色彩空間**: sRGB
- **壓縮**: 適當壓縮以優化性能

## ⚙️ 配置選項

### 美術質量設置
```typescript
interface ArtResourceConfig {
  enableTextures: boolean          // 啟用紋理
  enableParticles: boolean         // 啟用粒子效果
  enableAdvancedLighting: boolean  // 啟用高級光照
  enablePostProcessing: boolean    // 啟用後處理
  textureQuality: 'low' | 'medium' | 'high'    // 紋理質量
  particleCount: 'low' | 'medium' | 'high'     // 粒子數量
  shadowQuality: 'low' | 'medium' | 'high'     // 陰影質量
}
```

### 後處理配置
```typescript
interface PostProcessingConfig {
  bloom?: { enabled: boolean, threshold: number, strength: number, radius: number }
  chromaticAberration?: { enabled: boolean, offset: number }
  vignette?: { enabled: boolean, offset: number, darkness: number }
  filmGrain?: { enabled: boolean, intensity: number }
  motionBlur?: { enabled: boolean, samples: number }
}
```

## 🔧 性能優化

### 紋理優化
- 自動紋理緩存
- 適當的紋理壓縮
- 紋理圖集支持

### 粒子優化
- 可配置的粒子數量
- 自動粒子清理
- 質量等級控制

### 光照優化
- 可調節的陰影質量
- 動態光照管理
- 光照緩存機制

## 🎯 最佳實踐

### 1. 紋理管理
- 使用適當的紋理尺寸
- 選擇合適的壓縮格式
- 實現紋理流式加載

### 2. 粒子效果
- 根據性能調整粒子數量
- 使用適當的生命週期
- 避免過度使用特效

### 3. 光照設置
- 根據場景需求選擇光照類型
- 適當調整陰影質量
- 使用晝夜循環增加真實感

### 4. 後處理效果
- 根據目標平台調整效果
- 平衡視覺質量和性能
- 提供用戶自定義選項

## 🐛 故障排除

### 常見問題
1. **紋理無法加載**: 檢查文件路徑和格式
2. **性能問題**: 降低質量設置或粒子數量
3. **光照問題**: 檢查光照配置和陰影設置
4. **後處理錯誤**: 確認WebGL版本支持

### 調試技巧
- 使用瀏覽器開發者工具檢查錯誤
- 監控幀率和內存使用
- 逐步啟用功能以定位問題

## 📚 參考資料

- [Three.js 官方文檔](https://threejs.org/docs/)
- [WebGL 最佳實踐](https://webglfundamentals.org/)
- [遊戲美術優化指南](https://docs.unity3d.com/Manual/Optimization.html)

## 🤝 貢獻

歡迎提交問題報告和功能請求！如果您想貢獻代碼，請：

1. Fork 本項目
2. 創建功能分支
3. 提交更改
4. 發起 Pull Request

## 📄 許可證

本項目採用 MIT 許可證 - 詳見 [LICENSE](LICENSE) 文件。

---

🎮 **享受創建美麗的3D遊戲體驗！** 🎨
