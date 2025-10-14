import React, { useMemo } from "react";
import Navbar from "./components/Navbar";
import DailyPlan from "./components/DailyPlan";
import AIAdvisor from "./components/AIAdvisor";
import ProgressChart from "./components/ProgressChart";
import YouTubePanel from "./components/YouTubePanel";
import { useLocalState } from "./hooks/useLocalState";
import { initialCurriculum, generateDailyFocus } from "./utils/curriculum";
import { BookOpen, LineChart, Settings, BrainCircuit, PlaySquare } from "lucide-react";

export default function App() {
  const [profile, setProfile] = useLocalState("profile", {
    name: "Aspirant",
    targetExam: "GATE ME",
    examDate: "",
    dailyHours: 4,
    strengths: ["Thermo", "Manufacturing"],
    weaknesses: ["Fluid Mechanics", "Machine Design"],
    level: "intermediate",
  });

  const [progress, setProgress] = useLocalState("progress", {
    day: 1,
    completed: [],
    accuracy: [],
    mockScores: [],
    viewedVideos: [],   // {id, title, at}
    aiEvents: []        // {kind, at, note}
  });

  const [curriculum] = useLocalState("curriculum", initialCurriculum);
  const today = useMemo(() => generateDailyFocus(curriculum, progress), [curriculum, progress]);

  return (
    <div>
      <Navbar profile={profile} setProfile={setProfile} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-2 card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Daily Plan</h2>
            </div>
            <DailyPlan
              profile={profile}
              today={today}
              onComplete={(item) => {
                setProgress((p) => ({
                  ...p, completed: [...p.completed, { day: p.day, id: item.id }],
                }));
              }}
              onNextDay={() => setProgress((p) => ({ ...p, day: p.day + 1 }))}
            />
          </section>

          <aside className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">AI Advisor</h3>
            </div>
            <AIAdvisor
              profile={profile}
              today={today}
              progress={progress}
              onLogTask={(evt) =>
                setProgress((p) => ({ ...p, aiEvents: [...(p.aiEvents || []), evt] }))
              }
            />
          </aside>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <section className="card p-5 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <LineChart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Progress & Analytics</h2>
            </div>
            <ProgressChart
              progress={progress}
              onAddScore={(n) =>
                setProgress((p) => ({ ...p, mockScores: [...(p.mockScores || []), n] }))
              }
            />
            <div className="mt-4 text-xs text-white/60">
              Viewed videos: {(progress.viewedVideos || []).length} · AI plans suggested: {(progress.aiEvents || []).length}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <PlaySquare className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">YouTube Helper</h2>
            </div>
            <YouTubePanel
              onViewed={(v) =>
                setProgress((p) => ({ ...p, viewedVideos: [...(p.viewedVideos || []), v] }))
              }
            />
          </section>
        </div>

        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Practice</h2>
          </div>
          {/* Keep your existing QuestionCard or practice UI here */}
          <div className="text-sm text-white/70">Add short quizzes here (PYQ snippets etc.).</div>
        </section>

        <footer className="text-xs text-white/60 text-center py-6">
          © {new Date().getFullYear()} ESE & GATE ME Coach · Focused, day-by-day prep
        </footer>
      </main>
    </div>
  );
}
