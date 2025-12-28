import jsPDF from 'jspdf';

interface LessonPDFData {
  subject: string;
  classLevel: string;
  country: string;
  content: string;
  week?: string;
}

const isMathSubject = (subject: string): boolean => {
  return subject === "General Mathematics" || subject === "Further Mathematics" || subject === "Mathematics";
};

export const generateLessonPDF = ({ subject, classLevel, country, content, week }: LessonPDFData): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  const lineHeight = 6;
  const sectionGap = 8;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
  };

  // Header with gradient effect (simulated with rectangle)
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LESSON NOTE', margin, 18);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${subject} - ${classLevel}`, margin, 28);
  doc.text(`${country || 'Nigeria'} Curriculum${week ? ` | Week ${week}` : ''}`, margin, 35);
  
  if (isMathSubject(subject)) {
    doc.setFontSize(10);
    doc.text('Contains mathematical notation (LaTeX)', margin, 42);
  }

  yPosition = 55;

  // Add decorative line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += sectionGap;

  // Parse and format content
  const lines = content.split('\n');

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      yPosition += lineHeight / 2;
      return;
    }

    // Skip the first "LESSON NOTE" and "============" lines
    if (trimmedLine === 'LESSON NOTE' || trimmedLine === '============') {
      return;
    }

    // Check for section headers (lines ending with :)
    if (trimmedLine.endsWith(':') && !trimmedLine.includes(': ')) {
      checkPageBreak(lineHeight * 2);
      
      // Add spacing before section
      yPosition += sectionGap / 2;
      
      // Section header styling
      doc.setFillColor(243, 244, 246); // Light gray background
      doc.roundedRect(margin - 2, yPosition - 5, contentWidth + 4, 8, 1, 1, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(trimmedLine, margin, yPosition);
      yPosition += lineHeight + 2;
    }
    // Key-value pairs (e.g., "Subject: Mathematics")
    else if (trimmedLine.includes(': ') && !trimmedLine.startsWith('-') && !trimmedLine.startsWith('•')) {
      const [key, ...valueParts] = trimmedLine.split(': ');
      const value = valueParts.join(': ');
      
      checkPageBreak(lineHeight);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(`${key}:`, margin, yPosition);
      
      const keyWidth = doc.getTextWidth(`${key}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      
      const remainingWidth = contentWidth - keyWidth;
      const valueLines = doc.splitTextToSize(value, remainingWidth);
      
      doc.text(valueLines[0] || '', margin + keyWidth, yPosition);
      yPosition += lineHeight;
      
      // Handle wrapped value lines
      for (let i = 1; i < valueLines.length; i++) {
        checkPageBreak(lineHeight);
        doc.text(valueLines[i], margin + keyWidth, yPosition);
        yPosition += lineHeight;
      }
    }
    // Step headers (e.g., "Step I - Introduction")
    else if (trimmedLine.startsWith('Step ')) {
      checkPageBreak(lineHeight * 2);
      yPosition += 4;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(trimmedLine, margin, yPosition);
      yPosition += lineHeight;
    }
    // Numbered items
    else if (/^\d+\.\s/.test(trimmedLine)) {
      checkPageBreak(lineHeight);
      addWrappedText(trimmedLine, 10, false, [55, 65, 81]);
    }
    // Bullet points
    else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
      checkPageBreak(lineHeight);
      const bulletText = trimmedLine.replace(/^[-•]\s*/, '• ');
      addWrappedText(bulletText, 10, false, [75, 85, 99]);
    }
    // Regular paragraph text
    else {
      addWrappedText(trimmedLine, 10, false, [0, 0, 0]);
    }
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by Teacher's Aid", margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Save the PDF
  const weekSuffix = week ? `_Week${week}` : '';
  const fileName = `${subject.replace(/\s+/g, '_')}_${classLevel.replace(/\s+/g, '_')}${weekSuffix}_Lesson_Note.pdf`;
  doc.save(fileName);
};

export const generateLessonDOCX = (content: string, subject: string, classLevel: string, week?: string): void => {
  // Create a formatted HTML version for DOCX-like download
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject} - ${classLevel}${week ? ` Week ${week}` : ''} Lesson Note</title>
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; margin: 40px; }
    h1 { color: #2563eb; font-size: 24pt; margin-bottom: 10px; }
    h2 { color: #2563eb; font-size: 14pt; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .header { background: #2563eb; color: white; padding: 20px; margin: -40px -40px 20px -40px; }
    .header h1 { color: white; margin: 0; }
    .header p { margin: 5px 0 0 0; opacity: 0.9; }
    .section { margin: 15px 0; }
    .label { font-weight: bold; color: #374151; }
    ul { margin: 10px 0; padding-left: 20px; }
    li { margin: 5px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10pt; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>LESSON NOTE</h1>
    <p>${subject} - ${classLevel}${week ? ` | Week ${week}` : ''}</p>
  </div>
  <pre style="white-space: pre-wrap; font-family: 'Times New Roman', serif;">${content}</pre>
  <div class="footer">Generated by Teacher's Aid</div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const weekSuffix = week ? `_Week${week}` : '';
  link.download = `${subject.replace(/\s+/g, '_')}_${classLevel.replace(/\s+/g, '_')}${weekSuffix}_Lesson_Note.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateLessonTeX = (content: string, subject: string, classLevel: string, week?: string): void => {
  // Create LaTeX document
  const texContent = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{xcolor}
\\usepackage{titlesec}

\\geometry{margin=2.5cm}
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{${subject} - ${classLevel}${week ? ` | Week ${week}` : ''}}
\\lhead{Lesson Note}
\\rfoot{Page \\thepage}
\\lfoot{Generated by Teacher's Aid}

\\definecolor{primaryblue}{RGB}{37,99,235}

\\titleformat{\\section}{\\large\\bfseries\\color{primaryblue}}{}{0em}{}
\\titleformat{\\subsection}{\\normalsize\\bfseries}{}{0em}{}

\\title{\\textcolor{primaryblue}{\\textbf{LESSON NOTE}}\\\\[0.5em]
\\large ${subject} - ${classLevel}${week ? ` \\\\ Week ${week}` : ''}}
\\author{Nigeria/Ghana Curriculum}
\\date{\\today}

\\begin{document}

\\maketitle

${content
  .replace(/\$/g, '\\$')
  .replace(/\\\\$/g, '$') // Restore LaTeX math
  .replace(/#/g, '\\#')
  .replace(/%/g, '\\%')
  .replace(/&/g, '\\&')
  .replace(/_/g, '\\_')
  .replace(/\^/g, '\\^{}')
  .split('\n')
  .map(line => {
    const trimmed = line.trim();
    if (trimmed === 'LESSON NOTE' || trimmed === '============') return '';
    if (trimmed.endsWith(':') && !trimmed.includes(': ')) {
      return `\\section*{${trimmed.replace(':', '')}}`;
    }
    if (trimmed.startsWith('Step ')) {
      return `\\subsection*{${trimmed}}`;
    }
    if (/^\\d+\\.\\s/.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      return `\\begin{itemize}\\item ${trimmed.replace(/^[-•]\\s*/, '')}\\end{itemize}`;
    }
    return trimmed;
  })
  .join('\n\n')}

\\end{document}`;

  const blob = new Blob([texContent], { type: 'application/x-tex' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const weekSuffix = week ? `_Week${week}` : '';
  link.download = `${subject.replace(/\s+/g, '_')}_${classLevel.replace(/\s+/g, '_')}${weekSuffix}_Lesson_Note.tex`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
