import * as THREE from 'three'
import { MaterialFactory } from '../materials/MaterialFactory'
import { ParticleSystem } from '../effects/ParticleSystem'
import { LightingManager } from '../lighting/LightingManager'
import { PostProcessingManager } from '../effects/PostProcessingManager'
import { loadAllTextures, TEXTURE_PATHS } from '../textures'

export interface ArtResourceConfig {
  enableTextures: boolean
  enableParticles: boolean
  enableAdvancedLighting: boolean
  enablePostProcessing: boolean
  textureQuality: 'low' | 'medium' | 'high'
  particleCount: 'low' | 'medium' | 'high'
  shadowQuality: 'low' | 'medium' | 'high'
}

export class ArtResourceManager {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.Camera
  
  private materialFactory: MaterialFactory
  private particleSystem: ParticleSystem
  private lightingManager: LightingManager
  private postProcessingManager: PostProcessingManager
  
  private config: ArtResourceConfig
  private isInitialized: boolean = false
  private loadingPromise: Promise<void> | null = null

  constructor(
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    config: Partial<ArtResourceConfig> = {}
  ) {
    this.scene = scene
    this.renderer = renderer
    this.camera = camera
    
    // 默認配置
    this.config = {
      enableTextures: true,
      enableParticles: true,
      enableAdvancedLighting: true,
      enablePostProcessing: true,
      textureQuality: 'medium',
      particleCount: 'medium',
      shadowQuality: 'medium',
      ...config
    }

    this.initialize()
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 初始化材質工廠
      this.materialFactory = MaterialFactory.getInstance()

      // 初始化粒子系統
      if (this.config.enableParticles) {
        this.particleSystem = new ParticleSystem(this.scene)
      }

      // 初始化光照管理器
      if (this.config.enableAdvancedLighting) {
        this.lightingManager = new LightingManager(this.scene)
        this.setupLightingQuality()
      }

      // 初始化後處理管理器
      if (this.config.enablePostProcessing) {
        this.postProcessingManager = new PostProcessingManager(
          this.renderer,
          this.scene,
          this.camera,
          this.getPostProcessingConfig()
        )
      }

      // 加載紋理
      if (this.config.enableTextures) {
        await this.loadTextures()
      }

      this.isInitialized = true
      console.log('Art Resource Manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Art Resource Manager:', error)
      throw error
    }
  }

  // 加載紋理
  private async loadTextures(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = loadAllTextures()
    await this.loadingPromise
    this.loadingPromise = null
  }

  // 設置光照質量
  private setupLightingQuality(): void {
    if (!this.lightingManager) return

    const shadowConfig = {
      low: { mapSize: 512, near: 0.5, far: 50 },
      medium: { mapSize: 1024, near: 0.5, far: 50 },
      high: { mapSize: 2048, near: 0.5, far: 50 }
    }

    const config = shadowConfig[this.config.shadowQuality]
    // 這裡可以根據質量設置調整光照參數
  }

  // 獲取後處理配置
  private getPostProcessingConfig() {
    const qualityConfig = {
      low: {
        bloom: { enabled: false },
        chromaticAberration: { enabled: false },
        vignette: { enabled: true, offset: 1.0, darkness: 0.3 },
        filmGrain: { enabled: false },
        motionBlur: { enabled: false }
      },
      medium: {
        bloom: { enabled: true, threshold: 0.6, strength: 1.0, radius: 0.4 },
        chromaticAberration: { enabled: false },
        vignette: { enabled: true, offset: 1.0, darkness: 0.4 },
        filmGrain: { enabled: true, intensity: 0.05 },
        motionBlur: { enabled: false }
      },
      high: {
        bloom: { enabled: true, threshold: 0.5, strength: 1.5, radius: 0.5 },
        chromaticAberration: { enabled: true, offset: 0.002 },
        vignette: { enabled: true, offset: 1.0, darkness: 0.5 },
        filmGrain: { enabled: true, intensity: 0.08 },
        motionBlur: { enabled: true, samples: 16 }
      }
    }

    return qualityConfig[this.config.textureQuality]
  }

  // 創建地面材質
  createGroundMaterial(type: 'base' | 'tile1' | 'tile2' | 'grass' | 'concrete' = 'base'): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createGroundMaterial(type)
  }

  // 創建方塊材質
  createBlockMaterial(type: 'brick' | 'stone' | 'wood' | 'metal' | 'cracked' = 'stone'): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createBlockMaterial(type)
  }

  // 創建玩家材質
  createPlayerMaterial(): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createPlayerMaterial()
  }

  // 創建炸彈材質
  createBombMaterial(): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createBombMaterial()
  }

  // 創建火焰材質
  createFireMaterial(type: 'flame' | 'smoke' | 'spark' = 'flame'): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createFireMaterial(type)
  }

  // 創建牆壁材質
  createWallMaterial(type: 'stone' | 'metal' | 'concrete' = 'stone'): THREE.Material {
    if (!this.isInitialized) {
      throw new Error('Art Resource Manager not initialized')
    }
    return this.materialFactory.createWallMaterial(type)
  }

  // 創建爆炸效果
  createExplosionEffect(position: THREE.Vector3, intensity: number = 1.0): void {
    if (!this.particleSystem) return

    // 創建爆炸粒子
    this.particleSystem.createExplosion(position, {
      count: this.getParticleCount(50, intensity),
      lifetime: 2.0,
      speed: 8.0 * intensity,
      size: 0.3 * intensity
    })

    // 創建煙霧效果
    this.particleSystem.createSmoke(position, {
      count: this.getParticleCount(30, intensity),
      lifetime: 3.0,
      size: 0.5 * intensity
    })

    // 創建爆炸光源
    if (this.lightingManager) {
      this.lightingManager.createExplosionLight(position, 2.0 * intensity)
    }
  }

  // 創建火花效果
  createSparkEffect(position: THREE.Vector3, direction: THREE.Vector3, intensity: number = 1.0): void {
    if (!this.particleSystem) return

    this.particleSystem.createSpark(position, direction, {
      count: this.getParticleCount(20, intensity),
      lifetime: 1.5,
      speed: 5.0 * intensity,
      size: 0.15 * intensity
    })
  }

  // 創建火焰效果
  createFireEffect(position: THREE.Vector3, intensity: number = 1.0): void {
    if (!this.particleSystem) return

    this.particleSystem.createFire(position, {
      count: this.getParticleCount(25, intensity),
      lifetime: 1.8,
      speed: 3.0 * intensity,
      size: 0.4 * intensity
    })
  }

  // 創建軌跡效果
  createTrailEffect(startPosition: THREE.Vector3, endPosition: THREE.Vector3, intensity: number = 1.0): void {
    if (!this.particleSystem) return

    this.particleSystem.createTrail(startPosition, endPosition, {
      count: this.getParticleCount(15, intensity),
      lifetime: 1.0,
      size: 0.1 * intensity
    })
  }

  // 根據質量設置獲取粒子數量
  private getParticleCount(baseCount: number, intensity: number): number {
    const qualityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5
    }

    return Math.round(baseCount * qualityMultiplier[this.config.particleCount] * intensity)
  }

  // 添加動態光源
  addDynamicLight(
    name: string,
    position: THREE.Vector3,
    config: any
  ): THREE.Light | undefined {
    if (!this.lightingManager) return undefined
    return this.lightingManager.addPointLight(name, position, config)
  }

  // 創建脈衝光源
  createPulseLight(
    name: string,
    position: THREE.Vector3,
    config: any
  ): THREE.Light | undefined {
    if (!this.lightingManager) return undefined
    return this.lightingManager.createPulseLight(name, position, config)
  }

  // 設置晝夜循環
  setupDayNightCycle(duration: number = 60): void {
    if (!this.lightingManager) return
    this.lightingManager.setupDayNightCycle(duration)
  }

  // 更新後處理效果
  updatePostProcessing(config: any): void {
    if (!this.postProcessingManager) return
    this.postProcessingManager.updateConfig(config)
  }

  // 渲染場景
  render(): void {
    if (this.postProcessingManager) {
      this.postProcessingManager.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // 更新所有系統
  update(deltaTime: number): void {
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime)
    }
    
    if (this.lightingManager) {
      this.lightingManager.update(deltaTime)
    }
    
    if (this.postProcessingManager) {
      this.postProcessingManager.update(deltaTime)
    }
  }

  // 處理視窗大小變化
  onResize(width: number, height: number): void {
    if (this.postProcessingManager) {
      this.postProcessingManager.onResize(width, height)
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<ArtResourceConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 重新初始化受影響的系統
    if (newConfig.enablePostProcessing !== undefined) {
      this.initializePostProcessing()
    }
  }

  private initializePostProcessing(): void {
    if (this.postProcessingManager) {
      this.postProcessingManager.dispose()
    }
    
    if (this.config.enablePostProcessing) {
      this.postProcessingManager = new PostProcessingManager(
        this.renderer,
        this.scene,
        this.camera,
        this.getPostProcessingConfig()
      )
    }
  }

  // 獲取當前配置
  getConfig(): ArtResourceConfig {
    return { ...this.config }
  }

  // 獲取粒子系統
  getParticleSystem(): ParticleSystem | undefined {
    return this.particleSystem
  }

  // 獲取光照管理器
  getLightingManager(): LightingManager | undefined {
    return this.lightingManager
  }

  // 獲取後處理管理器
  getPostProcessingManager(): PostProcessingManager | undefined {
    return this.postProcessingManager
  }

  // 清理資源
  dispose(): void {
    if (this.particleSystem) {
      this.particleSystem.clear()
    }
    
    if (this.lightingManager) {
      this.lightingManager.dispose()
    }
    
    if (this.postProcessingManager) {
      this.postProcessingManager.dispose()
    }
    
    this.isInitialized = false
  }

  // 檢查是否已初始化
  isReady(): boolean {
    return this.isInitialized
  }

  // 獲取加載進度
  getLoadingProgress(): number {
    // 這裡可以實現加載進度追蹤
    return this.isInitialized ? 1.0 : 0.0
  }
}
