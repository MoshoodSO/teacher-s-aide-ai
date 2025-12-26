import { useState } from "react";
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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Subject", description: "Choose subject & class" },
  { id: 2, title: "Curriculum", description: "Upload or enter content" },
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

const countries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United States",
  "United Kingdom", "Canada", "Australia", "India"
];

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

const templates = [
  { id: "universal", name: "Universal Template", description: "Standard lesson plan format" },
  { id: "5e", name: "5E Model", description: "Engage, Explore, Explain, Elaborate, Evaluate" },
  { id: "backward", name: "Backward Design", description: "Start with learning objectives" },
  { id: "direct", name: "Direct Instruction", description: "Teacher-centered approach" },
];

interface LessonGeneratorProps {
  onBack: () => void;
}

export const LessonGenerator = ({ onBack }: LessonGeneratorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    classLevel: "",
    country: "",
    curriculumFile: null as File | null,
    curriculumText: "",
    weeks: "all",
    specificWeeks: "",
    template: "universal",
    additionalNotes: "",
  });

  const updateForm = (field: string, value: any) => {
    setFormData(prev => {
      // Reset subject when class level changes
      if (field === "classLevel" && prev.classLevel !== value) {
        return { ...prev, [field]: value, subject: "" };
      }
      return { ...prev, [field]: value };
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.subject && formData.classLevel;
      case 2:
        return formData.curriculumFile || formData.curriculumText.trim();
      case 3:
        return true;
      default:
        return true;
    }
  };

  const generateLessonContent = () => {
    const templateName = templates.find(t => t.id === formData.template)?.name || "Universal Template";
    const weeksText = formData.weeks === "all" ? "All Weeks" : `Weeks: ${formData.specificWeeks}`;
    
    return `
LESSON PLAN
============

Subject: ${formData.subject}
Class: ${formData.classLevel}
Country: ${formData.country || "Nigeria"}
Template: ${templateName}
Duration: ${weeksText}

---

WEEK 1: INTRODUCTION TO ${formData.subject.toUpperCase()}

TOPIC: Fundamental Concepts and Principles

OBJECTIVES:
By the end of this lesson, students should be able to:
1. Define and explain the basic concepts of ${formData.subject}
2. Identify key principles and their applications
3. Demonstrate understanding through practical examples

INSTRUCTIONAL MATERIALS:
- Textbooks and reference materials
- Visual aids (charts, diagrams)
- Multimedia resources (videos, presentations)
- Real-world examples and case studies

LESSON PRESENTATION:

Step 1: Introduction (10 minutes)
- Welcome students and review previous knowledge
- Introduce the topic using engaging questions
- State the lesson objectives clearly

Step 2: Development (25 minutes)
- Present core concepts systematically
- Use illustrations and examples
- Encourage student participation and questions
- Apply interactive teaching methods

Step 3: Practice (10 minutes)
- Guided practice exercises
- Group discussions and activities
- Problem-solving scenarios

Step 4: Evaluation (10 minutes)
- Ask oral questions to assess understanding
- Written exercises or quizzes
- Provide immediate feedback

CONCLUSION:
- Summarize key points covered
- Connect to real-life applications
- Preview next lesson topics

ASSIGNMENT:
- Read relevant textbook chapters
- Complete practice exercises
- Research additional examples

TEACHER'S NOTES:
${formData.additionalNotes || "No additional notes provided."}

---

${formData.curriculumText ? `
CURRICULUM CONTENT PROVIDED:
${formData.curriculumText}
` : ""}

---
Generated by Teacher's Aid
    `.trim();
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    const content = generateLessonContent();
    setGeneratedContent(content);
    setIsGenerating(false);
    setIsGenerated(true);
  };

  const handleDownloadPDF = () => {
    // Create a blob with the content
    const content = generatedContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.subject}_${formData.classLevel}_Lesson_Plan.pdf.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDOCX = () => {
    // Create a blob with the content
    const content = generatedContent;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formData.subject}_${formData.classLevel}_Lesson_Plan.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
                  <Label>Country (Optional)</Label>
                  <Select value={formData.country} onValueChange={(v) => updateForm("country", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country for localized content" />
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

          {/* Step 2: Curriculum */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">Curriculum Content</h2>
                  <p className="text-sm text-muted-foreground">Upload or enter your curriculum/scheme of work</p>
                </div>
              </div>

              <FileUpload
                onFileSelect={(file) => updateForm("curriculumFile", file)}
                selectedFile={formData.curriculumFile}
                label="Upload curriculum (PDF or image)"
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-background text-sm text-muted-foreground">
                    or type it in
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Curriculum / Scheme of Work (Text)</Label>
                <Textarea
                  placeholder="Paste or type your curriculum content here. Include topics, subtopics, and objectives for each week..."
                  className="min-h-[200px] resize-none"
                  value={formData.curriculumText}
                  onChange={(e) => updateForm("curriculumText", e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Week Selection</Label>
                  <Select value={formData.weeks} onValueChange={(v) => updateForm("weeks", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      <SelectItem value="specific">Specific Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.weeks === "specific" && (
                  <div className="space-y-2">
                    <Label>Specify Weeks</Label>
                    <Input
                      placeholder="e.g., 1-4 or 1,3,5"
                      value={formData.specificWeeks}
                      onChange={(e) => updateForm("specificWeeks", e.target.value)}
                    />
                  </div>
                )}
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
                  <h2 className="font-display text-xl font-semibold">Output Settings</h2>
                  <p className="text-sm text-muted-foreground">Customize your lesson plan format</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Lesson Plan Template</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => updateForm("template", template.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all duration-200",
                        formData.template === template.id
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <p className="font-medium text-foreground">{template.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Any specific requirements or preferences for the lesson plan..."
                  className="min-h-[100px] resize-none"
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
                    <span className="text-muted-foreground">Curriculum:</span>
                    <span className="font-medium">
                      {formData.curriculumFile?.name || (formData.curriculumText ? "Text provided" : "None")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weeks:</span>
                    <span className="font-medium">
                      {formData.weeks === "all" ? "All weeks" : formData.specificWeeks}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span className="font-medium">
                      {templates.find(t => t.id === formData.template)?.name}
                    </span>
                  </div>
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
                      Generating Lesson Plan...
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
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="hero" size="lg" onClick={handleDownloadPDF}>
                        <Download className="w-5 h-5" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="lg" onClick={handleDownloadDOCX}>
                        <Download className="w-5 h-5" />
                        Download DOCX
                      </Button>
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
