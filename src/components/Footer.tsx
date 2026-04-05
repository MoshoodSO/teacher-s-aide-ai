import { BookOpen } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/50 py-6">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-foreground">Teacher's Aid</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Teacher's Aid. All rights reserved.</p>
      </div>
    </footer>
  );
};
