import { useState } from "react";
import { BookOpen, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold font-display text-foreground">Teacher's Aid</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            How to Use
          </button>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">How to Use Teacher's Aid</DialogTitle>
            <DialogDescription>Follow these simple steps to generate professional lesson notes.</DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 mt-2 text-sm text-foreground">
            {[
              { title: "Select Class & Subject", desc: "Choose the class level (JSS1–SSS3) and the subject you want to create a lesson note for." },
              { title: "Enter Topic & Week", desc: "Type in the topic or upload an image of it, then specify the week number and date." },
              { title: "Choose Country", desc: "Select Nigeria or Ghana so the content matches your curriculum." },
              { title: "Generate", desc: "Click Generate and the AI will create a comprehensive, formatted lesson note." },
              { title: "Preview & Download", desc: "Review the generated note, then download it as PDF, DOCX, or TeX." },
              { title: "Batch Mode", desc: "Add multiple class/subject/topic entries to generate several lesson notes in one go." },
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{step.title}</p>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
};
