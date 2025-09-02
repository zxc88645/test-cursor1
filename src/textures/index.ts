import * as THREE from 'three'

// 紋理加載器
const textureLoader = new THREE.TextureLoader()

// 紋理緩存
const textureCache = new Map<string, THREE.Texture>()

// 紋理路徑配置
export const TEXTURE_PATHS = {
  // 地面紋理
  GROUND: {
    BASE: '/textures/ground/base.jpg',
    TILE1: '/textures/ground/tile1.jpg',
    TILE2: '/textures/ground/tile2.jpg',
    GRASS: '/textures/ground/grass.jpg',
    CONCRETE: '/textures/ground/concrete.jpg'
  },
  
  // 方塊紋理
  BLOCKS: {
    BRICK: '/textures/blocks/brick.jpg',
    STONE: '/textures/blocks/stone.jpg',
    WOOD: '/textures/blocks/wood.jpg',
    METAL: '/textures/blocks/metal.jpg',
    CRACKED: '/textures/blocks/cracked.jpg'
  },
  
  // 玩家紋理
  PLAYER: {
    BODY: '/textures/player/body.jpg',
    EYES: '/textures/player/eyes.jpg',
    GLOW: '/textures/player/glow.jpg'
  },
  
  // 炸彈紋理
  BOMB: {
    BODY: '/textures/bomb/body.jpg',
    FUSE: '/textures/bomb/fuse.jpg',
    SPARKLE: '/textures/bomb/sparkle.jpg'
  },
  
  // 火焰紋理
  FIRE: {
    FLAME: '/textures/fire/flame.jpg',
    SMOKE: '/textures/fire/smoke.jpg',
    SPARK: '/textures/fire/spark.jpg'
  },
  
  // 牆壁紋理
  WALLS: {
    STONE: '/textures/walls/stone.jpg',
    METAL: '/textures/walls/metal.jpg',
    CONCRETE: '/textures/walls/concrete.jpg'
  },
  
  // 粒子紋理
  PARTICLES: {
    SPARK: '/textures/particles/spark.png',
    SMOKE: '/textures/particles/smoke.png',
    EXPLOSION: '/textures/particles/explosion.png'
  }
}

// 材質配置
export const MATERIAL_CONFIGS = {
  GROUND: {
    metalness: 0.1,
    roughness: 0.9,
    normalScale: new THREE.Vector2(1, 1)
  },
  BLOCKS: {
    metalness: 0.1,
    roughness: 0.8,
    normalScale: new THREE.Vector2(0.5, 0.5)
  },
  PLAYER: {
    metalness: 0.2,
    roughness: 0.6,
    emissiveIntensity: 0.1
  },
  BOMB: {
    metalness: 0.5,
    roughness: 0.4,
    emissiveIntensity: 0.5
  },
  FIRE: {
    transparent: true,
    blending: THREE.AdditiveBlending,
    emissiveIntensity: 1.0
  }
}

// 加載紋理
export function loadTexture(path: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    if (textureCache.has(path)) {
      resolve(textureCache.get(path)!)
      return
    }
    
    textureLoader.load(
      path,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(1, 1)
        textureCache.set(path, texture)
        resolve(texture)
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture: ${path}`, error)
        reject(error)
      }
    )
  })
}

// 批量加載紋理
export async function loadAllTextures(): Promise<void> {
  const allPaths = Object.values(TEXTURE_PATHS).flatMap(category => 
    Object.values(category)
  )
  
  try {
    await Promise.all(allPaths.map(path => loadTexture(path)))
    console.log('All textures loaded successfully')
  } catch (error) {
    console.error('Failed to load some textures:', error)
  }
}

// 創建材質
export function createMaterial(
  type: keyof typeof MATERIAL_CONFIGS,
  texturePath?: string,
  color?: THREE.ColorRepresentation
): THREE.Material {
  const config = MATERIAL_CONFIGS[type]
  
  if (texturePath && textureCache.has(texturePath)) {
    const texture = textureCache.get(texturePath)!
    return new THREE.MeshStandardMaterial({
      map: texture,
      ...config
    })
  }
  
  return new THREE.MeshStandardMaterial({
    color: color || 0xffffff,
    ...config
  })
}

// 清理紋理緩存
export function disposeTextures(): void {
  textureCache.forEach(texture => texture.dispose())
  textureCache.clear()
}
