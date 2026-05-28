"use client";

import { useState, useEffect } from "react";

const PASSWORD = "science123"; // change this

const DEFAULT_ABOUT = "I'm Arvin. I write about cool science I come across — mostly virology, immunology, and molecular biology. No hype, just the interesting stuff.";
const DEFAULT_BLOG_NAME = "Arvin's Science Log";

const SAMPLE = [
  {
    id: 1,
    title: "HIV capsids are more dynamic than we thought",
    body: "Live-cell imaging is showing that the capsid core doesn't just passively uncoat — it actively engages the nuclear pore complex, and timing matters enormously. Really elegant work out of the Bhatt lab.",
    date: "May 28, 2026",
    image: "",
  },
];

export default function Blog() {
  const [posts, setPosts] = useState(SAMPLE);
  const [view, setView] = useState("feed");
  const [active, setActive] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");
  const [blogName, setBlogName] = useState(DEFAULT_BLOG_NAME);
  const [editingBlogName, setEditingBlogName] = useState(false);
  const [blogNameDraft, setBlogNameDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newDate, setNewDate] = useState("");

  const [editDraft, setEditDraft] = useState(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem("posts-v4");
      if (p) setPosts(JSON.parse(p));
    } catch (_) {}
    try {
      const a = localStorage.getItem("about-v1");
      if (a) setAbout(a);
    } catch (_) {}
    try {
      const b = localStorage.getItem("blogname-v1");
      if (b) setBlogName(b);
    } catch (_) {}
    setLoaded(true);
  }, []);

  const savePosts = (updated) => {
    setPosts(updated);
    try { localStorage.setItem("posts-v4", JSON.stringify(updated)); } catch (_) {}
  };

  const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const publish = () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    const post = {
      id: Date.now(),
      title: newTitle.trim(),
      body: newBody.trim(),
      image: newImage.trim(),
      date: newDate.trim() || today(),
    };
    savePosts([post, ...posts]);
    setNewTitle(""); setNewBody(""); setNewImage(""); setNewDate("");
    setView("feed");
  };

  const saveEdit = () => {
    if (!editDraft.title.trim() || !editDraft.body.trim()) return;
    const updated = posts.map((p) => p.id === editDraft.id ? { ...editDraft } : p);
    savePosts(updated);
    setActive({ ...editDraft });
    setEditDraft(null);
    setView("post");
  };

  const del = (id) => {
    savePosts(posts.filter((p) => p.id !== id));
    setView("feed");
    setActive(null);
  };

  const tryAuth = () => {
    if (pwInput === PASSWORD) {
      setAuthed(true); setShowPw(false);
      setPwInput(""); setPwError(false);
      setView("new");
    } else {
      setPwError(true);
    }
  };

  if (!loaded) return <div style={{ background: "#fafaf8", minHeight: "100vh" }} />;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea, input { outline: none; font-family: 'Inter', sans-serif; }
        .card:hover h2 { text-decoration: underline; text-underline-offset: 3px; }
        .nav-link { cursor: pointer; color: #999; font-size: 13px; transition: color 0.15s; }
        .nav-link:hover { color: #333; }
        .nav-link.active { color: #1a1a1a; font-weight: 500; }
        .subtle-btn { background: none; border: none; font-size: 12px; color: #bbb; cursor: pointer; padding: 0; font-family: 'Inter', sans-serif; transition: color 0.15s; }
        .subtle-btn:hover { color: #888; }
        .subtle-btn.danger:hover { color: #cc3333; }
      `}</style>

      <div style={s.wrap}>

        <header style={s.header}>
          <div style={s.nameArea}>
            {editingBlogName && authed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  style={{ ...s.inlineInput, fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600 }}
                  value={blogNameDraft}
                  onChange={(e) => setBlogNameDraft(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = blogNameDraft.trim() || DEFAULT_BLOG_NAME;
                      setBlogName(val);
                      localStorage.setItem("blogname-v1", val);
                      setEditingBlogName(false);
                    }
                    if (e.key === "Escape") setEditingBlogName(false);
                  }}
                />
                <button className="subtle-btn" onClick={() => {
                  const val = blogNameDraft.trim() || DEFAULT_BLOG_NAME;
                  setBlogName(val);
                  localStorage.setItem("blogname-v1", val);
                  setEditingBlogName(false);
                }}>Save</button>
                <button className="subtle-btn" onClick={() => setEditingBlogName(false)}>Cancel</button>
              </div>
            ) : (
              <span style={s.name} onClick={() => setView("feed")}>
                {blogName}
                {authed && (
                  <span
                    style={{ fontSize: 11, color: "#ccc", marginLeft: 8, fontFamily: "'Inter', sans-serif", fontWeight: 400, cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); setBlogNameDraft(blogName); setEditingBlogName(true); }}
                  >
                    edit
                  </span>
                )}
              </span>
            )}
          </div>
          <div style={s.headerRight}>
            <span className={"nav-link" + (view === "about" ? " active" : "")} onClick={() => setView("about")}>About</span>
            <button style={s.btn} onClick={() => {
              if (authed) { setView(view === "new" ? "feed" : "new"); }
              else { setShowPw(!showPw); setPwError(false); }
            }}>
              {view === "new" ? "Cancel" : "+ New post"}
            </button>
          </div>
        </header>

        {showPw && !authed && (
          <div style={s.pwBox}>
            <input
              style={s.pwInput} type="password" placeholder="Password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={(e) => e.key === "Enter" && tryAuth()}
              autoFocus
            />
            <button style={{ ...s.btn, ...s.darkBtn }} onClick={tryAuth}>Go</button>
            {pwError && <span style={s.pwError}>Wrong password</span>}
          </div>
        )}

        {view === "about" && (
          <div style={s.section}>
            <h2 style={s.sectionHeading}>About</h2>
            {editingAbout ? (
              <>
                <textarea
                  style={s.aboutTextarea}
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 10 }}>
                  <button style={{ ...s.btn, ...s.darkBtn }} onClick={() => {
                    const val = aboutDraft.trim() || DEFAULT_ABOUT;
                    setAbout(val);
                    localStorage.setItem("about-v1", val);
                    setEditingAbout(false);
                  }}>Save</button>
                  <button style={s.btn} onClick={() => setEditingAbout(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p style={s.bodyText}>{about}</p>
                {authed && (
                  <button className="subtle-btn" style={{ marginTop: 20 }} onClick={() => { setAboutDraft(about); setEditingAbout(true); }}>Edit</button>
                )}
              </>
            )}
          </div>
        )}

        {view === "new" && authed && (
          <div style={s.section}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Title</label>
              <input style={s.titleInput} placeholder="Post title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Body</label>
              <textarea style={s.bodyInput} placeholder="What did you find interesting?" value={newBody} onChange={(e) => setNewBody(e.target.value)} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Date <span style={s.labelNote}>(leave blank for today)</span></label>
              <input style={s.lineInput} placeholder={today()} value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Image URL <span style={s.labelNote}>(optional)</span></label>
              <input style={s.lineInput} placeholder="https://..." value={newImage} onChange={(e) => setNewImage(e.target.value)} />
            </div>
            {newImage && <img src={newImage} alt="" style={s.imgPreview} onError={(e) => e.target.style.display = "none"} />}
            <button style={{ ...s.btn, ...s.darkBtn, opacity: newTitle && newBody ? 1 : 0.4 }} onClick={publish}>Publish</button>
          </div>
        )}

        {view === "edit" && editDraft && authed && (
          <div style={s.section}>
            <button className="subtle-btn" style={{ marginBottom: 28 }} onClick={() => { setEditDraft(null); setView("post"); }}>← Cancel</button>
            <div style={s.fieldGroup}>
              <label style={s.label}>Title</label>
              <input style={s.titleInput} value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} autoFocus />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Body</label>
              <textarea style={s.bodyInput} value={editDraft.body} onChange={(e) => setEditDraft({ ...editDraft, body: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Date</label>
              <input style={s.lineInput} value={editDraft.date} onChange={(e) => setEditDraft({ ...editDraft, date: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Image URL <span style={s.labelNote}>(optional)</span></label>
              <input style={s.lineInput} value={editDraft.image} onChange={(e) => setEditDraft({ ...editDraft, image: e.target.value })} />
            </div>
            {editDraft.image && <img src={editDraft.image} alt="" style={s.imgPreview} onError={(e) => e.target.style.display = "none"} />}
            <button style={{ ...s.btn, ...s.darkBtn, opacity: editDraft.title && editDraft.body ? 1 : 0.4 }} onClick={saveEdit}>Save changes</button>
          </div>
        )}

        {view === "post" && active && (
          <div>
            <button className="subtle-btn" style={{ marginBottom: 32 }} onClick={() => setView("feed")}>← Back</button>
            <p style={s.detailDate}>{active.date}</p>
            <h1 style={s.detailTitle}>{active.title}</h1>
            {active.image && <img src={active.image} alt="" style={s.detailImg} onError={(e) => e.target.style.display = "none"} />}
            <p style={s.bodyText}>{active.body}</p>
            {authed && (
              <div style={{ display: "flex", gap: 20, marginTop: 48 }}>
                <button className="subtle-btn" onClick={() => { setEditDraft({ ...active }); setView("edit"); }}>Edit post</button>
                <button className="subtle-btn danger" onClick={() => del(active.id)}>Delete post</button>
              </div>
            )}
          </div>
        )}

        {view === "feed" && (
          <div>
            {posts.length === 0 && <p style={{ fontSize: 14, color: "#aaa", paddingTop: 20 }}>No posts yet.</p>}
            {posts.map((p) => (
              <div key={p.id} className="card" style={s.card} onClick={() => { setActive(p); setView("post"); }}>
                {p.image && <img src={p.image} alt="" style={s.cardImg} onError={(e) => e.target.style.display = "none"} />}
                <p style={s.cardDate}>{p.date}</p>
                <h2 style={s.cardTitle}>{p.title}</h2>
                <p style={s.cardExcerpt}>{p.body.slice(0, 160)}{p.body.length > 160 ? "..." : ""}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  root: { background: "#fafaf8", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  wrap: { maxWidth: 640, margin: "0 auto", padding: "0 24px 80px" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "32px 0 40px", borderBottom: "1px solid #e8e8e4", marginBottom: 40,
    flexWrap: "wrap", gap: 12,
  },
  nameArea: { display: "flex", alignItems: "center" },
  name: { fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: "#1a1a1a", cursor: "pointer" },
  headerRight: { display: "flex", alignItems: "center", gap: 20 },
  btn: { background: "none", border: "1px solid #ccc", borderRadius: 4, padding: "6px 14px", fontSize: 13, color: "#444", cursor: "pointer" },
  darkBtn: { background: "#1a1a1a", color: "#fff", border: "none" },
  pwBox: { display: "flex", alignItems: "center", gap: 10, marginBottom: 32 },
  pwInput: { border: "1px solid #ddd", borderRadius: 4, padding: "7px 12px", fontSize: 13, width: 180, color: "#333" },
  pwError: { fontSize: 12, color: "#cc3333" },
  section: { paddingBottom: 40 },
  sectionHeading: { fontFamily: "'Lora', serif", fontSize: 24, fontWeight: 600, color: "#1a1a1a", marginBottom: 20 },
  fieldGroup: { marginBottom: 20 },
  label: { display: "block", fontSize: 11, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  labelNote: { fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: 11, color: "#bbb" },
  inlineInput: { border: "none", background: "transparent", color: "#1a1a1a", fontSize: 14, padding: "2px 0", borderBottom: "1px solid #ddd" },
  titleInput: {
    width: "100%", fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600,
    color: "#1a1a1a", border: "none", background: "transparent",
    padding: "6px 0", borderBottom: "1px solid #e8e8e4",
  },
  bodyInput: {
    width: "100%", fontSize: 15, fontWeight: 300, color: "#333",
    border: "none", background: "transparent", lineHeight: 1.8,
    minHeight: 200, resize: "vertical",
  },
  lineInput: {
    width: "100%", fontSize: 14, fontWeight: 300, color: "#333",
    border: "none", background: "transparent", borderBottom: "1px solid #e8e8e4", padding: "6px 0",
  },
  aboutTextarea: {
    width: "100%", fontSize: 15, fontWeight: 300, color: "#333",
    border: "1px solid #e0e0da", borderRadius: 4, padding: "12px",
    lineHeight: 1.8, minHeight: 160, resize: "vertical", background: "transparent", marginBottom: 14,
  },
  imgPreview: { width: "100%", borderRadius: 6, marginBottom: 20, marginTop: 8, display: "block" },
  card: { padding: "28px 0", borderBottom: "1px solid #e8e8e4", cursor: "pointer" },
  cardImg: { width: "100%", borderRadius: 6, marginBottom: 16, display: "block", maxHeight: 260, objectFit: "cover" },
  cardDate: { fontSize: 12, color: "#999", marginBottom: 8, fontWeight: 300 },
  cardTitle: { fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.35, marginBottom: 10 },
  cardExcerpt: { fontSize: 14, color: "#666", lineHeight: 1.7, fontWeight: 300 },
  back: { background: "none", border: "none", fontSize: 13, color: "#999", cursor: "pointer", marginBottom: 32, padding: 0 },
  detailDate: { fontSize: 12, color: "#999", marginBottom: 12, fontWeight: 300 },
  detailTitle: { fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 24 },
  detailImg: { width: "100%", borderRadius: 6, marginBottom: 28, display: "block" },
  bodyText: { fontSize: 15, color: "#444", lineHeight: 1.85, fontWeight: 300, whiteSpace: "pre-wrap" },
};