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

const subjects = [
  "Mathematics", "English Language", "Science", "Social Studies", 
  "History", "Geography", "Physics", "Chemistry", "Biology",
  "Computer Science", "Art", "Music", "Physical Education"
];

const countries = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United States",
  "United Kingdom", "Canada", "Australia", "India"
];

const classLevels = [
  "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"
];

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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setIsGenerated(true);
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
                  <Select value={formData.subject} onValueChange={(v) => updateForm("subject", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {subjects.map(subject => (
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
                    <p className="text-muted-foreground mb-6">
                      Your comprehensive lesson plan has been generated successfully.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="hero" size="lg">
                        <Download className="w-5 h-5" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="lg">
                        <Download className="w-5 h-5" />
                        Download DOCX
                      </Button>
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
