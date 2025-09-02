import * as THREE from 'three'
import { ArtResourceManager } from '../art/ArtResourceManager'
import { ArtSettingsPanel } from '../ui/ArtSettingsPanel'

export class ArtSystemExample {
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private camera: THREE.Camera
  private artManager: ArtResourceManager
  private settingsPanel: ArtSettingsPanel
  private clock: THREE.Clock
  private meshes: THREE.Mesh[] = []

  constructor(container: HTMLElement) {
    this.initializeScene(container)
    this.initializeArtSystem()
    this.createExampleObjects()
    this.setupEventListeners()
    this.animate()
  }

  private initializeScene(container: HTMLElement): void {
    // 創建場景
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0b0f1a)

    // 創建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    // 創建相機
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 5, 10)
    this.camera.lookAt(0, 0, 0)

    // 創建時鐘
    this.clock = new THREE.Clock()

    // 處理視窗大小變化
    window.addEventListener('resize', () => this.onResize(container))
  }

  private async initializeArtSystem(): Promise<void> {
    // 創建美術資源管理器
    this.artManager = new ArtResourceManager(
      this.scene,
      this.renderer,
      this.camera,
      {
        enableTextures: true,
        enableParticles: true,
        enableAdvancedLighting: true,
        enablePostProcessing: true,
        textureQuality: 'medium',
        particleCount: 'medium',
        shadowQuality: 'medium'
      }
    )

    // 等待美術系統初始化完成
    while (!this.artManager.isReady()) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 創建設置面板
    this.settingsPanel = new ArtSettingsPanel(this.artManager)

    console.log('Art system initialized successfully')
  }

  private createExampleObjects(): void {
    // 創建地面
    const groundGeometry = new THREE.PlaneGeometry(20, 20)
    const groundMaterial = this.artManager.createGroundMaterial('base')
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
    this.meshes.push(ground)

    // 創建地磚圖案
    this.createGroundTiles()

    // 創建各種方塊
    this.createExampleBlocks()

    // 創建玩家角色
    this.createPlayer()

    // 創建炸彈
    this.createBomb()

    // 創建牆壁
    this.createWalls()

    // 添加動態光源
    this.createDynamicLights()
  }

  private createGroundTiles(): void {
    const tileGeometry = new THREE.BoxGeometry(1, 0.05, 1)
    
    for (let x = -10; x < 10; x++) {
      for (let z = -10; z < 10; z++) {
        const tileType = (x + z) % 2 === 0 ? 'tile1' : 'tile2'
        const tileMaterial = this.artManager.createGroundMaterial(tileType)
        const tile = new THREE.Mesh(tileGeometry, tileMaterial)
        
        tile.position.set(x, 0.025, z)
        tile.receiveShadow = true
        this.scene.add(tile)
        this.meshes.push(tile)
      }
    }
  }

  private createExampleBlocks(): void {
    const blockTypes: Array<'brick' | 'stone' | 'wood' | 'metal' | 'cracked'> = [
      'brick', 'stone', 'wood', 'metal', 'cracked'
    ]

    blockTypes.forEach((type, index) => {
      const blockGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
      const blockMaterial = this.artManager.createBlockMaterial(type)
      const block = new THREE.Mesh(blockGeometry, blockMaterial)
      
      block.position.set(-8 + index * 2, 0.4, -5)
      block.castShadow = true
      block.receiveShadow = true
      this.scene.add(block)
      this.meshes.push(block)
    })
  }

  private createPlayer(): void {
    const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32)
    const playerMaterial = this.artManager.createPlayerMaterial()
    const player = new THREE.Mesh(playerGeometry, playerMaterial)
    
    player.position.set(0, 0.5, 0)
    player.castShadow = true
    this.scene.add(player)
    this.meshes.push(player)

    // 添加發光效果
    const glowGeometry = new THREE.SphereGeometry(0.6, 32, 32)
    const glowMaterial = this.artManager.getMaterialFactory()?.createGlowMaterial(0x6ee7ff, 0.3)
    if (glowMaterial) {
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.copy(player.position)
      this.scene.add(glow)
      this.meshes.push(glow)
    }
  }

  private createBomb(): void {
    const bombGeometry = new THREE.SphereGeometry(0.3, 24, 24)
    const bombMaterial = this.artManager.createBombMaterial()
    const bomb = new THREE.Mesh(bombGeometry, bombMaterial)
    
    bomb.position.set(5, 0.3, 0)
    bomb.castShadow = true
    this.scene.add(bomb)
    this.meshes.push(bomb)

    // 添加引信
    const fuseGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4)
    const fuseMaterial = this.artManager.getMaterialFactory()?.createMaterial('BOMB', undefined, 0x8b4513)
    if (fuseMaterial) {
      const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial)
      fuse.position.set(5, 0.7, 0)
      this.scene.add(fuse)
      this.meshes.push(fuse)
    }
  }

  private createWalls(): void {
    const wallGeometry = new THREE.BoxGeometry(20, 2, 0.5)
    const wallMaterial = this.artManager.createWallMaterial('stone')
    
    // 北牆
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial)
    northWall.position.set(0, 1, -10)
    northWall.castShadow = false
    northWall.receiveShadow = true
    this.scene.add(northWall)
    this.meshes.push(northWall)

    // 南牆
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial)
    southWall.position.set(0, 1, 10)
    southWall.castShadow = false
    southWall.receiveShadow = true
    this.scene.add(southWall)
    this.meshes.push(southWall)

    // 東牆
    const eastWallGeometry = new THREE.BoxGeometry(0.5, 2, 20)
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial)
    eastWall.position.set(10, 1, 0)
    eastWall.castShadow = false
    eastWall.receiveShadow = true
    this.scene.add(eastWall)
    this.meshes.push(eastWall)

    // 西牆
    const westWall = new THREE.Mesh(eastWallGeometry, wallMaterial)
    westWall.position.set(-10, 1, 0)
    westWall.castShadow = false
    westWall.receiveShadow = true
    this.scene.add(westWall)
    this.meshes.push(westWall)
  }

  private createDynamicLights(): void {
    // 創建脈衝光源
    this.artManager.createPulseLight('pulse1', new THREE.Vector3(-5, 3, 5), {
      color: 0xff6b6b,
      intensity: 2.0,
      distance: 8,
      pulseSpeed: 3.0,
      pulseIntensity: 0.5
    })

    // 創建移動光源
    this.artManager.createMovingLight(
      'moving1',
      new THREE.Vector3(-5, 2, -5),
      new THREE.Vector3(5, 2, -5),
      4.0,
      {
        color: 0x4ecdc4,
        intensity: 1.5,
        distance: 6
      }
    )
  }

  private setupEventListeners(): void {
    // 點擊事件 - 創建爆炸效果
    this.renderer.domElement.addEventListener('click', (event) => {
      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, this.camera)

      const intersects = raycaster.intersectObjects(this.meshes)
      if (intersects.length > 0) {
        const point = intersects[0].point
        this.artManager.createExplosionEffect(point, 1.5)
      }
    })

    // 鍵盤事件
    document.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'e':
          // 創建爆炸效果
          this.artManager.createExplosionEffect(new THREE.Vector3(0, 1, 0), 2.0)
          break
        case 'f':
          // 創建火焰效果
          this.artManager.createFireEffect(new THREE.Vector3(0, 1, 0), 1.0)
          break
        case 's':
          // 創建火花效果
          this.artManager.createSparkEffect(
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(1, 0, 0),
            1.0
          )
          break
        case 't':
          // 創建軌跡效果
          this.artManager.createTrailEffect(
            new THREE.Vector3(-5, 1, 0),
            new THREE.Vector3(5, 1, 0),
            1.0
          )
          break
        case 'd':
          // 切換晝夜循環
          this.artManager.setupDayNightCycle(30)
          break
      }
    })
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta()
    const elapsedTime = this.clock.getElapsedTime()

    // 更新美術系統
    this.artManager.update(deltaTime)

    // 動畫物體
    this.animateObjects(elapsedTime)

    // 渲染場景
    this.artManager.render()
  }

  private animateObjects(elapsedTime: number): void {
    // 旋轉方塊
    this.meshes.forEach((mesh, index) => {
      if (index >= 6 && index < 11) { // 方塊範圍
        mesh.rotation.y = elapsedTime * 0.5
        mesh.position.y = 0.4 + Math.sin(elapsedTime * 2 + index) * 0.1
      }
    })

    // 玩家浮動
    const player = this.meshes[5] // 玩家索引
    if (player) {
      player.position.y = 0.5 + Math.sin(elapsedTime * 3) * 0.1
      player.rotation.y = elapsedTime * 2
    }

    // 炸彈搖擺
    const bomb = this.meshes[11] // 炸彈索引
    if (bomb) {
      bomb.rotation.z = Math.sin(elapsedTime * 4) * 0.1
    }
  }

  private onResize(container: HTMLElement): void {
    const width = container.clientWidth
    const height = container.clientHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.artManager.onResize(width, height)
  }

  // 公共方法
  public getArtManager(): ArtResourceManager {
    return this.artManager
  }

  public getSettingsPanel(): ArtSettingsPanel {
    return this.settingsPanel
  }

  public dispose(): void {
    this.artManager.dispose()
    this.settingsPanel.dispose()
    
    this.meshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose())
        } else {
          mesh.material.dispose()
        }
      }
    })

    this.renderer.dispose()
  }
}
