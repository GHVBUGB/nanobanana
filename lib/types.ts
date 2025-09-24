export type ModuleType =
  | 'figurine'
  | 'multi-pose'
  | 'sketch-control'
  | 'image-fusion'
  | 'social-cover'
  | 'object-replace'
  | 'id-photos'
  | 'group-photo'
  | 'multi-camera'

export interface APIResponse<T> {
  code: number
  message: string
  data: T
  timestamp: number
  requestId: string
}

export interface GenerateResponse {
  taskId: string
  estimatedTime: number
  images: string[]
  usedPrompt: string
  parameters: Record<string, unknown>
}

export type TaskStatusValue = 'pending' | 'processing' | 'completed' | 'failed'

export interface TaskStatus {
  taskId: string
  status: TaskStatusValue
  progress: number
  result?: GenerateResponse
  error?: string
  logs?: string[]
}

// Requests (subset per PRD; others accept generic payload)
export interface FigurineGenerateRequest {
  description: string
  style: string
  quality: number
  referenceImage?: string
  additionalOptions?: {
    backgroundColor?: string
    lighting?: string
    angle?: string
  }
}

export interface MultiPoseRequest {
  referenceImage?: string
  characterFeatures?: string
  poseCount: number
  poseTypes: string[]
  maintainStyle?: boolean
}




