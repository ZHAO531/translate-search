const historyKey = "searchHistory";

export function saveToHistory(text) {
  const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
  if (!history.includes(text)) {
    history.unshift(text);
    if (history.length > 50) history.pop();
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
}

export function getHistory() {
  return JSON.parse(localStorage.getItem(historyKey) || "[]");
}

export function clearHistory() {
  localStorage.removeItem(historyKey);
}