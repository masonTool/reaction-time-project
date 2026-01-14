import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

// 获取浏览器语言
const getBrowserLanguage = (): string => {
  const stored = localStorage.getItem('user-language')
  if (stored) return stored
  
  const browserLang = navigator.language
  // 匹配支持的语言
  if (browserLang.startsWith('zh')) return 'zh-CN'
  if (browserLang.startsWith('en')) return 'en'
  
  return 'en' // 默认英语
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en': { translation: en },
    },
    lng: getBrowserLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n

// 切换语言的辅助函数
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng)
  localStorage.setItem('user-language', lng)
  // 更新HTML的lang属性
  document.documentElement.lang = lng
  // 更新HTML的dir属性(RTL语言)
  document.documentElement.dir = ['ar'].includes(lng) ? 'rtl' : 'ltr'
}

// 支持的语言列表
export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
]
