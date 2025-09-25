import { FigurineGenerateRequest, MultiPoseRequest, ModuleType } from '@/lib/types'

export class PromptTransformService {
  buildFigurineParams(userInput: FigurineGenerateRequest): Record<string, any> {
    const styleMap: Record<string, string[]> = {
      anime: ['anime figure', 'japanese figurine', 'PVC figure'],
      realistic: ['realistic figurine', 'detailed sculpting', 'collectible grade'],
      chibi: ['chibi style', 'cute', 'kawaii', 'super deformed'],
      mecha: ['mecha figure', 'mechanical details', 'mech suit'],
      fantasy: ['fantasy figurine', 'epic', 'ornate'],
    }
    const qualityMap: Record<number, string[]> = {
      60: ['good quality'],
      70: ['high quality'],
      80: ['high quality', 'extremely detailed', 'masterpiece'],
      90: ['masterpiece', 'ultra detailed', '8k'],
      100: ['legendary quality', 'perfect', 'flawless'],
    }
    const styleKey = userInput.style || 'realistic'
    const qualityKey = Math.max(60, Math.min(100, userInput.quality || 80))

    const promptParts = [
      `figurine of ${userInput.description}`,
      ...(styleMap[styleKey] || []),
      ...(qualityMap[qualityKey] || []),
      'professional photography',
      'studio lighting',
    ]

    return {
      prompt: promptParts.join(', '),
      negative_prompt: 'blurry, low quality, distorted, ugly',
      num_inference_steps: this.stepsFromQuality(qualityKey),
      guidance_scale: this.cfgFromQuality(qualityKey),
    }
  }

  buildMultiPoseParams(userInput: MultiPoseRequest): Record<string, any> {
    const poseDescriptions = (userInput.poseTypes || []).map((p) => `${p} pose`)
    const base = [
      'character sheet',
      'multiple poses',
      'different angles',
      userInput.characterFeatures || 'consistent character design',
      ...poseDescriptions,
      'reference sheet style',
    ]
    return {
      prompt: base.join(', '),
      negative_prompt: 'inconsistent character, different person, blurry',
      num_inference_steps: 35,
      guidance_scale: 8.0,
      num_images_per_prompt: userInput.poseCount || 4,
    }
  }

  stepsFromQuality(q: number) {
    if (q >= 95) return 50
    if (q >= 85) return 40
    if (q >= 75) return 35
    return 30
  }

  cfgFromQuality(q: number) {
    if (q >= 95) return 8.5
    if (q >= 85) return 8.0
    if (q >= 75) return 7.5
    return 7.0
  }

  buildSketchControlParams(userInput: { description?: string; controlStrength?: number }): Record<string, any> {
    const s = Math.max(10, Math.min(100, userInput.controlStrength || 70))
    return {
      prompt: [
        'convert sketch to high quality render',
        userInput.description || '',
        `structure adherence ${s}%`,
      ].join(', '),
      negative_prompt: 'blurry, messy lines, off-structure',
      num_inference_steps: this.stepsFromQuality(70),
      guidance_scale: this.cfgFromQuality(80),
    }
  }

  buildImageFusionParams(userInput: { description?: string; fusionStrength?: number }): Record<string, any> {
    const f = Math.max(10, Math.min(100, userInput.fusionStrength || 60))
    return {
      prompt: [
        'image blending, natural fusion',
        userInput.description || '',
        `fusion strength ${f}%`,
      ].join(', '),
      negative_prompt: 'artifacts, ghosting, mismatched lighting',
      num_inference_steps: 35,
      guidance_scale: 7.5,
    }
  }

  buildObjectReplaceParams(userInput: { description?: string }): Record<string, any> {
    return {
      prompt: ['replace selected object with', userInput.description || 'target object', 'seamless integration'].join(', '),
      negative_prompt: 'halo, mismatch lighting, wrong perspective',
      num_inference_steps: 30,
      guidance_scale: 7.5,
    }
  }

  buildIdPhotosParams(userInput: { size?: string; background?: string }): Record<string, any> {
    return {
      prompt: [
        'generate ID photo grid',
        userInput.size || '33x48mm',
        `background ${userInput.background || 'blue'}`,
        'clean portrait, frontal, neutral expression',
      ].join(', '),
      negative_prompt: 'smile, tilt head, busy background',
      num_inference_steps: 30,
      guidance_scale: 7.2,
    }
  }

