import { SupportUploadFileTypes, type TransferMethod } from '@/types/app'

export enum FileAppearanceTypeEnum {
  image = 'image',
  video = 'video',
  audio = 'audio',
  document = 'document',
  code = 'code',
  pdf = 'pdf',
  markdown = 'markdown',
  excel = 'excel',
  word = 'word',
  ppt = 'ppt',
  gif = 'gif',
  custom = 'custom',
}
export type EnabledOrDisabled = {
  enabled?: boolean
}
export enum Resolution {
  low = 'low',
  high = 'high',
}
export type FileUploadConfigResponse = {
  batch_count_limit: number
  image_file_size_limit?: number | string // default is 10MB
  file_size_limit: number // default is 15MB
  audio_file_size_limit?: number // default is 50MB
  video_file_size_limit?: number // default is 100MB
  workflow_file_upload_limit?: number // default is 10
}
export type FileUpload = {
  image?: EnabledOrDisabled & {
    detail?: Resolution
    number_limits?: number
    transfer_methods?: TransferMethod[]
  }
  allowed_file_types?: string[]
  allowed_file_extensions?: string[]
  allowed_file_upload_methods?: TransferMethod[]
  number_limits?: number
  fileUploadConfig?: FileUploadConfigResponse
} & EnabledOrDisabled
export type FileAppearanceType = keyof typeof FileAppearanceTypeEnum

export type FileEntity = {
  id: string
  name: string
  size: number
  type: string
  progress: number
  transferMethod: TransferMethod
  supportFileType: string
  originalFile?: File
  uploadedId?: string
  base64Url?: string
  url?: string
  isRemote?: boolean
}

export const FILE_EXTS: Record<string, string[]> = {
  [SupportUploadFileTypes.image]: ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'],
  [SupportUploadFileTypes.document]: ['TXT', 'MD', 'MDX', 'MARKDOWN', 'PDF', 'HTML', 'XLSX', 'XLS', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'],
  [SupportUploadFileTypes.audio]: ['MP3', 'M4A', 'WAV', 'WEBM', 'AMR', 'MPGA'],
  [SupportUploadFileTypes.video]: ['MP4', 'MOV', 'MPEG', 'MPGA'],
}