import React, { useMemo, useRef, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, Brain, Check, CheckCircle2, ChevronRight,
  CircleHelp, FileText, FlaskConical, GraduationCap, Lightbulb, LockKeyhole,
  Play, Plus, RefreshCw, Sparkles, Target, Upload, X
} from "lucide-react";

const initialTopics = [
  { id: 1, name: "First-order differential equations", unit: "Differential Equations", progress: 62, status: "In progress", tag: "Core concept" },
  { id: 2, name: "Separable equations", unit: "Differential Equations", progress: 25, status: "In progress", tag: "Practice" },
  { id: 3, name: "Laplace transforms", unit: "Differential Equations", progress: 0, status: "Not started", tag: "Coming up" },
  { id: 4, name: "Linear systems", unit: "Linear Algebra", progress: 0, status: "Not started", tag: "Coming up" },
];

function DecayGraph() {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const x = 52 + i * 8.3;
    const y = 22 + 142 * (1 - Math.exp(-i / 11));
    return `${x},${y}`;
  }).join(" ");
  return <svg viewBox="0 0 410 205" className="graph" role="img" aria-label="Exponential decay graph">
    {[0, 1, 2, 3].map(i => <line key={i} x1="52" x2="385" y1={22 + i * 47} y2={22 + i * 47} className="gridline" />)}
    <line x1="52" y1="22" x2="52" y2="164" className="axis" />
    <line x1="52" y1="164" x2="385" y2="164" className="axis" />
    <polyline points={pts} fill="none" stroke="#64d8cb" strokeWidth="3.5" strokeLinecap="round" />
    <text x="8" y="27" className="graph-label">Cₐ</text>
    <text x="376" y="187" className="graph-label">time</text>
    <text x="42" y="181" className="graph-tick">0</text>
    <text x="205" y="181" className="graph-tick">t</text>
    <text x="10" y="72" className="graph-tick">High</text>
    <text x="17" y="162" className="graph-tick">0</text>
  </svg>;
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Learn");
  const [topics, setTopics] = useState(initialTopics);
  const [discipline, setDiscipline] = useState("Chemical Engineering");
  const [resourceName, setResourceName] = useState("Differential Equations syllabus.pdf");
  const [uploaded, setUploaded] = useState(false);
  const [lessonStage, setLessonStage] = useState("connect");
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [mastered, setMastered] = useState(false);
  const fileRef = useRef(null);

  const correct = useMemo(() => {
    const n = Number(answer);
    return answer.trim() !== "" && Math.abs(n - 0.368) < 0.015;
  }, [answer]);

  function handleUpload(file) {
    if (!file) return;
    setResourceName(file.name);
    setUploaded(true);
  }

  function checkAnswer() {
    if (!answer.trim()) return;
    if (correct) {
      setFeedback({ type: "success", title: "That's it.", body: "You found the concentration after one time constant. The model predicts about 36.8% of the initial reactant remains." });
      setMastered(true);
      setTopics(old => old.map(t => t.id === 1 ? { ...t, progress: 82, status: "Improving" } : t));
    } else {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 3) {
        setFeedback({ type: "adapt", title: "Let's change the approach.", body: "You've had three attempts. Instead of manipulating the equation again, let's connect the time constant to a physical picture: after one time constant, roughly 63.2% has reacted, so 36.8% remains." });
        setLessonStage("visual");
      } else {
        setFeedback({ type: "error", title: "Not quite — try the model again.", body: next === 1 ? "Check what the exponent becomes when t = 1/k. Remember that e⁻¹ is about 0.368." : "You are solving for the remaining concentration, not the amount that has reacted. Try evaluating e⁻¹." });
      }
    }
  }

  function resetQuestion() {
    setAnswer(""); setAttempts(0); setFeedback(null); setLessonStage("connect"); setMastered(false);
  }

  const nav = ["Overview", "Learn", "My courses", "Review"];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">∫</div><span>integral</span></div>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <nav>{nav.map(item => <button key={item} className={`nav-item ${activeTab === item ? "active" : ""}`} onClick={() => setActiveTab(item)}>
        {item === "Overview" ? <Activity size={17}/> : item === "Learn" ? <BookOpen size={17}/> : item === "My courses" ? <GraduationCap size={17}/> : <RefreshCw size={17}/>}
        {item}
      </button>)}</nav>
      <div className="sidebar-bottom">
        <div className="course-mini"><div className="mini-icon"><FlaskConical size={16}/></div><div><b>{discipline}</b><small>Learning path</small></div></div>
        <div className="profile"><div className="avatar">DA</div><div><b>Student workspace</b><small>Engineering student</small></div><ChevronRight size={16}/></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <span>{activeTab}</span></div>
        <div className="top-actions"><span className="mode-pill"><span className="pulse"/> DEMO MODE</span><button className="icon-btn" title="Help"><CircleHelp size={18}/></button></div>
      </header>

      {activeTab === "Learn" ? <div className="content">
        <div className="page-heading">
          <div><div className="eyebrow">YOUR LEARNING PATH <span className="eyebrow-line"/></div><h1>Learn the math.<br/><em>See where it works.</em></h1>
            <p className="subhead">Integral connects the mathematics in your courses to the engineering systems you'll design.</p></div>
          <div className="mascot-card"><div className="mascot">∫<span>✦</span></div><div><b>Professor Integral</b><small>Your engineering math guide</small></div><span className="online-dot"/></div>
        </div>

        <section className="course-banner">
          <div className="course-symbol"><FlaskConical size={22}/></div>
          <div className="course-info"><div className="banner-kicker">CURRENT LEARNING PATH</div><h2>Mathematics for {discipline}</h2><p>Connecting core math concepts to real engineering applications</p></div>
          <div className="banner-stat"><strong>{topics.filter(t => t.progress > 0).length}<span> / {topics.length}</span></strong><small>Topics started</small></div>
          <button className="outline-btn" onClick={() => setActiveTab("My courses")}>Course details <ArrowRight size={15}/></button>
        </section>

        <div className="section-row"><div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2 className="section-title">Today's lesson</h2></div><span className="time-label">12–15 MIN <span>·</span> CONCEPT + APPLICATION</span></div>

        <div className="lesson-layout">
          <section className="lesson-card">
            <div className="lesson-topline"><span className="lesson-type"><span className="type-dot"/> DIFFERENTIAL EQUATIONS</span><span className="lesson-number">LESSON 01 / 04</span></div>
            <h2>First-order differential equations</h2>
            <p className="lesson-intro">A changing quantity can often be described by how fast it changes. Let's connect that idea to a chemical reactor.</p>
            <div className="concept-strip"><div className="concept-icon"><Lightbulb size={18}/></div><div><b>The mathematical idea</b><p>The rate of change of a quantity is proportional to the quantity itself.</p></div></div>
            <div className="equation-box"><span className="equation-label">GOVERNING EQUATION</span><div className="equation">dCₐ/dt = −kCₐ</div><div className="equation-explain"><span><b>Cₐ</b> = reactant concentration</span><span><b>k</b> = reaction rate constant</span></div></div>
            <div className="stage-tabs">
              <button className={lessonStage === "connect" ? "selected" : ""} onClick={() => setLessonStage("connect")}><span>01</span> Engineering connection</button>
              <button className={lessonStage === "visual" ? "selected" : ""} onClick={() => setLessonStage("visual")}><span>02</span> Visualize it</button>
              <button className={lessonStage === "practice" ? "selected" : ""} onClick={() => setLessonStage("practice")}><span>03</span> Apply it</button>
            </div>
            {lessonStage === "connect" && <div className="application-panel">
              <div className="app-panel-head"><div className="app-icon"><FlaskConical size={18}/></div><div><span className="panel-kicker">CHEMICAL ENGINEERING</span><h3>Inside a batch reactor</h3></div></div>
              <p>Imagine a sealed tank where a reactant is being consumed in a first-order reaction. The more reactant present, the faster it reacts. As concentration falls, the reaction slows down.</p>
              <div className="process-flow"><div className="process-node"><span>START</span><b>High Cₐ</b><small>More reactant</small></div><ArrowRight size={17}/><div className="process-node"><span>REACTION</span><b>−kCₐ</b><small>Consumption rate</small></div><ArrowRight size={17}/><div className="process-node"><span>OVER TIME</span><b>Lower Cₐ</b><small>Less reactant</small></div></div>
              <button className="primary-btn" onClick={() => setLessonStage("practice")}>Apply the equation <ArrowRight size={16}/></button>
            </div>}
            {lessonStage === "visual" && <div className="application-panel">
              <div className="app-panel-head"><div className="app-icon"><Activity size={18}/></div><div><span className="panel-kicker">VISUAL EXPLANATION</span><h3>Watch concentration decay</h3></div></div>
              <p>The solution is exponential decay: <b>Cₐ(t) = Cₐ₀e⁻ᵏᵗ</b>. The concentration drops quickly at first, then levels toward zero.</p>
              <DecayGraph/>
              <div className="insight-note"><Sparkles size={16}/><span><b>Engineering insight:</b> A larger rate constant means a faster reaction and a steeper concentration curve.</span></div>
              <button className="primary-btn" onClick={() => setLessonStage("practice")}>Try a problem <ArrowRight size={16}/></button>
            </div>}
            {lessonStage === "practice" && <div className="application-panel practice-panel">
              <div className="app-panel-head"><div className="app-icon"><Target size={18}/></div><div><span className="panel-kicker">CHECK YOUR UNDERSTANDING</span><h3>Put the model to work</h3></div></div>
              <p>A batch reactor follows first-order kinetics. If <b>k = 0.2 min⁻¹</b>, what fraction of the initial reactant concentration remains after <b>5 minutes</b>?</p>
              <div className="answer-row"><label htmlFor="answer">Remaining fraction (decimal)</label><div className="answer-input-wrap"><input id="answer" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === "Enter" && checkAnswer()} placeholder="e.g. 0.37"/><button className="primary-btn check-btn" onClick={checkAnswer}>Check answer <ArrowRight size={15}/></button></div></div>
              {feedback && <div className={`feedback ${feedback.type}`}><div className="feedback-icon">{feedback.type === "success" ? <CheckCircle2 size={18}/> : feedback.type === "adapt" ? <Sparkles size={18}/> : <CircleHelp size={18}/>}</div><div><b>{feedback.title}</b><p>{feedback.body}</p>{feedback.type === "adapt" && <button className="text-btn" onClick={() => setLessonStage("visual")}>Open visual explanation <ArrowRight size={14}/></button>}</div></div>}
              {mastered && <div className="mastery-line"><CheckCircle2 size={16}/> Progress updated — topic mastery is improving.</div>}
              <button className="reset-link" onClick={resetQuestion}>Reset practice <RefreshCw size={13}/></button>
            </div>}
          </section>

          <aside className="right-rail">
            <section className="resource-card"><div className="rail-heading"><div><span className="panel-kicker">YOUR MATERIALS</span><h3>Course resources</h3></div><button className="add-btn" onClick={() => fileRef.current?.click()}><Plus size={17}/></button></div>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.doc,.docx" hidden onChange={e => handleUpload(e.target.files?.[0])}/>
              <button className="upload-zone" onClick={() => fileRef.current?.click()}><Upload size={19}/><span><b>{uploaded ? "Resource selected" : "Add course material"}</b><small>{uploaded ? "Ready to use in this demo" : "Syllabus, notes, or study guide"}</small></span><ChevronRight size={15}/></button>
              <div className="resource-file"><div className="file-icon"><FileText size={17}/></div><div><b>{resourceName}</b><small>{uploaded ? "Selected locally · not uploaded to a server" : "Sample resource · demo content"}</small></div><Check size={15} className="file-check"/></div>
              <div className="resource-foot"><LockKeyhole size={12}/> Files stay in this browser demo.</div>
            </section>

            <section className="progress-card"><div className="rail-heading"><div><span className="panel-kicker">YOUR PROGRESS</span><h3>Topic mastery</h3></div><span className="progress-count">01 / 04</span></div>
              <div className="topic-list">{topics.map(t => <div className="topic-row" key={t.id}><div className="topic-meta"><span>{t.name}</span><small>{t.progress}%</small></div><div className="progress-track"><div className="progress-fill" style={{width: `${t.progress}%`}}/></div><small className="topic-status">{t.status}</small></div>)}</div>
              <button className="view-all" onClick={() => setActiveTab("Overview")}>View learning overview <ArrowRight size={14}/></button>
            </section>
            <div className="coach-note"><div className="coach-star"><Sparkles size={16}/></div><div><b>A note from Professor Integral</b><p>Don't just memorize the equation. Understand what the variables represent in the physical system.</p></div></div>
          </aside>
        </div>
        <footer className="footer-note">INTEGRAL <span>·</span> MATHEMATICS THAT CONNECTS TO ENGINEERING <span className="footer-right">DEMO BUILD · SAMPLE CONTENT</span></footer>
      </div> : <div className="content secondary-page">
        <div className="eyebrow">INTEGRAL WORKSPACE</div>
        <h1>{activeTab === "Overview" ? "Your progress, in context." : activeTab === "My courses" ? "Your engineering path." : "Bring it all together."}</h1>
        <p className="subhead">{activeTab === "Overview" ? "A snapshot of the concepts you're building and the applications you're learning to recognize." : activeTab === "My courses" ? "Choose the engineering discipline that gives your mathematics a real-world context." : "Review concepts across topics and test whether you can apply them in a new situation."}</p>
        {activeTab === "Overview" && <div className="secondary-grid"><div className="metric-card"><span>TOPICS STARTED</span><strong>2 <small>/ 4</small></strong><p>You're building momentum.</p></div><div className="metric-card"><span>APPLICATIONS EXPLORED</span><strong>1</strong><p>First-order reactor kinetics.</p></div><div className="metric-card"><span>LESSONS COMPLETED</span><strong>{mastered ? "1" : "0"}</strong><p>Keep connecting ideas.</p></div></div>}
        {activeTab === "My courses" && <div className="wide-card"><h2>Engineering discipline</h2><p>Integral uses your discipline to select meaningful engineering applications for each math topic.</p><select value={discipline} onChange={e => setDiscipline(e.target.value)}>{["Chemical Engineering","Mechanical Engineering","Civil Engineering","Electrical Engineering","Biomedical Engineering","Aerospace Engineering"].map(d => <option key={d}>{d}</option>)}</select><div className="resource-foot">This changes the sample learning path label. Full course-specific generation is not connected in this demo.</div></div>}
        {activeTab === "Review" && <div className="wide-card"><div className="review-icon"><Brain size={24}/></div><h2>Ready for a cumulative review?</h2><p>Review mode will combine math concepts with engineering applications and focus on topics that need more practice.</p><button className="primary-btn" onClick={() => {setActiveTab("Learn");setLessonStage("practice");}}>Start sample review <ArrowRight size={16}/></button></div>}
        <button className="text-btn back-learn" onClick={() => setActiveTab("Learn")}>Return to lesson <ArrowRight size={14}/></button>
      </div>}
    </main>
  </div>;
}