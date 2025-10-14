// Minimal seed syllabus + weights for GATE ME / ESE ME.
// You can expand these lists with chapters/sub-chapters & PYQ mapping.
export const initialCurriculum = [
  { id: 'thermo', name: 'Thermodynamics', weight: 0.18, hours: 40 },
  { id: 'fm', name: 'Fluid Mechanics', weight: 0.15, hours: 40 },
  { id: 'ht', name: 'Heat Transfer', weight: 0.10, hours: 30 },
  { id: 'som', name: 'Strength of Materials', weight: 0.12, hours: 36 },
  { id: 'md', name: 'Machine Design', weight: 0.10, hours: 30 },
  { id: 'mf', name: 'Manufacturing', weight: 0.15, hours: 42 },
  { id: 'tom', name: 'Theory of Machines', weight: 0.08, hours: 24 },
  { id: 'ie', name: 'Industrial Engineering', weight: 0.06, hours: 18 },
  { id: 'maths', name: 'Engineering Mathematics', weight: 0.06, hours: 18 }
]

// Generate a day plan with 3–4 focused blocks (Pomodoro-friendly).
export function generateDailyFocus(curriculum, progress) {
  const day = progress.day || 1
  const blocks = []
  // Rotate topics by weight + incomplete hours
  const pool = [...curriculum].sort((a,b) => b.weight - a.weight)
  const pick = (arr, n) => arr.slice(0, n)

  const chosen = pick(pool, 3)
  const id = () => Math.random().toString(36).slice(2,9)

  chosen.forEach(topic => {
    blocks.push({
      id: id(),
      title: `${topic.name}: Concept + PYQ`,
      type: 'Study',
      duration: 60,
      source: 'PYQ + Notes',
      detail: `Study key formulas; solve 5 PYQs and 3 new problems for ${topic.name}.`
    })
    blocks.push({
      id: id(),
      title: `${topic.name}: Spaced Revision`,
      type: 'Revision',
      duration: 30,
      source: 'Flashcards',
      detail: `Review flashcards from days ${Math.max(1, day-2)} & ${Math.max(1, day-5)}.`
    })
  })

  // Light test every 3rd day
  if (day % 3 === 0) {
    blocks.push({
      id: id(),
      title: "Mini Mock (Mixed ME)",
      type: 'Test',
      duration: 45,
      source: 'Custom',
      detail: '15 questions mixed difficulty. Target 70% accuracy.'
    })
  }

  return { day, blocks }
}
