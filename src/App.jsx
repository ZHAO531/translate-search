import { useState, useEffect } from "react";
import { translateText } from "./translate";
import { saveToHistory, getHistory, clearHistory } from "./storage";
import debounce from "lodash.debounce";

function App() {
  const [inputText, setInputText] = useState("");
  const [translationSource, setTranslationSource] = useState("deepl");
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // 主题加载
  useEffect(() => {
    const localDark = localStorage.getItem("theme") === "dark";
    setIsDark(localDark);
    document.documentElement.classList.toggle("dark", localDark);
    setHistory(getHistory());
  }, []);

  // 切换主题
  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const doTranslate = debounce(async () => {
    if (!inputText.trim()) return;
    try {
      const result = await translateText(inputText, translationSource);
      saveToHistory(inputText);
      setHistory(getHistory());
      setError(null);
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(result)}`;
    } catch (err) {
      setError("翻译失败，正在切换翻译源...");
      const next =
        translationSource === "deepl"
          ? "baidu"
          : translationSource === "baidu"
          ? "google"
          : "deepl";
      setTranslationSource(next);
    }
  }, 300);

  const handleSearch = (e) => {
    e.preventDefault();
    doTranslate();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">中文翻译搜索</h1>
          <div className="flex items-center space-x-3">
            <button onClick={toggleDark} className="text-sm underline">
              {isDark ? "☀️ 明亮" : "🌙 暗黑"}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm underline"
            >
              {showHistory ? "隐藏历史" : "查看历史"}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入中文内容..."
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
          />
          <select
            value={translationSource}
            onChange={(e) => setTranslationSource(e.target.value)}
            className="w-full p-2 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="deepl">DeepL</option>
            <option value="baidu">百度翻译</option>
            <option value="google">Google 翻译</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            搜索
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {showHistory && (
          <div className="mt-6 border-t pt-4 border-gray-300 dark:border-gray-600">
            <h2 className="font-semibold mb-2">历史记录</h2>
            {history.length ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {history.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无记录</p>
            )}
            <button
              onClick={() => {
                clearHistory();
                setHistory([]);
              }}
              className="mt-2 text-sm text-red-500 underline"
            >
              清除历史
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;