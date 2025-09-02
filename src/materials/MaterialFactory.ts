import * as THREE from 'three'
import { createMaterial, TEXTURE_PATHS } from '../textures'

export class MaterialFactory {
  private static instance: MaterialFactory
  private materialCache = new Map<string, THREE.Material>()

  private constructor() {}

  static getInstance(): MaterialFactory {
    if (!MaterialFactory.instance) {
      MaterialFactory.instance = new MaterialFactory()
    }
    return MaterialFactory.instance
  }

  // 地面材質
  createGroundMaterial(type: 'base' | 'tile1' | 'tile2' | 'grass' | 'concrete' = 'base'): THREE.Material {
    const cacheKey = `ground_${type}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    let texturePath: string
    let color: THREE.ColorRepresentation

    switch (type) {
      case 'tile1':
        texturePath = TEXTURE_PATHS.GROUND.TILE1
        color = 0x243251
        break
      case 'tile2':
        texturePath = TEXTURE_PATHS.GROUND.TILE2
        color = 0x1d2944
        break
      case 'grass':
        texturePath = TEXTURE_PATHS.GROUND.GRASS
        color = 0x2d5a27
        break
      case 'concrete':
        texturePath = TEXTURE_PATHS.GROUND.CONCRETE
        color = 0x8b8b8b
        break
      default:
        texturePath = TEXTURE_PATHS.GROUND.BASE
        color = 0x1a2235
    }

    const material = createMaterial('GROUND', texturePath, color)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 方塊材質
  createBlockMaterial(type: 'brick' | 'stone' | 'wood' | 'metal' | 'cracked' = 'stone'): THREE.Material {
    const cacheKey = `block_${type}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    let texturePath: string
    let color: THREE.ColorRepresentation

    switch (type) {
      case 'brick':
        texturePath = TEXTURE_PATHS.BLOCKS.BRICK
        color = 0x8b4513
        break
      case 'stone':
        texturePath = TEXTURE_PATHS.BLOCKS.STONE
        color = 0x5f6e91
        break
      case 'wood':
        texturePath = TEXTURE_PATHS.BLOCKS.WOOD
        color = 0x8b4513
        break
      case 'metal':
        texturePath = TEXTURE_PATHS.BLOCKS.METAL
        color = 0x708090
        break
      case 'cracked':
        texturePath = TEXTURE_PATHS.BLOCKS.CRACKED
        color = 0x696969
        break
      default:
        texturePath = TEXTURE_PATHS.BLOCKS.STONE
        color = 0x5f6e91
    }

    const material = createMaterial('BLOCKS', texturePath, color)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 玩家材質
  createPlayerMaterial(): THREE.Material {
    const cacheKey = 'player'
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    const material = createMaterial('PLAYER', TEXTURE_PATHS.PLAYER.BODY, 0x6ee7ff)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 炸彈材質
  createBombMaterial(): THREE.Material {
    const cacheKey = 'bomb'
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    const material = createMaterial('BOMB', TEXTURE_PATHS.BOMB.BODY, 0x222831)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 火焰材質
  createFireMaterial(type: 'flame' | 'smoke' | 'spark' = 'flame'): THREE.Material {
    const cacheKey = `fire_${type}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    let texturePath: string
    let color: THREE.ColorRepresentation

    switch (type) {
      case 'smoke':
        texturePath = TEXTURE_PATHS.FIRE.SMOKE
        color = 0x696969
        break
      case 'spark':
        texturePath = TEXTURE_PATHS.FIRE.SPARK
        color = 0xffff00
        break
      default:
        texturePath = TEXTURE_PATHS.FIRE.FLAME
        color = 0xffb703
    }

    const material = createMaterial('FIRE', texturePath, color)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 牆壁材質
  createWallMaterial(type: 'stone' | 'metal' | 'concrete' = 'stone'): THREE.Material {
    const cacheKey = `wall_${type}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    let texturePath: string
    let color: THREE.ColorRepresentation

    switch (type) {
      case 'metal':
        texturePath = TEXTURE_PATHS.WALLS.METAL
        color = 0x708090
        break
      case 'concrete':
        texturePath = TEXTURE_PATHS.WALLS.CONCRETE
        color = 0x8b8b8b
        break
      default:
        texturePath = TEXTURE_PATHS.WALLS.STONE
        color = 0x3a4a6f
    }

    const material = createMaterial('BLOCKS', texturePath, color)
    this.materialCache.set(cacheKey, material)
    return material
  }

  // 粒子材質
  createParticleMaterial(type: 'spark' | 'smoke' | 'explosion' = 'spark'): THREE.Material {
    const cacheKey = `particle_${type}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    let texturePath: string
    let color: THREE.ColorRepresentation

    switch (type) {
      case 'smoke':
        texturePath = TEXTURE_PATHS.PARTICLES.SMOKE
        color = 0x696969
        break
      case 'explosion':
        texturePath = TEXTURE_PATHS.PARTICLES.EXPLOSION
        color = 0xff4500
        break
      default:
        texturePath = TEXTURE_PATHS.PARTICLES.SPARK
        color = 0xffff00
    }

    const material = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load(texturePath),
      color: color,
      transparent: true,
      blending: THREE.AdditiveBlending
    })

    this.materialCache.set(cacheKey, material)
    return material
  }

  // 創建發光材質
  createGlowMaterial(color: THREE.ColorRepresentation = 0x6ee7ff, intensity: number = 0.5): THREE.Material {
    const cacheKey = `glow_${color}_${intensity}`
    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: intensity,
      transparent: true,
      opacity: 0.8,
      metalness: 0.1,
      roughness: 0.3
    })

    this.materialCache.set(cacheKey, material)
    return material
  }

  // 創建動畫材質
  createAnimatedMaterial(
    baseMaterial: THREE.Material,
    animationType: 'pulse' | 'wave' | 'rotation' = 'pulse'
  ): THREE.Material {
    const material = baseMaterial.clone()
    
    if (animationType === 'pulse') {
      material.userData.animation = {
        type: 'pulse',
        speed: 2.0,
        intensity: 0.3
      }
    } else if (animationType === 'wave') {
      material.userData.animation = {
        type: 'wave',
        speed: 1.5,
        amplitude: 0.2
      }
    } else if (animationType === 'rotation') {
      material.userData.animation = {
        type: 'rotation',
        speed: 1.0
      }
    }

    return material
  }

  // 清理材質緩存
  dispose(): void {
    this.materialCache.forEach(material => {
      if (material.map) material.map.dispose()
      if (material.normalMap) material.normalMap.dispose()
      if (material.roughnessMap) material.roughnessMap.dispose()
      if (material.metalnessMap) material.metalnessMap.dispose()
      material.dispose()
    })
    this.materialCache.clear()
  }
}
