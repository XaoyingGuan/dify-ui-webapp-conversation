'use client'

import type { ChangeEvent, FC } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fileUpload, getFileExtension } from './utils'
import type { FileEntity } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Toast from '@/app/components/base/toast'

type UploaderProps = {
  children: (hovering: boolean) => JSX.Element
  onUpload: (file: FileEntity) => void
  limit?: number
  disabled?: boolean
}

const Uploader: FC<UploaderProps> = ({
  children,
  onUpload,
  disabled,
}) => {
  const [hovering, setHovering] = useState(false)
  const { notify } = Toast
  const { t } = useTranslation()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file)
      return


    const reader = new FileReader()
    reader.addEventListener(
      'load',
      () => {
        const fileEntity = {
          id: `${Date.now()}`,
          name: file.name,
          size: file.size,
          progress: 0,
          type: getFileExtension(file.name, '', false),
          transferMethod: TransferMethod.local_file,
          supportFileType: '*.*',
          originalFile: file,
          uploadedId: '',
          base64Url: '',
          url: '',
          isRemote: false

        }
        onUpload(fileEntity)
        fileUpload({
          file: fileEntity.originalFile,
          onProgressCallback: (progress) => {
            onUpload({ ...fileEntity, progress })
          },
          onSuccessCallback: (res) => {
            onUpload({ ...fileEntity, uploadedId: res.id, progress: 100 })
          },
          onErrorCallback: () => {
            notify({ type: 'error', message: t('common.imageUploader.uploadFromComputerUploadError') })
            onUpload({ ...fileEntity, progress: -1 })
          },
        })
      },
      false,
    )
    reader.addEventListener(
      'error',
      () => {
        notify({ type: 'error', message: t('common.imageUploader.uploadFromComputerReadError') })
      },
      false,
    )
    reader.readAsDataURL(file)
  }

  return (
    <div
      className='relative'
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children(hovering)}
      <input
        className={`
          absolute block inset-0 opacity-0 text-[0] w-full
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={e => (e.target as HTMLInputElement).value = ''}
        type='file'
        accept='*.*'
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  )
}

export default Uploader
