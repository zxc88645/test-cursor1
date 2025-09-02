import * as THREE from 'three'

export interface PostProcessingConfig {
  bloom?: {
    enabled: boolean
    threshold: number
    strength: number
    radius: number
  }
  chromaticAberration?: {
    enabled: boolean
    offset: number
  }
  vignette?: {
    enabled: boolean
    offset: number
    darkness: number
  }
  filmGrain?: {
    enabled: boolean
    intensity: number
  }
  motionBlur?: {
    enabled: boolean
    samples: number
  }
}

export class PostProcessingManager {
  private renderer: THREE.WebGLRenderer
  private scene: THREE.Scene
  private camera: THREE.Camera
  private composer: THREE.EffectComposer
  private renderPass: THREE.RenderPass
  private bloomPass: THREE.UnrealBloomPass
  private chromaticAberrationPass: THREE.ShaderPass
  private vignettePass: THREE.ShaderPass
  private filmGrainPass: THREE.ShaderPass
  private motionBlurPass: THREE.ShaderPass
  
  private config: PostProcessingConfig
  private isInitialized: boolean = false

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: PostProcessingConfig = {}
  ) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.config = config
    this.initialize()
  }

  private initialize(): void {
    if (this.isInitialized) return

    // 創建效果合成器
    this.composer = new THREE.EffectComposer(this.renderer)
    
    // 基礎渲染通道
    this.renderPass = new THREE.RenderPass(this.scene, this.camera)
    this.composer.addPass(this.renderPass)

    // 初始化各種後處理效果
    this.initializeBloom()
    this.initializeChromaticAberration()
    this.initializeVignette()
    this.initializeFilmGrain()
    this.initializeMotionBlur()

    this.isInitialized = true
  }

  private initializeBloom(): void {
    if (!this.config.bloom?.enabled) return

    const { threshold = 0.5, strength = 1.5, radius = 0.5 } = this.config.bloom
    this.bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      strength,
      radius,
      threshold
    )
    this.composer.addPass(this.bloomPass)
  }

  private initializeChromaticAberration(): void {
    if (!this.config.chromaticAberration?.enabled) return

    const chromaticShader = {
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: this.config.chromaticAberration?.offset || 0.003 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          vec4 cr = texture2D(tDiffuse, uv + vec2(offset, 0.0));
          vec4 cg = texture2D(tDiffuse, uv);
          vec4 cb = texture2D(tDiffuse, uv - vec2(offset, 0.0));
          gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
        }
      `
    }

    this.chromaticAberrationPass = new THREE.ShaderPass(chromaticShader)
    this.composer.addPass(this.chromaticAberrationPass)
  }

  private initializeVignette(): void {
    if (!this.config.vignette?.enabled) return

    const vignetteShader = {
      uniforms: {
        tDiffuse: { value: null },
        offset: { value: this.config.vignette?.offset || 1.0 },
        darkness: { value: this.config.vignette?.darkness || 0.5 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float offset;
        uniform float darkness;
        varying vec2 vUv;
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
          float vig = (1.0 - dot(uv, uv)) * darkness;
          vig = clamp(vig, 0.0, 1.0);
          gl_FragColor = texel * (1.0 - vig);
        }
      `
    }

    this.vignettePass = new THREE.ShaderPass(vignetteShader)
    this.composer.addPass(this.vignettePass)
  }

  private initializeFilmGrain(): void {
    if (!this.config.filmGrain?.enabled) return

    const filmGrainShader = {
      uniforms: {
        tDiffuse: { value: null },
        intensity: { value: this.config.filmGrain?.intensity || 0.1 },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float intensity;
        uniform float time;
        varying vec2 vUv;
        
        float random(vec2 co) {
          return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          float noise = random(vUv + time) * intensity;
          gl_FragColor = texel + vec4(noise, noise, noise, 0.0);
        }
      `
    }

    this.filmGrainPass = new THREE.ShaderPass(filmGrainShader)
    this.composer.addPass(this.filmGrainPass)
  }

  private initializeMotionBlur(): void {
    if (!this.config.motionBlur?.enabled) return

    const motionBlurShader = {
      uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        tPreviousDepth: { value: null },
        previousViewProjectionMatrix: { value: new THREE.Matrix4() },
        viewProjectionMatrix: { value: new THREE.Matrix4() },
        samples: { value: this.config.motionBlur?.samples || 32 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform sampler2D tPreviousDepth;
        uniform mat4 previousViewProjectionMatrix;
        uniform mat4 viewProjectionMatrix;
        uniform int samples;
        varying vec2 vUv;
        
        void main() {
          vec4 texel = texture2D(tDiffuse, vUv);
          float depth = texture2D(tDepth, vUv).r;
          float prevDepth = texture2D(tPreviousDepth, vUv).r;
          
          vec4 currentPos = vec4(vUv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
          vec4 worldPos = inverse(viewProjectionMatrix) * currentPos;
          worldPos /= worldPos.w;
          
          vec4 prevPos = previousViewProjectionMatrix * worldPos;
          prevPos /= prevPos.w;
          
          vec2 velocity = (currentPos.xy - prevPos.xy) * 0.5;
          float velocityLength = length(velocity);
          
          vec4 finalColor = texel;
          if (velocityLength > 0.0) {
            for (int i = 1; i < samples; i++) {
              vec2 offset = velocity * (float(i) / float(samples));
              vec2 sampleUv = vUv + offset;
              if (sampleUv.x >= 0.0 && sampleUv.x <= 1.0 && 
                  sampleUv.y >= 0.0 && sampleUv.y <= 1.0) {
                finalColor += texture2D(tDiffuse, sampleUv);
              }
            }
            finalColor /= float(samples);
          }
          
          gl_FragColor = finalColor;
        }
      `
    }

    this.motionBlurPass = new THREE.ShaderPass(motionBlurShader)
    this.composer.addPass(this.motionBlurPass)
  }

  // 更新配置
  updateConfig(newConfig: Partial<PostProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 重新初始化受影響的效果
    if (newConfig.bloom !== undefined) {
      this.updateBloom()
    }
    if (newConfig.chromaticAberration !== undefined) {
      this.updateChromaticAberration()
    }
    if (newConfig.vignette !== undefined) {
      this.updateVignette()
    }
    if (newConfig.filmGrain !== undefined) {
      this.updateFilmGrain()
    }
    if (newConfig.motionBlur !== undefined) {
      this.updateMotionBlur()
    }
  }

  private updateBloom(): void {
    if (this.bloomPass) {
      this.composer.removePass(this.bloomPass)
    }
    if (this.config.bloom?.enabled) {
      this.initializeBloom()
    }
  }

  private updateChromaticAberration(): void {
    if (this.chromaticAberrationPass) {
      this.composer.removePass(this.chromaticAberrationPass)
    }
    if (this.config.chromaticAberration?.enabled) {
      this.initializeChromaticAberration()
    }
  }

  private updateVignette(): void {
    if (this.vignettePass) {
      this.composer.removePass(this.vignettePass)
    }
    if (this.config.vignette?.enabled) {
      this.initializeVignette()
    }
  }

  private updateFilmGrain(): void {
    if (this.filmGrainPass) {
      this.composer.removePass(this.filmGrainPass)
    }
    if (this.config.filmGrain?.enabled) {
      this.initializeFilmGrain()
    }
  }

  private updateMotionBlur(): void {
    if (this.motionBlurPass) {
      this.composer.removePass(this.motionBlurPass)
    }
    if (this.config.motionBlur?.enabled) {
      this.initializeMotionBlur()
    }
  }

  // 渲染場景
  render(): void {
    if (this.isInitialized) {
      this.composer.render()
    } else {
      this.renderer.render(this.scene, this.camera)
    }
  }

  // 更新動態效果
  update(deltaTime: number): void {
    if (this.filmGrainPass && this.filmGrainPass.uniforms.time) {
      this.filmGrainPass.uniforms.time.value += deltaTime
    }
  }

  // 處理視窗大小變化
  onResize(width: number, height: number): void {
    if (this.composer) {
      this.composer.setSize(width, height)
    }
  }

  // 啟用/禁用特定效果
  setEffectEnabled(effect: keyof PostProcessingConfig, enabled: boolean): void {
    const config = { [effect]: { ...this.config[effect], enabled } }
    this.updateConfig(config)
  }

  // 獲取當前配置
  getConfig(): PostProcessingConfig {
    return { ...this.config }
  }

  // 清理資源
  dispose(): void {
    if (this.composer) {
      this.composer.dispose()
    }
    this.isInitialized = false
  }
}
