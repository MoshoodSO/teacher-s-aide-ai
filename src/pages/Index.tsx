import { useState } from "react";
import { Hero } from "@/components/Hero";
import { LessonGenerator } from "@/components/LessonGenerator";

const Index = () => {
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <main className="min-h-screen">
      {showGenerator ? (
        <LessonGenerator onBack={() => setShowGenerator(false)} />
      ) : (
        <Hero onGetStarted={() => setShowGenerator(true)} />
      )}
    </main>
  );
};

export default Index;
