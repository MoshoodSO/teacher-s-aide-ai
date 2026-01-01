import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "./FileUpload";
import { StepIndicator } from "./StepIndicator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  Wand2, 
  BookOpen, 
  FileText, 
  Settings, 
  Download,
  Sparkles,
  Loader2,
  Save,
  Plus,
  Trash2
} from "lucide-react";
import { SavedLesson, saveLessonToStorage } from "@/types/lesson";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateLessonPDF, generateLessonDOCX, generateLessonTeX } from "@/lib/pdfGenerator";

const steps = [
  { id: 1, title: "Lessons", description: "Add classes & subjects" },
  { id: 2, title: "Topics", description: "Enter topics for each" },
  { id: 3, title: "Settings", description: "Customize output" },
  { id: 4, title: "Generate", description: "Review & download" },
];

const jssSubjects = [
  "English Language", "Mathematics", "Basic Science", "Basic Technology",
  "Social Studies", "Business Studies", "Home Economics", "Agricultural Science",
  "Computer Studies", "Physical & Health Education", "Cultural & Creative Arts",
  "Christian Religious Studies (CRS)", "Islamic Studies (IS)"
];

const sssSubjects = [
  "English Language", "General Mathematics", "Computer Studies", "Civic Education",
  "Biology", "Chemistry", "Physics", "Agricultural Science", "Further Mathematics",
  "Geography", "Technical Drawing", "Literature in English", "Government",
  "Nigerian History", "Christian Religious Studies (CRS)", "Islamic Studies (IS)",
  "Hausa Language", "Igbo Language", "Yoruba Language",
  "Financial Accounting", "Commerce", "Marketing", "Economics", "Data Processing"
];

const countries = ["Nigeria", "Ghana"];

const classLevels = [
  "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"
];

const getSubjectsForClass = (classLevel: string) => {
  if (classLevel.startsWith("JSS")) {
    return jssSubjects;
  } else if (classLevel.startsWith("SSS")) {
    return sssSubjects;
  }
  return [];
};

interface LessonGeneratorProps {
  onBack: () => void;
  editingLesson?: SavedLesson | null;
  onSaveComplete?: () => void;
}

interface LessonEntry {
  id: string;
  classLevel: string;
  subject: string;
  topicText: string;
  topicFile: File | null;
}

