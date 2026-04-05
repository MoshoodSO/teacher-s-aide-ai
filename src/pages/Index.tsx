import { useState } from "react";
import { Hero } from "@/components/Hero";
import { LessonGenerator } from "@/components/LessonGenerator";
import { LessonDashboard } from "@/components/LessonDashboard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
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
      <Footer />
    </div>
  );
};

export default Index;
