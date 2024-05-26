import { UserEventType } from './types';

export const getPageX = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;
};

export const getPageY = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.pageY : event.changedTouches[0].pageY;
};

export const getClientX = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX;
};

export const getClientY = (event: UserEventType) => {
  return event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY;
};

export const getDeviceId = () => {
  const userAgent = navigator.userAgent;
  const language = navigator.language;

  let deviceId = userAgent + language;
  deviceId = btoa(deviceId); // 使用 base64 编码

  return deviceId;
};

// getLanguageName 获取当前浏览器的语言, 并将其转换为用户可读的格式
// 如：zh => Chinese, en => English
export const getLanguageName = () => {
  const language = navigator.language;
  const languageMap: Record<string, string> = {
    zh: 'Chinese',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    tr: 'Turkish',
    vi: 'Vietnamese',
    he: 'Hebrew',
    th: 'Thai',
    pl: 'Polish',
    nl: 'Dutch',
    id: 'Indonesian',
    ro: 'Romanian',
    hu: 'Hungarian',
    sv: 'Swedish',
    cs: 'Czech',
    da: 'Danish',
    fi: 'Finnish',
    el: 'Greek',
    no: 'Norwegian',
    sk: 'Slovak',
    bg: 'Bulgarian',
    uk: 'Ukrainian',
    hr: 'Croatian',
    ca: 'Catalan',
    lt: 'Lithuanian',
    sl: 'Slovenian',
    sr: 'Serbian',
    lv: 'Latvian',
    et: 'Estonian',
    ms: 'Malay',
    fa: 'Persian',
    fil: 'Filipino',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
  };

  const langName = languageMap[language] ?? language;
  console.log('language:', language, 'langName:', langName);
  return langName;
};
