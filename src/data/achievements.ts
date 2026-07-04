import type { Achievement } from "@/types";

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-lesson", title: "First Lesson", description: "Complete your first lesson", icon: "BookOpen", requirement: (s) => s.lessonsCompleted >= 1 },
  { id: "football-student", title: "Football Student", description: "Complete 10 lessons", icon: "GraduationCap", requirement: (s) => s.lessonsCompleted >= 10 },
  { id: "100-lessons", title: "100 Lessons Read", description: "Complete 25 lessons", icon: "Library", requirement: (s) => s.lessonsCompleted >= 25 },
  { id: "complete-academy", title: "Complete Academy", description: "Complete every lesson", icon: "Trophy", requirement: (s) => s.lessonsCompleted >= s.totalLessons && s.totalLessons > 0 },
  { id: "formation-expert", title: "Formation Expert", description: "Explore 5 formations", icon: "LayoutGrid", requirement: (s) => s.bookmarks >= 5 },
  { id: "quiz-beginner", title: "Quiz Beginner", description: "Take your first quiz", icon: "HelpCircle", requirement: (s) => s.quizzesTaken >= 1 },
  { id: "quiz-master", title: "Quiz Master", description: "Take 10 quizzes", icon: "Award", requirement: (s) => s.quizzesTaken >= 10 },
  { id: "perfect-quiz", title: "Perfect Quiz", description: "Score 100% on any quiz", icon: "Star", requirement: (s) => s.quizAverage === 100 && s.quizzesTaken >= 1 },
  { id: "7-day-streak", title: "7 Day Streak", description: "Learn 7 days in a row", icon: "Flame", requirement: (s) => s.currentStreak >= 7 || s.longestStreak >= 7 },
  { id: "30-day-streak", title: "30 Day Streak", description: "Learn 30 days in a row", icon: "Zap", requirement: (s) => s.longestStreak >= 30 },
];
