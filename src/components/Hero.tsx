import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, FileText, Wand2, GraduationCap, FolderOpen } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
  onViewDashboard?: () => void;
}

export const Hero = ({ onGetStarted, onViewDashboard }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo & App Name */}
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up">
            <div className="p-3 rounded-2xl gradient-primary shadow-glow">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Teacher's Aid
            </h2>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Teaching Assistant</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Your Smart Partner for{" "}
            <span className="text-gradient">Effortless Lesson Planning</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Simply upload your curriculum or scheme of work, and let AI craft detailed lesson notes with step-by-step presentation guides — saving you hours of prep time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Button variant="hero" size="xl" onClick={onGetStarted}>
              <Wand2 className="w-5 h-5" />
              Start Creating
            </Button>
            <Button variant="outline" size="lg" onClick={onViewDashboard}>
              <FolderOpen className="w-5 h-5" />
              My Lessons
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            {[
              { icon: BookOpen, text: "All Subjects" },
              { icon: FileText, text: "PDF & DOCX Export" },
              { icon: Sparkles, text: "Smart Templates" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-card border border-border"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--card))"
          />
        </svg>
      </div>
    </section>
  );
};
