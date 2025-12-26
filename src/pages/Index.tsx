import { useState } from "react";
import { Hero } from "@/components/Hero";
import { LessonGenerator } from "@/components/LessonGenerator";
import { LessonDashboard } from "@/components/LessonDashboard";
import { SavedLesson } from "@/types/lesson";

type View = "hero" | "generator" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("hero");
  const [editingLesson, setEditingLesson] = useState<SavedLesson | null>(null);

  const handleNewLesson = () => {
    setEditingLesson(null);
    setCurrentView("generator");
  };

  const handleEditLesson = (lesson: SavedLesson) => {
    setEditingLesson(lesson);
    setCurrentView("generator");
  };

  return (
    <main className="min-h-screen">
      {currentView === "hero" && (
        <Hero 
          onGetStarted={handleNewLesson} 
          onViewDashboard={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "generator" && (
        <LessonGenerator 
          onBack={() => setCurrentView(editingLesson ? "dashboard" : "hero")}
          editingLesson={editingLesson}
          onSaveComplete={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "dashboard" && (
        <LessonDashboard 
          onBack={() => setCurrentView("hero")}
          onNewLesson={handleNewLesson}
          onEditLesson={handleEditLesson}
        />
      )}
    </main>
  );
};

export default Index;
