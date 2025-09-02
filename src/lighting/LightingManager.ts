import * as THREE from 'three'

export interface LightConfig {
  color: THREE.ColorRepresentation
  intensity: number
  distance?: number
  decay?: number
  castShadow?: boolean
  shadowMapSize?: number
}

export class LightingManager {
  private scene: THREE.Scene
  private lights: Map<string, THREE.Light> = new Map()
  private ambientLight!: THREE.AmbientLight
  private directionalLight!: THREE.DirectionalLight

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.setupBasicLighting()
  }

  // 設置基本照明
  private setupBasicLighting(): void {
    // 環境光
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(this.ambientLight)
    this.lights.set('ambient', this.ambientLight)

    // 主方向光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(6, 10, 4)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.directionalLight.shadow.camera.near = 0.5
    this.directionalLight.shadow.camera.far = 50
    this.directionalLight.shadow.camera.left = -10
    this.directionalLight.shadow.camera.right = 10
    this.directionalLight.shadow.camera.top = 10
    this.directionalLight.shadow.camera.bottom = -10
    this.scene.add(this.directionalLight)
    this.lights.set('directional', this.directionalLight)
  }

  // 添加點光源
  addPointLight(
    name: string,
    position: THREE.Vector3,
    config: LightConfig
  ): THREE.PointLight {
    const light = new THREE.PointLight(
      config.color,
      config.intensity,
      config.distance,
      config.decay
    )
    
    light.position.copy(position)
    light.castShadow = config.castShadow || false
    
    if (config.castShadow) {
      light.shadow.mapSize.width = config.shadowMapSize || 512
      light.shadow.mapSize.height = config.shadowMapSize || 512
      light.shadow.camera.near = 0.1
      light.shadow.camera.far = config.distance || 10
    }

    this.scene.add(light)
    this.lights.set(name, light)
    return light
  }

  // 添加聚光燈
  addSpotLight(
    name: string,
    position: THREE.Vector3,
    target: THREE.Vector3,
    config: LightConfig & {
      angle?: number
      penumbra?: number
    }
  ): THREE.SpotLight {
    const light = new THREE.SpotLight(
      config.color,
      config.intensity,
      config.distance || 10,
      config.angle || Math.PI / 6,
      config.penumbra || 0.1,
      config.decay || 1
    )
    
    light.position.copy(position)
    light.target.position.copy(target)
    light.castShadow = config.castShadow || false
    
    if (config.castShadow) {
      light.shadow.mapSize.width = config.shadowMapSize || 512
      light.shadow.mapSize.height = config.shadowMapSize || 512
      light.shadow.camera.near = 0.1
      light.shadow.camera.far = config.distance || 10
    }

    this.scene.add(light)
    this.scene.add(light.target)
    this.lights.set(name, light)
    return light
  }

  // 添加區域光
  addRectAreaLight(
    name: string,
    position: THREE.Vector3,
    width: number,
    height: number,
    config: LightConfig
  ): THREE.RectAreaLight {
    const light = new THREE.RectAreaLight(
      config.color,
      config.intensity,
      width,
      height
    )
    
    light.position.copy(position)
    this.scene.add(light)
    this.lights.set(name, light)
    return light
  }

  // 創建爆炸光源
  createExplosionLight(position: THREE.Vector3, intensity: number = 2.0): THREE.PointLight {
    const light = new THREE.PointLight(0xff4500, intensity, 8, 2)
    light.position.copy(position)
    light.castShadow = false
    
    // 動畫效果
    const startTime = performance.now()
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const fadeOut = Math.max(0, 1 - elapsed / 0.5)
      
      light.intensity = intensity * fadeOut
      
      if (fadeOut > 0) {
        requestAnimationFrame(animate)
      } else {
        this.scene.remove(light)
      }
    }
    
    requestAnimationFrame(animate)
    this.scene.add(light)
    return light
  }

  // 創建脈衝光源
  createPulseLight(
    name: string,
    position: THREE.Vector3,
    config: LightConfig & {
      pulseSpeed?: number
      pulseIntensity?: number
    }
  ): THREE.PointLight {
    const light = this.addPointLight(name, position, config)
    
    // 脈衝動畫
    const startTime = performance.now()
    const pulseSpeed = config.pulseSpeed || 2.0
    const pulseIntensity = config.pulseIntensity || 0.3
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const pulse = 1 + Math.sin(elapsed * pulseSpeed) * pulseIntensity
      
      light.intensity = config.intensity * pulse
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
    return light
  }

  // 創建移動光源
  createMovingLight(
    name: string,
    startPosition: THREE.Vector3,
    endPosition: THREE.Vector3,
    duration: number,
    config: LightConfig
  ): THREE.PointLight {
    const light = this.addPointLight(name, startPosition, config)
    
    // 移動動畫
    const startTime = performance.now()
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      
      light.position.lerpVectors(startPosition, endPosition, progress)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
    return light
  }

  // 設置晝夜循環
  setupDayNightCycle(duration: number = 60): void {
    const startTime = performance.now()
    
    const animate = () => {
      const elapsed = (performance.now() - startTime) / 1000
      const cycle = (elapsed / duration) % 1
      
      // 計算太陽角度
      const sunAngle = cycle * Math.PI * 2
      const sunHeight = Math.sin(sunAngle)
      
      // 更新方向光位置
      this.directionalLight.position.set(
        Math.cos(sunAngle) * 10,
        Math.max(0, sunHeight * 10 + 5),
        Math.sin(sunAngle) * 10
      )
      
      // 更新環境光強度
      const ambientIntensity = 0.2 + Math.max(0, sunHeight) * 0.3
      this.ambientLight.intensity = ambientIntensity
      
      // 更新方向光強度
      const directionalIntensity = Math.max(0, sunHeight) * 0.8
      this.directionalLight.intensity = directionalIntensity
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }

  // 創建體積光效果
  createVolumetricLight(
    name: string,
    position: THREE.Vector3,
    direction: THREE.Vector3,
    config: LightConfig & {
      volumeDensity?: number
      volumeSteps?: number
    }
  ): THREE.SpotLight {
    const light = this.addSpotLight(name, position, position.clone().add(direction), config)
    
    // 體積光材質
    const volumeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        lightPosition: { value: position },
        lightDirection: { value: direction },
        lightColor: { value: new THREE.Color(config.color) },
        lightIntensity: { value: config.intensity },
        volumeDensity: { value: config.volumeDensity || 0.1 },
        volumeSteps: { value: config.volumeSteps || 64 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 lightPosition;
        uniform vec3 lightDirection;
        uniform vec3 lightColor;
        uniform float lightIntensity;
        uniform float volumeDensity;
        uniform float volumeSteps;
        
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 rayDir = normalize(lightPosition - vWorldPosition);
          float rayLength = length(lightPosition - vWorldPosition);
          
          float volume = 0.0;
          for(float i = 0.0; i < volumeSteps; i++) {
            vec3 samplePos = vWorldPosition + rayDir * (rayLength * i / volumeSteps);
            volume += volumeDensity;
          }
          
          vec3 finalColor = lightColor * lightIntensity * volume;
          gl_FragColor = vec4(finalColor, volume);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    
    // 創建體積光網格
    const volumeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 10, 8)
    const volumeMesh = new THREE.Mesh(volumeGeometry, volumeMaterial)
    volumeMesh.position.copy(position)
    volumeMesh.lookAt(position.clone().add(direction))
    
    this.scene.add(volumeMesh)
    return light
  }

  // 獲取光源
  getLight(name: string): THREE.Light | undefined {
    return this.lights.get(name)
  }

  // 移除光源
  removeLight(name: string): void {
    const light = this.lights.get(name)
    if (light) {
      this.scene.remove(light)
      this.lights.delete(name)
    }
  }

  // 清理所有光源
  dispose(): void {
    this.lights.forEach(light => {
      this.scene.remove(light)
      if (light.dispose) {
        light.dispose()
      }
    })
    this.lights.clear()
  }

  // 更新光照
  update(_deltaTime: number): void {
    // 可以在這裡添加動態光照更新邏輯
  }
}
