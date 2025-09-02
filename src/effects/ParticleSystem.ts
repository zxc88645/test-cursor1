import * as THREE from 'three'
import { MaterialFactory } from '../materials/MaterialFactory'

export interface ParticleConfig {
  count: number
  lifetime: number
  speed: number
  spread: number
  gravity: number
  size: number
  color: THREE.ColorRepresentation
  type: 'spark' | 'smoke' | 'explosion' | 'fire'
}

export class ParticleSystem {
  private scene: THREE.Scene
  private materialFactory: MaterialFactory
  private particles: THREE.Sprite[] = []
  private particleData: Array<{
    sprite: THREE.Sprite
    velocity: THREE.Vector3
    lifetime: number
    maxLifetime: number
    initialSize: number
  }> = []

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.materialFactory = MaterialFactory.getInstance()
  }

  // 創建爆炸粒子
  createExplosion(position: THREE.Vector3, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 50,
      lifetime: 2.0,
      speed: 8.0,
      spread: Math.PI * 2,
      gravity: -15.0,
      size: 0.3,
      color: 0xff4500,
      type: 'explosion'
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.createParticles(position, finalConfig)
  }

  // 創建火花粒子
  createSpark(position: THREE.Vector3, direction: THREE.Vector3, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 20,
      lifetime: 1.5,
      speed: 5.0,
      spread: Math.PI / 4,
      gravity: -8.0,
      size: 0.15,
      color: 0xffff00,
      type: 'spark'
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.createDirectionalParticles(position, direction, finalConfig)
  }

  // 創建煙霧粒子
  createSmoke(position: THREE.Vector3, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 30,
      lifetime: 3.0,
      speed: 2.0,
      spread: Math.PI * 2,
      gravity: -2.0,
      size: 0.5,
      color: 0x696969,
      type: 'smoke'
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.createParticles(position, finalConfig)
  }

  // 創建火焰粒子
  createFire(position: THREE.Vector3, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 25,
      lifetime: 1.8,
      speed: 3.0,
      spread: Math.PI * 2,
      gravity: -5.0,
      size: 0.4,
      color: 0xffb703,
      type: 'fire'
    }

    const finalConfig = { ...defaultConfig, ...config }
    this.createParticles(position, finalConfig)
  }

  // 創建通用粒子
  private createParticles(position: THREE.Vector3, config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      const material = this.materialFactory.createParticleMaterial(config.type)
      const sprite = new THREE.Sprite(material)
      
      // 隨機方向
      const angle = Math.random() * config.spread
      const speed = config.speed * (0.5 + Math.random() * 0.5)
      
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * speed * 0.5 + speed * 0.5,
        Math.sin(angle) * speed
      )

      sprite.position.copy(position)
      sprite.scale.setScalar(config.size * (0.7 + Math.random() * 0.6))
      
      // 隨機旋轉
      sprite.rotation = Math.random() * Math.PI * 2

      this.scene.add(sprite)
      this.particles.push(sprite)
      this.particleData.push({
        sprite,
        velocity,
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
        initialSize: config.size
      })
    }
  }

  // 創建方向性粒子
  private createDirectionalParticles(position: THREE.Vector3, direction: THREE.Vector3, config: ParticleConfig): void {
    for (let i = 0; i < config.count; i++) {
      const material = this.materialFactory.createParticleMaterial(config.type)
      const sprite = new THREE.Sprite(material)
      
      // 基於方向的角度偏移
      const baseAngle = Math.atan2(direction.z, direction.x)
      const angle = baseAngle + (Math.random() - 0.5) * config.spread
      const speed = config.speed * (0.5 + Math.random() * 0.5)
      
      const velocity = new THREE.Vector3(
        Math.cos(angle) * speed,
        Math.random() * speed * 0.3 + speed * 0.2,
        Math.sin(angle) * speed
      )

      sprite.position.copy(position)
      sprite.scale.setScalar(config.size * (0.7 + Math.random() * 0.6))
      sprite.rotation = Math.random() * Math.PI * 2

      this.scene.add(sprite)
      this.particles.push(sprite)
      this.particleData.push({
        sprite,
        velocity,
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
        initialSize: config.size
      })
    }
  }

  // 更新粒子
  update(deltaTime: number): void {
    for (let i = this.particleData.length - 1; i >= 0; i--) {
      const particle = this.particleData[i]
      
      // 更新位置
      particle.sprite.position.add(particle.velocity.clone().multiplyScalar(deltaTime))
      
      // 應用重力
      particle.velocity.y += -9.8 * deltaTime
      
      // 更新生命週期
      particle.lifetime -= deltaTime
      
      // 更新大小（逐漸縮小）
      const lifeRatio = particle.lifetime / particle.maxLifetime
      const currentSize = particle.initialSize * lifeRatio
      particle.sprite.scale.setScalar(currentSize)
      
      // 更新透明度
      if (particle.sprite.material instanceof THREE.SpriteMaterial) {
        particle.sprite.material.opacity = lifeRatio
      }
      
      // 移除死亡粒子
      if (particle.lifetime <= 0) {
        this.scene.remove(particle.sprite)
        this.particles.splice(i, 1)
        this.particleData.splice(i, 1)
      }
    }
  }

  // 清理所有粒子
  clear(): void {
    this.particles.forEach(particle => {
      this.scene.remove(particle)
    })
    this.particles = []
    this.particleData = []
  }

  // 獲取粒子數量
  getParticleCount(): number {
    return this.particles.length
  }

  // 創建軌跡效果
  createTrail(startPosition: THREE.Vector3, endPosition: THREE.Vector3, config: Partial<ParticleConfig> = {}): void {
    const defaultConfig: ParticleConfig = {
      count: 15,
      lifetime: 1.0,
      speed: 0,
      spread: 0,
      gravity: -2.0,
      size: 0.1,
      color: 0xffff00,
      type: 'spark'
    }

    const finalConfig = { ...defaultConfig, ...config }
    const direction = new THREE.Vector3().subVectors(endPosition, startPosition)
    const distance = direction.length()
    direction.normalize()

    for (let i = 0; i < finalConfig.count; i++) {
      const material = this.materialFactory.createParticleMaterial(finalConfig.type)
      const sprite = new THREE.Sprite(material)
      
      // 沿著軌跡線分布
      const t = i / (finalConfig.count - 1)
      const position = startPosition.clone().lerp(endPosition, t)
      
      // 添加一些隨機偏移
      position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ))

      sprite.position.copy(position)
      sprite.scale.setScalar(finalConfig.size * (0.7 + Math.random() * 0.6))
      sprite.rotation = Math.random() * Math.PI * 2

      this.scene.add(sprite)
      this.particles.push(sprite)
      this.particleData.push({
        sprite,
        velocity: new THREE.Vector3(0, -1, 0),
        lifetime: finalConfig.lifetime,
        maxLifetime: finalConfig.lifetime,
        initialSize: finalConfig.size
      })
    }
  }
}
