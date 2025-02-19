'use client'
import type { FC } from 'react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TemplateVarPanel, { PanelTitle, VarOpBtnGroup } from '../value-panel'
import s from './style.module.css'
import { AppInfoComp, ChatBtn, EditBtn, FootLogo, PromptTemplate } from './massive-component'
import { PromptVariable, TransferMethod, type AppInfo, type PromptConfig } from '@/types/app'
import { FileUpload, type FileEntity } from '@/app/components/base/file-uploader/types'
import Toast from '@/app/components/base/toast'
import Select from '@/app/components/base/select'
import { DEFAULT_VALUE_MAX_LEN } from '@/config'

import FileUploaderInAttachmentWrapper from '@/app/components/base/file-uploader/file-uploader-in-attachment'
// regex to match the {{}} and replace it with a span
const regex = /\{\{([^}]+)\}\}/g

export type IWelcomeProps = {
  conversationName: string
  hasSetInputs: boolean
  isPublicVersion: boolean
  siteInfo: AppInfo
  promptConfig: PromptConfig
  onStartChat: (inputs: Record<string, any>) => void
  canEditInputs: boolean
  savedInputs: Record<string, any>
  onInputsChange: (inputs: Record<string, any>) => void
}

const Welcome: FC<IWelcomeProps> = ({
  conversationName,
  hasSetInputs,
  isPublicVersion,
  siteInfo,
  promptConfig,
  onStartChat,
  canEditInputs,
  savedInputs,
  onInputsChange,
}) => {
  const { t } = useTranslation()
  const hasVar = promptConfig.prompt_variables.length > 0
  const [isFold, setIsFold] = useState<boolean>(true)
  if (!savedInputs) {
    savedInputs = {}
    onInputsChange(savedInputs)
  }
  if (promptConfig) {
    promptConfig.prompt_variables.forEach((item) => {
      if (item.type === 'number') {
        if (!savedInputs[item.key])
          savedInputs[item.key] = 0
      } else if (item.type === 'file' || item.type === 'file-list') {
        if (!savedInputs[item.key])
          savedInputs[item.key] = []
      } else {
        if (!savedInputs[item.key])
          savedInputs[item.key] = ''
      }

    })

  }



  const [inputed, setInputed] = useState<boolean>(false)
  const handleInputChanged = (key: string, value: any) => {
    savedInputs[key] = value
    setInputed(!inputed)
    onInputsChange(savedInputs)
  }
  const highLightPromoptTemplate = (() => {
    if (!promptConfig)
      return ''
    const res = promptConfig.prompt_template.replace(regex, (match, p1) => {
      return `<span class='text-gray-800 font-bold'>${savedInputs?.[p1] ? savedInputs?.[p1] : match}</span>`
    })
    return res
  })()

  const { notify } = Toast
  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const renderHeader = () => {
    return (
      <div className='absolute top-0 left-0 right-0 flex items-center justify-between border-b border-gray-100 mobile:h-12 tablet:h-16 px-8 bg-white'>
        <div className='text-gray-900'>{conversationName}</div>
      </div>
    )
  }

  const renderInputs = () => {

    const renderFile = (item: PromptVariable) => {
      const fileConfig: FileUpload = {
        allowed_file_types: item.payload ? item.payload['allowed_file_types'] : [],
        allowed_file_extensions: item.payload ? item.payload['allowed_file_extensions'] : [],
        allowed_file_upload_methods: [TransferMethod.local_file],
        number_limits: 1
      }
      return (<FileUploaderInAttachmentWrapper
        fileConfig={fileConfig}
        value={savedInputs[item.key] ? savedInputs[item.key] : []}
        onChange={files => { handleInputChanged(item.key, files) }}>

      </FileUploaderInAttachmentWrapper>)
    }

    const renderFiles = (item: PromptVariable) => {
      const onFilesChanged = (files: FileEntity[]) => {
        handleInputChanged(item.key, files)
      }
      const fileConfig: FileUpload = {
        allowed_file_types: item.payload ? item.payload['allowed_file_types'] : [],
        allowed_file_extensions: item.payload ? item.payload['allowed_file_extensions'] : [],
        allowed_file_upload_methods: [TransferMethod.local_file],
        number_limits: item.payload ? (item.payload.number_limits ? item.payload.number_limits : 2) : 2
      }
      return (<FileUploaderInAttachmentWrapper
        fileConfig={fileConfig}
        value={savedInputs[item.key] ? savedInputs[item.key] : []}
        onChange={onFilesChanged}>

      </FileUploaderInAttachmentWrapper>)
    }
    return (
      <div className='space-y-3'>
        {promptConfig.prompt_variables.map(item => (
          <div className='tablet:flex items-start mobile:space-y-2 tablet:space-y-0 mobile:text-xs tablet:text-sm' key={item.key}>
            <label className={`flex-shrink-0 flex items-center tablet:leading-9 mobile:text-gray-700 tablet:text-gray-900 mobile:font-medium pc:font-normal ${s.formLabel}`}>{item.name}</label>
            {item.type === 'select'
              && (
                <Select
                  className='w-full'
                  defaultValue={savedInputs?.[item.key]}
                  onSelect={(i) => { handleInputChanged(item.key, i.value) }}
                  items={(item.options || []).map(i => ({ name: i, value: i }))}
                  allowSearch={false}
                  bgClassName='bg-gray-50'
                />
              )}
            {item.type === 'string' && (
              <input
                placeholder={`${item.name}${!item.required ? `(${t('app.variableTable.optional')})` : ''}`}
                value={savedInputs?.[item.key] || ''}
                onChange={(e) => { handleInputChanged(item.key, e.target.value) }}
                className={'w-full flex-grow py-2 pl-3 pr-3 box-border rounded-lg bg-gray-50'}
                maxLength={item.max_length || DEFAULT_VALUE_MAX_LEN}
              />
            )}
            {item.type === 'paragraph' && (
              <textarea
                className="w-full h-[104px] flex-grow py-2 pl-3 pr-3 box-border rounded-lg bg-gray-50"
                placeholder={`${item.name}${!item.required ? `(${t('app.variableTable.optional')})` : ''}`}
                value={savedInputs?.[item.key] || ''}
                onChange={(e) => { handleInputChanged(item.key, e.target.value) }}
              />
            )}
            {item.type === 'number' && (
              <input
                type="number"
                className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 "
                value={savedInputs[item.key]}
                onChange={(e) => { handleInputChanged(item.key, e.target.value) }}
              />
            )}
            {item.type === 'file' && (
              renderFile(item)
            )}
            {item.type === 'file-list' && (
              renderFiles(item)
            )}

          </div>
        ))
        }
      </div >
    )
  }

  const canChat = () => {
    const inputLens = Object.values(savedInputs).length
    const promptVariablesLens = promptConfig.prompt_variables.length
    let emptyInput = inputLens < promptVariablesLens
    if (!emptyInput) {
      for (var i = 0; i < promptVariablesLens; i++) {
        if (promptConfig.prompt_variables[i].required) {
          if (savedInputs[promptConfig.prompt_variables[i].key] === '') {
            emptyInput = true
          }
        }
      }
    }
    if (emptyInput) {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  const handleChat = () => {
    if (!canChat())
      return

    onStartChat(savedInputs)
  }

  const renderNoVarPanel = () => {
    if (isPublicVersion) {
      return (
        <div>
          <AppInfoComp siteInfo={siteInfo} />
          <TemplateVarPanel
            isFold={false}
            header={
              <>
                <PanelTitle
                  title={t('app.chat.publicPromptConfigTitle')}
                  className='mb-1'
                />
                <PromptTemplate html={highLightPromoptTemplate} />
              </>
            }
          >
            <ChatBtn onClick={handleChat} />
          </TemplateVarPanel>
        </div>
      )
    }
    // private version
    return (
      <TemplateVarPanel
        isFold={false}
        header={
          <AppInfoComp siteInfo={siteInfo} />
        }
      >
        <ChatBtn onClick={handleChat} />
      </TemplateVarPanel>
    )
  }

  const renderVarPanel = () => {
    return (
      <TemplateVarPanel
        isFold={false}
        header={
          <AppInfoComp siteInfo={siteInfo} />
        }
      >
        {renderInputs()}
        <ChatBtn
          className='mt-3 mobile:ml-0 tablet:ml-[128px]'
          onClick={handleChat}
        />
      </TemplateVarPanel>
    )
  }

  const renderVarOpBtnGroup = () => {
    return (
      <VarOpBtnGroup
        onConfirm={() => {
          if (!canChat())
            return

          onInputsChange(savedInputs)
          setIsFold(true)
        }}
        onCancel={() => {
          onInputsChange(savedInputs)
          setIsFold(true)
        }}
      />
    )
  }

  const renderHasSetInputsPublic = () => {
    if (!canEditInputs) {
      return (
        <TemplateVarPanel
          isFold={false}
          header={
            <>
              <PanelTitle
                title={t('app.chat.publicPromptConfigTitle')}
                className='mb-1'
              />
              <PromptTemplate html={highLightPromoptTemplate} />
            </>
          }
        />
      )
    }

    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <>
            <PanelTitle
              title={t('app.chat.publicPromptConfigTitle')}
              className='mb-1'
            />
            <PromptTemplate html={highLightPromoptTemplate} />
            {isFold && (
              <div className='flex items-center justify-between mt-3 border-t border-indigo-100 pt-4 text-xs text-indigo-600'>
                <span className='text-gray-700'>{t('app.chat.configStatusDes')}</span>
                <EditBtn onClick={() => setIsFold(false)} />
              </div>
            )}
          </>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    )
  }

  const renderHasSetInputsPrivate = () => {
    if (!canEditInputs || !hasVar)
      return null

    return (
      <TemplateVarPanel
        isFold={isFold}
        header={
          <div className='flex items-center justify-between text-indigo-600'>
            <PanelTitle
              title={!isFold ? t('app.chat.privatePromptConfigTitle') : t('app.chat.configStatusDes')}
            />
            {isFold && (
              <EditBtn onClick={() => setIsFold(false)} />
            )}
          </div>
        }
      >
        {renderInputs()}
        {renderVarOpBtnGroup()}
      </TemplateVarPanel>
    )
  }

  const renderHasSetInputs = () => {
    if ((!isPublicVersion && !canEditInputs) || !hasVar)
      return null

    return (
      <div
        className='pt-[88px] mb-5'
      >
        {isPublicVersion ? renderHasSetInputsPublic() : renderHasSetInputsPrivate()}
      </div>)
  }

  return (
    <div className='relative mobile:min-h-[48px] tablet:min-h-[64px]'>
      {hasSetInputs && renderHeader()}
      <div className='mx-auto pc:w-[794px] max-w-full mobile:w-full px-3.5'>
        {/*  Has't set inputs  */}
        {
          !hasSetInputs && (
            <div className='mobile:pt-[72px] tablet:pt-[128px] pc:pt-[200px]'>
              {hasVar
                ? (
                  renderVarPanel()
                )
                : (
                  renderNoVarPanel()
                )}
            </div>
          )
        }

        {/* Has set inputs */}
        {hasSetInputs && renderHasSetInputs()}

        {/* foot */}
        {!hasSetInputs && (
          <div className='mt-4 flex justify-between items-center h-8 text-xs text-gray-400'>

            {siteInfo.privacy_policy
              ? <div>{t('app.chat.privacyPolicyLeft')}
                <a
                  className='text-gray-500'
                  href={siteInfo.privacy_policy}
                  target='_blank'>{t('app.chat.privacyPolicyMiddle')}</a>
                {t('app.chat.privacyPolicyRight')}
              </div>
              : <div>
              </div>}
            <a className='flex items-center pr-3 space-x-3' href="https://dify.ai/" target="_blank">
              <span className='uppercase'>{t('app.chat.powerBy')}</span>
              <FootLogo />
            </a>
          </div>
        )}
      </div>
    </div >
  )
}

export default React.memo(Welcome)
