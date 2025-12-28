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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SavedLesson, saveLessonToStorage } from "@/types/lesson";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateLessonPDF, generateLessonDOCX, generateLessonTeX } from "@/lib/pdfGenerator";

const steps = [
  { id: 1, title: "Subject", description: "Choose subject & class" },
  { id: 2, title: "Topic", description: "Enter or upload topic" },
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

export const LessonGenerator = ({ onBack, editingLesson, onSaveComplete }: LessonGeneratorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [isExtractingContent, setIsExtractingContent] = useState(false);
  const [extractedFileContent, setExtractedFileContent] = useState("");
  const [isMathSubject, setIsMathSubject] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    classLevel: "",
    country: "",
    topicFile: null as File | null,
    topicText: "",
    week: "",
    additionalNotes: "",
  });

  // Load editing lesson data
  useEffect(() => {
    if (editingLesson) {
      setLessonId(editingLesson.id);
      setFormData(prev => ({
        ...prev,
        subject: editingLesson.subject,
        classLevel: editingLesson.classLevel,
        country: editingLesson.country || "",
        topicText: editingLesson.topic,
      }));
      setGeneratedContent(editingLesson.content);
      setIsGenerated(true);
      setCurrentStep(4);
    }
  }, [editingLesson]);

  const updateForm = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => {
      // Reset subject when class level changes
      if (field === "classLevel" && prev.classLevel !== value) {
        return { ...prev, [field]: value, subject: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  // Handle file selection and content extraction
  const handleFileSelect = async (file: File | null) => {
    updateForm("topicFile", file);
    
    if (!file) {
      setExtractedFileContent("");
      return;
    }

    setIsExtractingContent(true);
    
    try {
      if (file.type.startsWith('image/')) {
        // For images, we'll send as base64 to the AI for vision analysis
        const base64 = await fileToBase64(file);
        setExtractedFileContent(`[Image uploaded: ${file.name}]\nImage will be analyzed with AI vision for topic content.`);
        
        // Store base64 for later use with AI vision
        (file as File & { base64?: string }).base64 = base64;
      } else if (file.type === 'application/pdf') {
        // For PDFs, extract text content
        const text = await extractTextFromPDF(file);
        setExtractedFileContent(text || `[PDF uploaded: ${file.name}]\nPDF content will be used for lesson generation.`);
      }
      
      toast({
        title: "File uploaded",
        description: "Your topic file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "File processing error",
        description: "Could not process the file. Please try typing your topic instead.",
        variant: "destructive",
      });
    } finally {
      setIsExtractingContent(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Basic PDF text extraction - reads raw text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string and try to extract readable text
    let text = '';
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const content = decoder.decode(uint8Array);
    
    // Extract text between stream markers (basic PDF text extraction)
    const textMatches = content.match(/\((.*?)\)/g);
    if (textMatches) {
      text = textMatches
        .map(match => match.slice(1, -1))
        .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
        .join(' ')
        .replace(/\\[nrt]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    return text || `Content from PDF: ${file.name}`;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.subject && formData.classLevel;
      case 2:
        return (formData.topicFile || formData.topicText.trim()) && formData.week;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Get topic content from either text input or extracted file content
      const topicContent = formData.topicText || extractedFileContent;
      const topicTitle = formData.topicText 
        ? formData.topicText.split('\n')[0].substring(0, 100) 
        : (formData.topicFile?.name || `Topic for ${formData.subject}`);

      // Get base64 from uploaded image file if available
      const imageBase64 = formData.topicFile?.type?.startsWith('image/') 
        ? (formData.topicFile as File & { base64?: string }).base64 
        : undefined;

      const { data, error } = await supabase.functions.invoke('generate-lesson', {
        body: {
          subject: formData.subject,
          classLevel: formData.classLevel,
          country: formData.country || "Nigeria",
          topic: topicTitle,
          topicContent: topicContent,
          week: formData.week,
          additionalNotes: formData.additionalNotes,
          imageBase64: imageBase64,
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Generation Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }
      
      if (data?.content) {
        setGeneratedContent(data.content);
        setIsMathSubject(data.isMathSubject || false);
        setIsGenerated(true);
        if (!lessonId) {
          setLessonId(crypto.randomUUID());
        }
        toast({
          title: "Lesson generated!",
          description: data.isMathSubject 
            ? "Your AI-powered math lesson with LaTeX notation is ready."
            : "Your AI-powered lesson note is ready.",
        });
      }
    } catch (error) {
      console.error("Error generating lesson:", error);
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
    const topic = formData.topicText 
      ? formData.topicText.split('\n')[0].substring(0, 50) 
      : (formData.topicFile?.name || `Lesson for ${formData.subject}`);
    
    const lesson: SavedLesson = {
      id: lessonId || crypto.randomUUID(),
      subject: formData.subject,
      classLevel: formData.classLevel,
      country: formData.country,
      topic,
      content: generatedContent,
      createdAt: editingLesson?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveLessonToStorage(lesson);
    toast({
      title: editingLesson ? "Lesson updated!" : "Lesson saved!",
      description: "Your lesson has been saved to your dashboard.",
    });
    onSaveComplete?.();
  };

  const handleDownloadPDF = () => {
    generateLessonPDF({
      subject: formData.subject,
      classLevel: formData.classLevel,
      country: formData.country || "Nigeria",
      content: generatedContent,
      week: formData.week
    });
    
    toast({
      title: "PDF Downloaded",
      description: "Your lesson note has been downloaded as a PDF.",
    });
  };

  const handleDownloadDOCX = () => {
    generateLessonDOCX(generatedContent, formData.subject, formData.classLevel, formData.week);
    
    toast({
      title: "Document Downloaded",
      description: "Your lesson note has been downloaded.",
    });
  };

  const handleDownloadTeX = () => {
    generateLessonTeX(generatedContent, formData.subject, formData.classLevel, formData.week);
    
    toast({
      title: "LaTeX Downloaded",
      description: "Your math lesson with LaTeX notation has been downloaded.",
    });
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
              Fill in the details to create your customized lesson plan
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-12">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Form Content */}
        <div className="bg-background rounded-2xl p-6 md:p-8 shadow-card border border-border animate-fade-in">
          {/* Step 1: Subject & Class */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Subject & Class</h2>
                  <p className="text-sm text-muted-foreground">Choose the subject and class level</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Class Level *</Label>
                  <Select value={formData.classLevel} onValueChange={(v) => updateForm("classLevel", v)}>
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
                    value={formData.subject} 
                    onValueChange={(v) => updateForm("subject", v)}
                    disabled={!formData.classLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.classLevel ? "Select subject" : "Select class first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {getSubjectsForClass(formData.classLevel).map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
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
              </div>
            </div>
          )}

          {/* Step 2: Topic Input */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Topic for this Week</h2>
                  <p className="text-sm text-muted-foreground">Enter the week number and topic details</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Week Number *</Label>
                <Input
                  type="number"
                  min="1"
                  max="52"
                  placeholder="Enter week number (e.g., 1, 2, 3...)"
                  value={formData.week}
                  onChange={(e) => updateForm("week", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Type your topic *</Label>
                <Textarea
                  placeholder="Enter the topic you want to teach this week. Be specific and include any sub-topics if needed.

Example:
Topic: Introduction to Photosynthesis
- Definition of photosynthesis
- Importance of sunlight
- Role of chlorophyll
- Products of photosynthesis"
                  className="min-h-[150px] resize-none"
                  value={formData.topicText}
                  onChange={(e) => updateForm("topicText", e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-background text-sm text-muted-foreground">
                    or upload a file
                  </span>
                </div>
              </div>

              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={formData.topicFile}
                accept=".pdf,.jpg,.jpeg,.png"
                label="Upload topic (PDF or Image)"
              />

              {isExtractingContent && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing file...
                </div>
              )}

              {extractedFileContent && !isExtractingContent && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">File Content Preview</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {extractedFileContent.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  AI-Powered Generation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Our AI will analyze your topic and generate a comprehensive lesson note 
                  tailored to the {formData.classLevel || "selected"} level curriculum.
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
                  Your lesson note will be generated using the standard {formData.country || "Nigerian"} education format including:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Date, Class, Subject, Topic, Sub-topic</li>
                  <li>• Time, Duration, Period/Day</li>
                  <li>• Reference Books & Instructional Materials</li>
                  <li>• Entry Behaviour & Behavioural Objectives</li>
                  <li>• Content (comprehensive and level-appropriate)</li>
                  <li>• Presentation in Steps (I to V)</li>
                  <li>• Conclusion, Evaluation & Assignment</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements, special considerations, or additional information for the lesson note..."
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

              {/* Summary */}
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-foreground">Summary</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{formData.subject || "Not selected"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span className="font-medium">{formData.classLevel || "Not selected"}</span>
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
                    <span className="text-muted-foreground">Topic:</span>
                    <span className="font-medium truncate max-w-[200px]">
                      {formData.topicText 
                        ? formData.topicText.split('\n')[0].substring(0, 30) + (formData.topicText.length > 30 ? '...' : '')
                        : formData.topicFile?.name || "None"}
                    </span>
                  </div>
                  {(formData.subject === "General Mathematics" || formData.subject === "Further Mathematics" || formData.subject === "Mathematics") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Output:</span>
                      <span className="font-medium text-primary">LaTeX + DOCX</span>
                    </div>
                  )}
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
                      Generating Lesson Plan with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate Lesson Plan
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
                      Lesson Plan Ready!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Your comprehensive lesson plan has been generated successfully.
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

                  {/* Lesson Preview */}
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

                  <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-accent" />
                      Presentation Guide
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Start with an engaging hook related to the topic</li>
                      <li>• Use visual aids and real-world examples</li>
                      <li>• Allow time for student questions after each section</li>
                      <li>• Include interactive activities to reinforce learning</li>
                      <li>• End with a summary and preview of next lesson</li>
                    </ul>
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