  buildGroupPhotoParams(userInput: { description?: string }): Record<string, any> {
    return {
      prompt: ['composite group photo', userInput.description || '', 'consistent lighting and scale'].join(', '),
      negative_prompt: 'mismatched proportions, duplicate faces',
      num_inference_steps: 35,
      guidance_scale: 7.8,
    }
  }

  buildMultiCameraParams(userInput: { description?: string; angles?: string[] }): Record<string, any> {
    const a = (userInput.angles || []).join(' | ')
    return {
      prompt: ['multi-angle render', userInput.description || '', a && `angles: ${a}`].filter(Boolean).join(', '),
      negative_prompt: 'inconsistent scene details across angles',
      num_inference_steps: 35,
      guidance_scale: 8.0,
    }
  }

  buildSocialCoverParams(userInput: { platform?: string; title?: string; subtitle?: string; style?: string }): Record<string, any> {
    const platformSize: Record<string, string> = {
      youtube: '1280x720',
      instagram: '1080x1080',
      facebook: '820x312',
      twitter: '1500x500',
      linkedin: '1584x396',
    }
    const size = platformSize[userInput.platform || 'youtube']
    return {
      prompt: [
        'social media cover design',
        `size ${size}`,
        userInput.title || '',
        userInput.subtitle || '',
        userInput.style || 'modern minimal',
        'high contrast, readable typography',
      ].join(', '),
      negative_prompt: 'low contrast, unreadable text, cluttered',
      num_inference_steps: 28,
      guidance_scale: 7.3,
    }
  }

  buildStandardParams(userInput: { description?: string; style?: string; count?: number; referenceImage?: string }): Record<string, any> {
    // 翻译中文style
    const translateStyle = (style: string) => {
      const styleTranslations: Record<string, string> = {
        '卡通风格': 'cartoon style',
        '动漫风格': 'anime style',
        '写实风格': 'realistic style',
        '油画风格': 'oil painting style',
        '水彩风格': 'watercolor style',
        '素描风格': 'sketch style',
        '抽象风格': 'abstract style',
        '现代风格': 'modern style',
        '古典风格': 'classical style',
        '未来风格': 'futuristic style'
      };
      return styleTranslations[style] || style;
    };

    // 翻译中文描述
    const translateDescription = (description: string) => {
      if (!description) return 'high quality image';
      
      const descriptionTranslations: Record<string, string> = {
        '一只可爱的小猫咪在花园里玩耍': 'a cute kitten playing in a garden',
        '美丽的风景画': 'beautiful landscape painting',
        '现代城市夜景': 'modern city night view',
        '古典建筑': 'classical architecture',
        '抽象艺术': 'abstract art',
        '可爱的': 'cute',
        '美丽的': 'beautiful',
        '漂亮的': 'pretty',
        '小猫咪': 'kitten',
        '小狗': 'puppy',
        '花园': 'garden',
        '玩耍': 'playing',
        '风景': 'landscape',
        '夜景': 'night view',
        '城市': 'city',
        '建筑': 'architecture'
      };
      
      let translatedDescription = description;
      
      // 替换已知的中文词汇
      for (const [chinese, english] of Object.entries(descriptionTranslations)) {
        translatedDescription = translatedDescription.replace(new RegExp(chinese, 'g'), english);
      }
      
      // 如果仍然包含中文字符，检测并提供通用翻译
      const chineseRegex = /[\u4e00-\u9fff]/;
      if (chineseRegex.test(translatedDescription)) {
        console.log('⚠️ 检测到未翻译的中文描述，使用通用英文描述');
        return 'beautiful and detailed artwork, high quality, masterpiece';
      }
      
      return translatedDescription;
    };

    const parts = [
       translateDescription(userInput.description || ''),
       userInput.style && `${translateStyle(userInput.style)}`,
       'balanced composition, detailed, clean lighting',
     ].filter(Boolean)
    
    const result = {
      prompt: parts.join(', '),
      negative_prompt: 'low quality, blurry, artifacts',
      num_inference_steps: 30,
      guidance_scale: 7.5,
      num_images_per_prompt: Math.min(4, Math.max(1, userInput.count || 1)),
    }
    
    // 如果有参考图片，将其传递给结果
    if (userInput.referenceImage) {
      (result as any).referenceImage = userInput.referenceImage
    }
    
    return result
  }
}


