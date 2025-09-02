import { ArtResourceManager, ArtResourceConfig } from '../art/ArtResourceManager'

export class ArtSettingsPanel {
  private container: HTMLDivElement
  private artManager: ArtResourceManager
  private isVisible: boolean = false

  constructor(artManager: ArtResourceManager) {
    this.artManager = artManager
    this.createPanel()
  }

  private createPanel(): void {
    // 創建主容器
    this.container = document.createElement('div')
    this.container.className = 'art-settings-panel'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #6ee7ff;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      backdrop-filter: blur(10px);
    `

    // 創建標題
    const title = document.createElement('h3')
    title.textContent = '🎨 美術設置'
    title.style.cssText = `
      margin: 0 0 20px 0;
      color: #6ee7ff;
      text-align: center;
      font-size: 18px;
    `
    this.container.appendChild(title)

    // 創建設置選項
    this.createTextureSettings()
    this.createParticleSettings()
    this.createLightingSettings()
    this.createPostProcessingSettings()
    this.createQualitySettings()

    // 創建按鈕
    this.createButtons()

    // 添加到頁面
    document.body.appendChild(this.container)

    // 創建切換按鈕
    this.createToggleButton()
  }

  private createTextureSettings(): void {
    const section = this.createSection('紋理設置')
    
    // 啟用紋理
    const enableTextures = this.createCheckbox(
      '啟用紋理',
      this.artManager.getConfig().enableTextures,
      (checked) => {
        this.artManager.updateConfig({ enableTextures: checked })
      }
    )
    section.appendChild(enableTextures)

    // 紋理質量
    const textureQuality = this.createSelect(
      '紋理質量',
      ['low', 'medium', 'high'],
      this.artManager.getConfig().textureQuality,
      (value) => {
        this.artManager.updateConfig({ textureQuality: value as any })
      }
    )
    section.appendChild(textureQuality)

    this.container.appendChild(section)
  }

  private createParticleSettings(): void {
    const section = this.createSection('粒子效果')
    
    // 啟用粒子
    const enableParticles = this.createCheckbox(
      '啟用粒子',
      this.artManager.getConfig().enableParticles,
      (checked) => {
        this.artManager.updateConfig({ enableParticles: checked })
      }
    )
    section.appendChild(enableParticles)

    // 粒子數量
    const particleCount = this.createSelect(
      '粒子數量',
      ['low', 'medium', 'high'],
      this.artManager.getConfig().particleCount,
      (value) => {
        this.artManager.updateConfig({ particleCount: value as any })
      }
    )
    section.appendChild(particleCount)

    this.container.appendChild(section)
  }

  private createLightingSettings(): void {
    const section = this.createSection('光照設置')
    
    // 啟用高級光照
    const enableLighting = this.createCheckbox(
      '高級光照',
      this.artManager.getConfig().enableAdvancedLighting,
      (checked) => {
        this.artManager.updateConfig({ enableAdvancedLighting: checked })
      }
    )
    section.appendChild(enableLighting)

    // 陰影質量
    const shadowQuality = this.createSelect(
      '陰影質量',
      ['low', 'medium', 'high'],
      this.artManager.getConfig().shadowQuality,
      (value) => {
        this.artManager.updateConfig({ shadowQuality: value as any })
      }
    )
    section.appendChild(shadowQuality)

    // 晝夜循環按鈕
    const dayNightButton = this.createButton('🌅 晝夜循環', () => {
      this.artManager.setupDayNightCycle(60)
    })
    section.appendChild(dayNightButton)

    this.container.appendChild(section)
  }

  private createPostProcessingSettings(): void {
    const section = this.createSection('後處理效果')
    
    // 啟用後處理
    const enablePostProcessing = this.createCheckbox(
      '啟用後處理',
      this.artManager.getConfig().enablePostProcessing,
      (checked) => {
        this.artManager.updateConfig({ enablePostProcessing: checked })
      }
    )
    section.appendChild(enablePostProcessing)

    // 後處理配置按鈕
    const postProcessingButton = this.createButton('⚙️ 後處理配置', () => {
      this.showPostProcessingConfig()
    })
    section.appendChild(postProcessingButton)

    this.container.appendChild(section)
  }

  private createQualitySettings(): void {
    const section = this.createSection('質量預設')
    
    // 低質量
    const lowQualityButton = this.createButton('🟢 低質量', () => {
      this.setQualityPreset('low')
    })
    section.appendChild(lowQualityButton)

    // 中等質量
    const mediumQualityButton = this.createButton('🟡 中等質量', () => {
      this.setQualityPreset('medium')
    })
    section.appendChild(mediumQualityButton)

    // 高質量
    const highQualityButton = this.createButton('🔴 高質量', () => {
      this.setQualityPreset('high')
    })
    section.appendChild(highQualityButton)

    this.container.appendChild(section)
  }

  private createButtons(): void {
    const buttonSection = this.createSection('')
    
    // 重置按鈕
    const resetButton = this.createButton('🔄 重置設置', () => {
      this.resetToDefaults()
    })
    buttonSection.appendChild(resetButton)

    // 應用按鈕
    const applyButton = this.createButton('✅ 應用設置', () => {
      this.applySettings()
    })
    buttonSection.appendChild(applyButton)

    this.container.appendChild(buttonSection)
  }

  private createToggleButton(): void {
    const toggleButton = document.createElement('button')
    toggleButton.innerHTML = '🎨'
    toggleButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #6ee7ff;
      border-radius: 50%;
      color: #6ee7ff;
      font-size: 20px;
      cursor: pointer;
      z-index: 999;
      transition: all 0.3s ease;
    `

    toggleButton.addEventListener('click', () => {
      this.toggle()
    })

    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.background = 'rgba(110, 231, 255, 0.2)'
    })

    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.background = 'rgba(0, 0, 0, 0.8)'
    })

    document.body.appendChild(toggleButton)
  }

  private createSection(title: string): HTMLDivElement {
    const section = document.createElement('div')
    section.style.cssText = `
      margin-bottom: 20px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
    `

    if (title) {
      const sectionTitle = document.createElement('h4')
      sectionTitle.textContent = title
      sectionTitle.style.cssText = `
        margin: 0 0 15px 0;
        color: #6ee7ff;
        font-size: 14px;
      `
      section.appendChild(sectionTitle)
    }

    return section
  }

  private createCheckbox(label: string, checked: boolean, onChange: (checked: boolean) => void): HTMLDivElement {
    const container = document.createElement('div')
    container.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    `

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = checked
    checkbox.style.cssText = `
      margin-right: 10px;
      transform: scale(1.2);
    `

    const labelElement = document.createElement('label')
    labelElement.textContent = label
    labelElement.style.cssText = `
      font-size: 14px;
      cursor: pointer;
    `

    checkbox.addEventListener('change', () => {
      onChange(checkbox.checked)
    })

    container.appendChild(checkbox)
    container.appendChild(labelElement)
    return container
  }

  private createSelect(label: string, options: string[], value: string, onChange: (value: string) => void): HTMLDivElement {
    const container = document.createElement('div')
    container.style.cssText = `
      margin-bottom: 10px;
    `

    const labelElement = document.createElement('label')
    labelElement.textContent = label
    labelElement.style.cssText = `
      display: block;
      margin-bottom: 5px;
      font-size: 14px;
      color: #cccccc;
    `

    const select = document.createElement('select')
    select.style.cssText = `
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid #6ee7ff;
      border-radius: 4px;
      color: white;
      font-size: 14px;
    `

    options.forEach(option => {
      const optionElement = document.createElement('option')
      optionElement.value = option
      optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1)
      if (option === value) {
        optionElement.selected = true
      }
      select.appendChild(optionElement)
    })

    select.addEventListener('change', () => {
      onChange(select.value)
    })

    container.appendChild(labelElement)
    container.appendChild(select)
    return container
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button')
    button.textContent = text
    button.style.cssText = `
      width: 100%;
      padding: 10px;
      margin-bottom: 10px;
      background: rgba(110, 231, 255, 0.2);
      border: 1px solid #6ee7ff;
      border-radius: 4px;
      color: #6ee7ff;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    `

    button.addEventListener('click', onClick)
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(110, 231, 255, 0.3)'
    })
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(110, 231, 255, 0.2)'
    })

    return button
  }

  private showPostProcessingConfig(): void {
    const config = this.artManager.getPostProcessingManager()?.getConfig()
    if (!config) return

    // 創建後處理配置彈窗
    const modal = document.createElement('div')
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
    `

    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #6ee7ff;
      border-radius: 10px;
      padding: 30px;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
    `

    modalContent.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #6ee7ff;">後處理配置</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">Bloom效果</label>
        <input type="checkbox" ${config.bloom?.enabled ? 'checked' : ''} id="bloom-enabled">
        <label style="margin-left: 5px;">啟用</label>
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">色差效果</label>
        <input type="checkbox" ${config.chromaticAberration?.enabled ? 'checked' : ''} id="chromatic-enabled">
        <label style="margin-left: 5px;">啟用</label>
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">暗角效果</label>
        <input type="checkbox" ${config.vignette?.enabled ? 'checked' : ''} id="vignette-enabled">
        <label style="margin-left: 5px;">啟用</label>
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">顆粒效果</label>
        <input type="checkbox" ${config.filmGrain?.enabled ? 'checked' : ''} id="grain-enabled">
        <label style="margin-left: 5px;">啟用</label>
      </div>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px;">運動模糊</label>
        <input type="checkbox" ${config.motionBlur?.enabled ? 'checked' : ''} id="motionblur-enabled">
        <label style="margin-left: 5px;">啟用</label>
      </div>
      <div style="text-align: center;">
        <button id="apply-post-processing" style="
          padding: 10px 20px;
          background: #6ee7ff;
          border: none;
          border-radius: 4px;
          color: black;
          cursor: pointer;
          margin-right: 10px;
        ">應用</button>
        <button id="close-post-processing" style="
          padding: 10px 20px;
          background: #666;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
        ">關閉</button>
      </div>
    `

    modal.appendChild(modalContent)
    document.body.appendChild(modal)

    // 事件處理
    document.getElementById('apply-post-processing')?.addEventListener('click', () => {
      const newConfig = {
        bloom: { enabled: (document.getElementById('bloom-enabled') as HTMLInputElement).checked },
        chromaticAberration: { enabled: (document.getElementById('chromatic-enabled') as HTMLInputElement).checked },
        vignette: { enabled: (document.getElementById('vignette-enabled') as HTMLInputElement).checked },
        filmGrain: { enabled: (document.getElementById('grain-enabled') as HTMLInputElement).checked },
        motionBlur: { enabled: (document.getElementById('motionblur-enabled') as HTMLInputElement).checked }
      }
      
      this.artManager.updatePostProcessing(newConfig)
      document.body.removeChild(modal)
    })

    document.getElementById('close-post-processing')?.addEventListener('click', () => {
      document.body.removeChild(modal)
    })
  }

  private setQualityPreset(quality: 'low' | 'medium' | 'high'): void {
    const presets = {
      low: {
        textureQuality: 'low',
        particleCount: 'low',
        shadowQuality: 'low',
        enablePostProcessing: false
      },
      medium: {
        textureQuality: 'medium',
        particleCount: 'medium',
        shadowQuality: 'medium',
        enablePostProcessing: true
      },
      high: {
        textureQuality: 'high',
        particleCount: 'high',
        shadowQuality: 'high',
        enablePostProcessing: true
      }
    }

    this.artManager.updateConfig(presets[quality])
    this.refreshUI()
  }

  private resetToDefaults(): void {
    this.artManager.updateConfig({
      enableTextures: true,
      enableParticles: true,
      enableAdvancedLighting: true,
      enablePostProcessing: true,
      textureQuality: 'medium',
      particleCount: 'medium',
      shadowQuality: 'medium'
    })
    this.refreshUI()
  }

  private applySettings(): void {
    // 設置已經實時應用了，這裡可以添加確認提示
    alert('設置已應用！')
  }

  private refreshUI(): void {
    // 重新創建UI以反映新的設置
    this.container.innerHTML = ''
    this.createPanel()
  }

  // 顯示/隱藏面板
  toggle(): void {
    this.isVisible = !this.isVisible
    if (this.isVisible) {
      this.container.style.transform = 'translateX(0)'
    } else {
      this.container.style.transform = 'translateX(100%)'
    }
  }

  // 顯示面板
  show(): void {
    this.isVisible = true
    this.container.style.transform = 'translateX(0)'
  }

  // 隱藏面板
  hide(): void {
    this.isVisible = false
    this.container.style.transform = 'translateX(100%)'
  }

  // 清理資源
  dispose(): void {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}
