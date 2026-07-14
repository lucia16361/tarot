"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  id: string;
  date: string;
  question: string;
  cards: string;
  reading: string;
  feedback: string;
  mood: string;
};

const STORAGE_KEY = "tarot-diary-entries";
const PIN_KEY = "tarot-diary-pin";

const starterEntries: Entry[] = [
  {
    id: "tarot-career-3-months",
    date: "2026-07-14",
    question: "从现在起未来三个月，我的事业发展、机会与需要注意的地方是什么？",
    cards: "圣杯王后逆位 · 圣杯王牌正位 · 圣杯侍者逆位",
    reading: "第一个月先处理情绪消耗和注意力分散；第二个月会出现一个值得培育的新机会；第三个月要把灵感沉淀成可复制的流程，避免想法太多、承诺过快。",
    feedback: "执行提醒：只保留一个核心增长项目和一个试验项目，少做方向判断，多做小规模验证。",
    mood: "清醒",
  },
  {
    id: "tarot-emotion-1-month",
    date: "2026-07-14",
    question: "未来一个月，我的情感状态、关系发展和需要注意的地方是什么？",
    cards: "女皇正位 · 月亮逆位 · 宝剑王牌正位",
    reading: "当前情感吸引力较强，未来一个月暧昧和误会会逐渐被看清。关键不是继续猜测，而是通过坦诚沟通确认彼此的真实想法。",
    feedback: "行动提醒：少看暗示，多看持续行动；不再单方面过度付出，在合适时机把话说清楚。",
    mood: "清醒",
  },
  {
    id: "tarot-person-1-month",
    date: "2026-07-14",
    question: "未来一个月，我和现在心里想着的这个人的关系会如何发展？",
    cards: "圣杯十正位 · 宝剑七正位 · 宝剑骑士正位",
    reading: "你们之间有情感连接和美好想象，但未来一个月容易出现试探、保留或信息不对称。一次直接沟通可能推动关系定向。",
    feedback: "行动提醒：可以主动，但不要追逐；表达好感和期待后，观察对方是否用持续行动回应。",
    mood: "期待",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"journal" | "new">("journal");
  const [pin, setPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState({ date: today(), question: "", cards: "", reading: "", feedback: "", mood: "平静" });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedPin = localStorage.getItem(PIN_KEY);
    const savedEntries: Entry[] = saved ? JSON.parse(saved) : [];
    const existingIds = new Set(savedEntries.map((entry) => entry.id));
    const parsed = [...savedEntries, ...starterEntries.filter((entry) => !existingIds.has(entry.id))];
    setEntries(parsed);
    setPin(savedPin || "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    setSelectedId(parsed[0]?.id || null);
    setHydrated(true);
  }, []);

  const selected = entries.find((entry) => entry.id === selectedId) || entries[0];
  const monthLabel = useMemo(() => {
    const date = selected ? new Date(`${selected.date}T12:00:00`) : new Date();
    return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long" }).format(date);
  }, [selected]);

  function unlock(event: React.FormEvent) {
    event.preventDefault();
    if (!pin) {
      if (pinInput.length < 4) return setPinError("请设置至少 4 位密码");
      localStorage.setItem(PIN_KEY, pinInput);
      setPin(pinInput);
      setPinInput("");
      return;
    }
    if (pinInput === pin) {
      setPinError("");
      setPinInput("unlocked");
    } else setPinError("密码不正确，请再试一次");
  }

  function saveEntry(event: React.FormEvent) {
    event.preventDefault();
    if (!form.question.trim()) return;
    const entry: Entry = { ...form, id: crypto.randomUUID() };
    const next = [entry, ...entries];
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSelectedId(entry.id);
    setView("journal");
    setForm({ date: today(), question: "", cards: "", reading: "", feedback: "", mood: "平静" });
  }

  function deleteEntry() {
    if (!selected || !window.confirm("确定删除这篇日记吗？删除后无法恢复。")) return;
    const next = entries.filter((entry) => entry.id !== selected.id);
    setEntries(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSelectedId(next[0]?.id || null);
  }

  if (!hydrated || pinInput !== "unlocked") {
    return (
      <main className="lock-screen">
        <div className="lock-card">
          <div className="lock-orb">✦</div>
          <p className="eyebrow">THE PRIVATE ARCANA</p>
          <h1>你的塔罗日记</h1>
          <p className="lock-copy">记录每一次提问，也留住牌面之外的真实反馈。内容只保存在你当前设备的浏览器里。</p>
          {hydrated && <form onSubmit={unlock} className="pin-form">
            <label>{pin ? "输入密码进入日记" : "先设置一个私密密码"}</label>
            <input autoFocus value={pinInput === "unlocked" ? "" : pinInput} onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={8} placeholder="至少 4 位数字" />
            <button type="submit">{pin ? "进入日记" : "开始设置"} <span>→</span></button>
            {pinError && <small className="error">{pinError}</small>}
          </form>}
          <div className="lock-note"><span>◉</span> 本地保存 · 无云端同步</div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><div><strong>ARCANA</strong><small>塔罗日记</small></div></div>
        <nav>
          <button className={view === "journal" ? "active" : ""} onClick={() => setView("journal")}><span>◌</span> 我的日记</button>
          <button className={view === "new" ? "active" : ""} onClick={() => setView("new")}><span>＋</span> 写一篇新的</button>
        </nav>
        <div className="side-footer"><span>✧</span><p>“牌面是镜子，<br />反馈才是答案。”</p><small>PRIVATE / LOCAL ONLY</small></div>
      </aside>
      <section className="content">
        <header className="topbar"><div><p className="eyebrow">PERSONAL TAROT JOURNAL</p><h2>{view === "new" ? "写下今天的提问" : "把答案留给时间"}</h2></div><button className="new-button" onClick={() => setView("new")}>＋ 新建记录</button></header>
        {view === "new" ? <form className="entry-form" onSubmit={saveEntry}>
          <div className="form-intro"><span className="date-chip">{form.date}</span><h3>今天，你想问什么？</h3><p>不要追求完美的措辞，诚实地写下此刻最在意的事。</p></div>
          <label>提问 <em>必填</em><textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="例如：未来一个月，我的事业应该把注意力放在哪里？" rows={3} /></label>
          <div className="form-grid"><label>日期<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>今日状态<select value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}><option>平静</option><option>期待</option><option>困惑</option><option>勇敢</option><option>释然</option></select></label></div>
          <label>抽到的牌 <span className="optional">可选</span><input value={form.cards} onChange={(e) => setForm({ ...form, cards: e.target.value })} placeholder="例如：女皇正位 · 月亮逆位 · 宝剑王牌正位" /></label>
          <label>当下的解读 <span className="optional">可选</span><textarea value={form.reading} onChange={(e) => setForm({ ...form, reading: e.target.value })} placeholder="记录你对牌面的第一感受，或 AI / 解牌师给你的关键词。" rows={4} /></label>
          <label>回头看，我的反馈 <span className="optional">可选</span><textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} placeholder="这件事后来怎样了？牌面有没有提醒到你？" rows={4} /></label>
          <div className="form-actions"><button type="button" className="ghost" onClick={() => setView("journal")}>取消</button><button type="submit" className="save-button">保存这篇日记 <span>→</span></button></div>
        </form> : <div className="journal-layout">
          <div className="entry-list"><div className="list-heading"><span>{entries.length} 篇记录</span><span className="month">{monthLabel}</span></div>{entries.map((entry) => <button key={entry.id} className={`entry-card ${entry.id === selectedId ? "selected" : ""}`} onClick={() => setSelectedId(entry.id)}><span className="entry-date">{entry.date.replaceAll("-", ".")}</span><strong>{entry.question}</strong><small>{entry.cards || "尚未记录牌面"}</small><i>{entry.mood}</i></button>)}</div>
          {selected ? <article className="journal-detail"><div className="detail-top"><span className="date-chip">{selected.date}</span><span className="mood">今日 · {selected.mood}</span></div><h1>{selected.question}</h1><div className="rule" /><section><p className="section-label">抽到的牌</p><p className="cards">{selected.cards || "还没有记录牌面"}</p></section><section><p className="section-label">当下的解读</p><p className="body-copy">{selected.reading || "这篇记录还没有写下解读。"}</p></section><section className="feedback-box"><p className="section-label">回头看，我的反馈</p><p className="body-copy">{selected.feedback || "时间会继续补全这张牌。等事情发生后，再回来写下你的反馈。"}</p></section><div className="detail-footer"><span>记录于 {selected.date}</span><span className="detail-actions"><button className="delete-button" onClick={deleteEntry}>删除这篇</button><button onClick={() => { localStorage.removeItem(PIN_KEY); setPin(""); setPinInput(""); }}>锁定日记</button></span></div></article> : <div className="empty">还没有日记，写下今天的第一个问题吧。</div>}
        </div>}
      </section>
    </main>
  );
}