export const LessonGenerator = ({ onBack, editingLesson, onSaveComplete }: LessonGeneratorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [isMathSubject, setIsMathSubject] = useState(false);
  const { toast } = useToast();
  
  // Batch lesson entries
  const [lessonEntries, setLessonEntries] = useState<LessonEntry[]>([
    { id: crypto.randomUUID(), classLevel: "", subject: "", topicText: "", topicFile: null }
  ]);
  
  // Shared form data
  const [formData, setFormData] = useState({
    country: "",
    week: "",
    weekDate: "",
    additionalNotes: "",
  });

  // Generated content for batch lessons
  const [generatedLessons, setGeneratedLessons] = useState<{ entry: LessonEntry; content: string; isMathSubject: boolean }[]>([]);

  // Load editing lesson data
  useEffect(() => {
    if (editingLesson) {
      setLessonId(editingLesson.id);
      setLessonEntries([{
        id: crypto.randomUUID(),
        classLevel: editingLesson.classLevel,
        subject: editingLesson.subject,
        topicText: editingLesson.topic,
        topicFile: null
      }]);
      setFormData(prev => ({
        ...prev,
        country: editingLesson.country || "",
      }));
      setGeneratedContent(editingLesson.content);
      setIsGenerated(true);
      setCurrentStep(4);
    }
  }, [editingLesson]);

  const updateForm = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLessonEntry = () => {
    setLessonEntries(prev => [...prev, {
      id: crypto.randomUUID(),
      classLevel: "",
      subject: "",
      topicText: "",
      topicFile: null
    }]);
  };

  const removeLessonEntry = (id: string) => {
    if (lessonEntries.length > 1) {
      setLessonEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };

  const updateLessonEntry = (id: string, field: keyof LessonEntry, value: string | File | null) => {
    setLessonEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        if (field === "classLevel") {
          return { ...entry, classLevel: value as string, subject: "" };
        }
        if (field === "topicFile") {
          return { ...entry, topicFile: value as File | null };
        }
        return { ...entry, [field]: value as string };
      }
      return entry;
    }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleFileSelectForEntry = async (entryId: string, file: File | null) => {
    updateLessonEntry(entryId, "topicFile", file);
    
    if (file && file.type.startsWith('image/')) {
      try {
        const base64 = await fileToBase64(file);
        (file as File & { base64?: string }).base64 = base64;
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return lessonEntries.every(entry => entry.subject && entry.classLevel) && formData.country;
      case 2:
        return lessonEntries.every(entry => entry.topicText.trim() || entry.topicFile) && formData.week && formData.weekDate;
      case 3:
        return true;
      default:
        return true;
    }
  };

  // Helper to clean ** bold markers from content
  const cleanBoldMarkers = (content: string): string => {
    return content.replace(/\*\*/g, '');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const generatedResults: { entry: LessonEntry; content: string; isMathSubject: boolean }[] = [];
    
    try {
      for (const entry of lessonEntries) {
        const topicContent = entry.topicText || (entry.topicFile ? `Content from file: ${entry.topicFile.name}` : '');
        const topicTitle = entry.topicText 
          ? entry.topicText.split('\n')[0].substring(0, 100) 
          : (entry.topicFile?.name || `Topic for ${entry.subject}`);

        const imageBase64 = entry.topicFile?.type?.startsWith('image/') 
          ? (entry.topicFile as File & { base64?: string }).base64 
          : undefined;

        const { data, error } = await supabase.functions.invoke('generate-lesson', {
          body: {
            subject: entry.subject,
            classLevel: entry.classLevel,
            country: formData.country || "Nigeria",
            topic: topicTitle,
            topicContent: topicContent,
            week: formData.week,
            weekDate: formData.weekDate,
            additionalNotes: formData.additionalNotes,
            imageBase64: imageBase64,
          }
        });

        if (error) throw error;

        if (data?.error) {
          toast({
            title: "Generation Error",
            description: `Failed for ${entry.subject} (${entry.classLevel}): ${data.error}`,
            variant: "destructive",
          });
          continue;
        }
        
        if (data?.content) {
          generatedResults.push({
            entry,
            content: cleanBoldMarkers(data.content),
            isMathSubject: data.isMathSubject || false
          });
        }
      }

      if (generatedResults.length > 0) {
        setGeneratedLessons(generatedResults);
        const combinedContent = generatedResults.map(r => r.content).join('\n\n' + '='.repeat(60) + '\n\n');
        setGeneratedContent(combinedContent);
        setIsMathSubject(generatedResults.some(r => r.isMathSubject));
        setIsGenerated(true);
        if (!lessonId) setLessonId(crypto.randomUUID());
        
        toast({
          title: `${generatedResults.length} lesson${generatedResults.length > 1 ? 's' : ''} generated!`,
          description: generatedResults.length > 1 
            ? "Your batch lesson notes are ready for download."
            : "Your AI-powered lesson note is ready.",
        });
      }
    } catch (error) {
      console.error("Error generating lessons:", error);
      toast({
        title: "Generation failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLesson = () => {
    generatedLessons.forEach((lessonData, index) => {
      const topic = lessonData.entry.topicText 
        ? lessonData.entry.topicText.split('\n')[0].substring(0, 50) 
        : (lessonData.entry.topicFile?.name || `Lesson for ${lessonData.entry.subject}`);
      
      const lesson: SavedLesson = {
        id: index === 0 && lessonId ? lessonId : crypto.randomUUID(),
        subject: lessonData.entry.subject,
        classLevel: lessonData.entry.classLevel,
        country: formData.country,
        topic,
        content: lessonData.content,
        createdAt: editingLesson?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveLessonToStorage(lesson);
    });
    
    toast({
      title: editingLesson ? "Lesson updated!" : `${generatedLessons.length} lesson${generatedLessons.length > 1 ? 's' : ''} saved!`,
      description: "Your lessons have been saved to your dashboard.",
    });
    onSaveComplete?.();
  };

  const handleDownloadPDF = () => {
    const subjects = generatedLessons.map(l => l.entry.subject).join(', ');
    const classes = [...new Set(generatedLessons.map(l => l.entry.classLevel))].join(', ');
    
    generateLessonPDF({
      subject: generatedLessons.length > 1 ? subjects : lessonEntries[0]?.subject || '',
      classLevel: generatedLessons.length > 1 ? classes : lessonEntries[0]?.classLevel || '',
      country: formData.country || "Nigeria",
      content: generatedContent,
      week: formData.week,
      weekDate: formData.weekDate
    });
    
    toast({
      title: "PDF Downloaded",
      description: `${generatedLessons.length} lesson note${generatedLessons.length > 1 ? 's have' : ' has'} been downloaded.`,
    });
  };

  const handleDownloadDOCX = () => {
    const subjects = generatedLessons.map(l => l.entry.subject).join(', ');
    const classes = [...new Set(generatedLessons.map(l => l.entry.classLevel))].join(', ');
    
    generateLessonDOCX(
      generatedContent, 
      generatedLessons.length > 1 ? subjects : lessonEntries[0]?.subject || '', 
      generatedLessons.length > 1 ? classes : lessonEntries[0]?.classLevel || '', 
      formData.week,
      formData.weekDate
    );
    
    toast({ title: "Document Downloaded", description: "Your lesson note has been downloaded." });
  };

  const handleDownloadTeX = () => {
    const subjects = generatedLessons.map(l => l.entry.subject).join(', ');
    const classes = [...new Set(generatedLessons.map(l => l.entry.classLevel))].join(', ');
    
    generateLessonTeX(
      generatedContent, 
      generatedLessons.length > 1 ? subjects : lessonEntries[0]?.subject || '', 
      generatedLessons.length > 1 ? classes : lessonEntries[0]?.classLevel || '', 
      formData.week,
      formData.weekDate
    );
    
    toast({ title: "LaTeX Downloaded", description: "Your math lesson has been downloaded." });
  };

  return (
    <section className="min-h-screen bg-card py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Lesson Plan Generator
            </h1>
            <p className="text-muted-foreground">
              Create multiple lesson notes at once
            </p>
          </div>
        </div>

        <div className="mb-12">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        <div className="bg-background rounded-2xl p-6 md:p-8 shadow-card border border-border animate-fade-in">
          {/* Step 1: Classes & Subjects */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Add Lessons</h2>
                  <p className="text-sm text-muted-foreground">Add multiple classes and subjects for batch generation</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <Label>Country *</Label>
                <Select value={formData.country} onValueChange={(v) => updateForm("country", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {lessonEntries.map((entry, index) => (
                  <div key={entry.id} className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-foreground">Lesson {index + 1}</span>
                      {lessonEntries.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeLessonEntry(entry.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Class Level *</Label>
                        <Select value={entry.classLevel} onValueChange={(v) => updateLessonEntry(entry.id, "classLevel", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classLevels.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Select 
                          value={entry.subject} 
                          onValueChange={(v) => updateLessonEntry(entry.id, "subject", v)}
                          disabled={!entry.classLevel}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={entry.classLevel ? "Select subject" : "Select class first"} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {getSubjectsForClass(entry.classLevel).map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={addLessonEntry} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Lesson
              </Button>
            </div>
          )}

          {/* Step 2: Topics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Topics for this Week</h2>
                  <p className="text-sm text-muted-foreground">Enter topics for each lesson</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Week Number *</Label>
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    placeholder="e.g., 1, 2, 3..."
                    value={formData.week}
                    onChange={(e) => updateForm("week", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Week Date *</Label>
                  <Input
                    type="date"
                    value={formData.weekDate}
                    onChange={(e) => updateForm("weekDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {lessonEntries.map((entry, index) => (
                  <div key={entry.id} className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="mb-3">
                      <span className="font-medium text-foreground">
                        {entry.subject} - {entry.classLevel}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <Textarea
                        placeholder={`Enter the topic for ${entry.subject}...`}
                        className="min-h-[100px] resize-none"
                        value={entry.topicText}
                        onChange={(e) => updateLessonEntry(entry.id, "topicText", e.target.value)}
                      />
                      <div className="text-xs text-muted-foreground">Or upload a file:</div>
                      <FileUpload
                        onFileSelect={(file) => handleFileSelectForEntry(entry.id, file)}
                        selectedFile={entry.topicFile}
                        accept=".pdf,.jpg,.jpeg,.png"
                        label="Upload topic (PDF or Image)"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  AI-Powered Batch Generation
                </h4>
                <p className="text-sm text-muted-foreground">
                  All {lessonEntries.length} lesson{lessonEntries.length > 1 ? 's' : ''} will be generated and combined into a single PDF.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Additional Settings</h2>
                  <p className="text-sm text-muted-foreground">Add any extra notes or requirements</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Lesson Note Format</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your lesson notes will be generated using the standard {formData.country || "Nigerian"} education format.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Date, Class, Subject, Topic, Sub-topic</li>
                  <li>Time, Duration, Period/Day</li>
                  <li>Reference Books & Instructional Materials</li>
                  <li>Entry Behaviour & Behavioural Objectives</li>
                  <li>Content, Presentation Steps</li>
                  <li>Conclusion, Evaluation & Assignment</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements, special considerations, or additional information..."
                  className="min-h-[120px] resize-none"
                  value={formData.additionalNotes}
                  onChange={(e) => updateForm("additionalNotes", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: Generate */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Generate & Download</h2>
                  <p className="text-sm text-muted-foreground">Review your settings and generate</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Summary</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span className="font-medium">{lessonEntries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="font-medium">{formData.country || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Week:</span>
                    <span className="font-medium">{formData.week ? `Week ${formData.week}` : "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formData.weekDate || "Not specified"}</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  {lessonEntries.map((entry, index) => (
                    <div key={entry.id} className="flex justify-between py-1 text-sm">
                      <span className="text-muted-foreground">{index + 1}. {entry.classLevel}</span>
                      <span className="font-medium">{entry.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!isGenerated ? (
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating {lessonEntries.length} Lesson{lessonEntries.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate {lessonEntries.length} Lesson Plan{lessonEntries.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-4 animate-fade-up">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {generatedLessons.length} Lesson{generatedLessons.length > 1 ? 's' : ''} Ready!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your lesson plans have been generated successfully.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
                      <Button variant="hero" size="lg" onClick={handleSaveLesson}>
                        <Save className="w-5 h-5" />
                        {editingLesson ? "Update Lesson" : "Save to Dashboard"}
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                      <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
                        <Download className="w-5 h-5" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="lg" onClick={handleDownloadDOCX}>
                        <Download className="w-5 h-5" />
                        Download DOCX
                      </Button>
                      {isMathSubject && (
                        <Button variant="outline" size="lg" onClick={handleDownloadTeX}>
                          <Download className="w-5 h-5" />
                          Download TeX
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-background border border-border rounded-xl p-6">
                    <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Lesson Plan Preview
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                      <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                        {generatedContent}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < 4 && (
              <Button
                variant="default"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
