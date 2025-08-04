import axios from "axios";
import CryptoJS from "crypto-js";

const API_KEYS = {
  deepl: import.meta.env.VITE_DEEPL_API_KEY,
  baiduAppid: import.meta.env.VITE_BAIDU_APPID,
  baiduKey: import.meta.env.VITE_BAIDU_KEY,
  google: import.meta.env.VITE_GOOGLE_API_KEY,
};

const cacheKey = "translationCache";
const cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");

export async function translateText(text, source) {
  if (cache[text]) {
    return cache[text];
  }

  let result;
  try {
    if (source === "deepl") {
      result = await translateWithDeepL(text);
    } else if (source === "baidu") {
      result = await translateWithBaidu(text);
    } else {
      result = await translateWithGoogle(text);
    }

    cache[text] = result;
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    return result;
  } catch (error) {
    throw new Error(`${source} 翻译失败`);
  }
}

async function translateWithDeepL(text) {
  const url = "https://api-free.deepl.com/v2/translate";
  const params = {
    text: [text],
    target_lang: "EN",
    auth_key: API_KEYS.deepl,
  };

  try {
    const response = await axios.post(url, params, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.translations[0].text;
  } catch {
    throw new Error("DeepL 翻译失败");
  }
}

async function translateWithBaidu(text) {
  const salt = Math.floor(Math.random() * 1000000000).toString();
  const sign = CryptoJS.MD5(
    API_KEYS.baiduAppid + text + salt + API_KEYS.baiduKey
  ).toString();

  const url = "https://fanyi-api.baidu.com/api/trans/vip/translate";

  try {
    const response = await axios.get(url, {
      params: {
        q: text,
        from: "zh",
        to: "en",
        appid: API_KEYS.baiduAppid,
        salt: salt,
        sign: sign,
      },
    });
    if (response.data.error_code) {
      throw new Error(response.data.error_msg || "百度翻译失败");
    }
    return response.data.trans_result[0].dst;
  } catch {
    throw new Error("百度翻译失败");
  }
}

async function translateWithGoogle(text) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEYS.google}`;
  const params = {
    q: text,
    source: "zh-CN",
    target: "en",
    format: "text",
  };

  try {
    const response = await axios.post(url, params, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data.data.translations[0].translatedText;
  } catch {
    throw new Error("Google 翻译失败");
  }
}