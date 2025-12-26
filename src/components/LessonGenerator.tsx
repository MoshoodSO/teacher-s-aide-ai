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
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SavedLesson, saveLessonToStorage } from "@/types/lesson";
import { useToast } from "@/hooks/use-toast";

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

// Generate appropriate content based on class level
const generateLevelAppropriateContent = (subject: string, classLevel: string, topic: string) => {
  const isJSS = classLevel.startsWith("JSS");
  
  if (isJSS) {
    return {
      objectives: [
        `Define and explain the meaning of ${topic} in simple terms`,
        `Identify at least three key features/characteristics of ${topic}`,
        `Give practical examples of ${topic} from everyday life`,
        `Demonstrate understanding by answering basic questions on ${topic}`
      ],
      content: `${topic} is an important concept in ${subject}. It helps students understand fundamental principles that they will build upon in higher classes.

DEFINITION:
${topic} refers to the basic concepts and principles that form the foundation of this subject area.

KEY POINTS:
1. Introduction to basic concepts
2. Simple explanations with relatable examples
3. Connection to daily life experiences
4. Foundation building for advanced topics

EXPLANATION:
This topic introduces students to essential knowledge in ${subject}. Using simple language and everyday examples, students will grasp the fundamental ideas that prepare them for more advanced studies.`,
      presentation: [
        "Teacher introduces the topic by asking students what they already know about the subject",
        "Teacher explains the meaning of the topic using simple language and visual aids",
        "Teacher uses local examples and demonstrations to illustrate key points",
        "Students participate in a class discussion and ask questions",
        "Teacher summarizes the main points and checks for understanding"
      ],
      evaluation: [
        `What is ${topic}?`,
        `Mention three characteristics of ${topic}`,
        `Give two examples of ${topic} from your environment`,
        `Why is ${topic} important?`
      ],
      assignment: [
        `Write five sentences explaining what you learned about ${topic}`,
        `Draw a diagram showing the key features of ${topic}`,
        `Find three examples of ${topic} in your home or community`
      ]
    };
  } else {
    return {
      objectives: [
        `Analyze and critically evaluate the concept of ${topic}`,
        `Compare and contrast different aspects/types of ${topic}`,
        `Apply theoretical knowledge of ${topic} to solve practical problems`,
        `Synthesize information to draw conclusions about ${topic}`
      ],
      content: `${topic} is a critical concept in ${subject} that requires in-depth understanding and analytical skills.

DEFINITION AND THEORETICAL FRAMEWORK:
${topic} encompasses the advanced principles and methodologies central to this subject area. Understanding this concept requires analyzing multiple perspectives and applying critical thinking.

DETAILED ANALYSIS:
1. Theoretical foundations and historical development
2. Core principles and their interrelationships
3. Practical applications in various contexts
4. Contemporary relevance and emerging trends
5. Critical evaluation of different viewpoints

ADVANCED CONCEPTS:
This topic builds upon foundational knowledge to explore complex relationships and applications. Students are expected to engage with scholarly materials, conduct analysis, and demonstrate higher-order thinking skills.

PRACTICAL APPLICATIONS:
- Real-world case studies
- Problem-solving scenarios
- Research methodologies
- Industry applications`,
      presentation: [
        "Teacher reviews previous knowledge and connects it to the new topic through guided questioning",
        "Teacher presents the theoretical framework using multimedia resources and scholarly references",
        "Students engage in group discussions to analyze case studies and real-world applications",
        "Teacher facilitates a critical analysis session where students compare different perspectives",
        "Students present their findings and conclusions; teacher provides feedback and clarification"
      ],
      evaluation: [
        `Critically analyze the concept of ${topic} and its significance in ${subject}`,
        `Compare and contrast at least two different approaches to ${topic}`,
        `Apply the principles of ${topic} to solve the given problem`,
        `Evaluate the importance of ${topic} in contemporary society`
      ],
      assignment: [
        `Write a 500-word essay analyzing the key aspects of ${topic}`,
        `Research and present a case study demonstrating the application of ${topic}`,
        `Prepare a detailed comparison chart showing different perspectives on ${topic}`
      ]
    };
  }
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
  const { toast } = useToast();
  
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

  // Load editing lesson data
  useEffect(() => {
    if (editingLesson) {
      setLessonId(editingLesson.id);
      setFormData(prev => ({
        ...prev,
        subject: editingLesson.subject,
        classLevel: editingLesson.classLevel,
        country: editingLesson.country || "",
        curriculumText: editingLesson.topic,
      }));
      setGeneratedContent(editingLesson.content);
      setIsGenerated(true);
      setCurrentStep(4);
    }
  }, [editingLesson]);

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
    const weeksText = formData.weeks === "all" ? "All Weeks" : `Weeks: ${formData.specificWeeks}`;
    const topic = formData.curriculumText ? formData.curriculumText.split('\n')[0].substring(0, 50) : `Introduction to ${formData.subject}`;
    const content = generateLevelAppropriateContent(formData.subject, formData.classLevel, topic);
    
    const currentDate = new Date().toLocaleDateString('en-NG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
LESSON NOTE
============

Date: ${currentDate}

Class: ${formData.classLevel}

Subject: ${formData.subject}

Topic: ${topic}

Sub-topic: ${formData.curriculumText ? "As per curriculum content provided" : "Fundamental Concepts"}

Time: 40 minutes

Duration: ${weeksText}

Period/Day: First Period / Monday

Reference Book(s):
- Approved ${formData.subject} Textbook for ${formData.classLevel}
- ${formData.country || "Nigeria"} National Curriculum
- Relevant supplementary materials and educational resources

Instructional Material(s):
- Chalkboard/Whiteboard and markers
- Charts and diagrams
- Pictures and visual aids
- Real objects and specimens (where applicable)
- Multimedia resources (projector, videos)

Entry Behaviour:
Students have been introduced to the foundational concepts of ${formData.subject} in previous lessons. They can identify basic terms and have some understanding of related topics from their environment.

Behavioural Objectives:
By the end of this lesson, students should be able to:
${content.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Content:
${content.content}

Presentation in Steps:

Step I - Introduction (5 minutes):
${content.presentation[0]}

Step II - Explanation/Development (15 minutes):
${content.presentation[1]}

Step III - Discussion/Activity (10 minutes):
${content.presentation[2]}

Step IV - Application (5 minutes):
${content.presentation[3]}

Step V - Summary (5 minutes):
${content.presentation[4]}

Conclusion:
The teacher summarizes the main points of the lesson, emphasizing the key concepts and their practical applications. Students are encouraged to relate the lesson to their daily experiences and prepare for the next class.

Evaluation:
As stated in the Behavioural Objectives, students will be evaluated through the following questions:
${content.evaluation.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Assignment:
${content.assignment.map((a, i) => `${i + 1}. ${a}`).join('\n')}

${formData.additionalNotes ? `
Teacher's Notes:
${formData.additionalNotes}
` : ""}
${formData.curriculumText ? `
---
Curriculum Content Provided:
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
    // Generate a new ID if not editing
    if (!lessonId) {
      setLessonId(crypto.randomUUID());
    }
  };

  const handleSaveLesson = () => {
    const topic = formData.curriculumText 
      ? formData.curriculumText.split('\n')[0].substring(0, 50) 
      : `Introduction to ${formData.subject}`;
    
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
                  <h2 className="font-display text-xl font-semibold">Additional Settings</h2>
                  <p className="text-sm text-muted-foreground">Add any extra notes or requirements</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-3">Lesson Note Format</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your lesson note will be generated using the standard Nigerian education format including:
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
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">Standard Nigerian Lesson Note</span>
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
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
                      <Button variant="hero" size="lg" onClick={handleSaveLesson}>
                        <Save className="w-5 h-5" />
                        {editingLesson ? "Update Lesson" : "Save to Dashboard"}
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
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
