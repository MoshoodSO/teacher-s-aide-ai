import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  SavedLesson, 
  getLessonsFromStorage, 
  deleteLessonFromStorage 
} from "@/types/lesson";
import {
  ArrowLeft,
  Plus,
  FileText,
  Download,
  Edit,
  Trash2,
  Calendar,
  BookOpen,
  Search,
  GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface LessonDashboardProps {
  onBack: () => void;
  onNewLesson: () => void;
  onEditLesson: (lesson: SavedLesson) => void;
}

export const LessonDashboard = ({ onBack, onNewLesson, onEditLesson }: LessonDashboardProps) => {
  const [lessons, setLessons] = useState<SavedLesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewLesson, setPreviewLesson] = useState<SavedLesson | null>(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = () => {
    setLessons(getLessonsFromStorage());
  };

  const handleDelete = (id: string) => {
    deleteLessonFromStorage(id);
    loadLessons();
  };

  const handleDownload = (lesson: SavedLesson, format: 'pdf' | 'docx') => {
    const blob = new Blob([lesson.content], { 
      type: format === 'pdf' ? 'text/plain' : 'application/msword' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lesson.subject}_${lesson.classLevel}_Lesson.${format === 'pdf' ? 'pdf.txt' : 'doc'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLessons = lessons.filter(lesson => 
    lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.classLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <section className="min-h-screen bg-card py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                My Lesson Notes
              </h1>
              <p className="text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} saved
              </p>
            </div>
          </div>
          <Button variant="hero" onClick={onNewLesson}>
            <Plus className="w-4 h-4" />
            New Lesson
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by subject, class, or topic..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="bg-background rounded-2xl p-12 shadow-card border border-border text-center">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {searchQuery ? "No lessons found" : "No saved lessons yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try a different search term" 
                : "Create your first lesson note to get started"}
            </p>
            {!searchQuery && (
              <Button variant="hero" onClick={onNewLesson}>
                <Plus className="w-4 h-4" />
                Create Lesson
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-background rounded-xl p-5 shadow-card border border-border hover:shadow-lg transition-shadow animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(lesson.createdAt)}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-1">
                  {lesson.subject}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <GraduationCap className="w-4 h-4" />
                  {lesson.classLevel}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {lesson.topic}
                </p>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setPreviewLesson(lesson)}
                  >
                    <FileText className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditLesson(lesson)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{lesson.subject} - {lesson.classLevel}". 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(lesson.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewLesson} onOpenChange={() => setPreviewLesson(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {previewLesson?.subject} - {previewLesson?.classLevel}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto bg-muted/30 rounded-lg p-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {previewLesson?.content}
              </pre>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button 
                variant="hero" 
                className="flex-1"
                onClick={() => previewLesson && handleDownload(previewLesson, 'pdf')}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => previewLesson && handleDownload(previewLesson, 'docx')}
              >
                <Download className="w-4 h-4" />
                Download DOCX
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (previewLesson) {
                    onEditLesson(previewLesson);
                    setPreviewLesson(null);
                  }
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};
