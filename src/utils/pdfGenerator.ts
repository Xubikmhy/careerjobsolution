import jsPDF from 'jspdf';
import { Candidate } from '@/types';
import { getAgencySettings } from './agencySettings';

export const generateCandidateCV = (candidate: Candidate): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 25;

  const settings = getAgencySettings();

  // Helper function for centered text
  const centerText = (text: string, y: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Helper to add watermark logo
  const addWatermark = () => {
    if (settings.logoBase64 || settings.logoUrl) {
      const logoData = settings.logoBase64 || settings.logoUrl;
      if (logoData) {
        try {
          const logoSize = 80;
          const logoX = (pageWidth - logoSize) / 2;
          const logoY = (pageHeight - logoSize) / 2;
          
          // Save current state
          const currentGState = doc.saveGraphicsState();
          
          // Add low opacity watermark
          doc.setGState(doc.GState({ opacity: 0.08 }));
          doc.addImage(logoData, 'PNG', logoX, logoY, logoSize, logoSize);
          
          // Restore state
          doc.restoreGraphicsState();
        } catch (e) {
          console.warn('Failed to add watermark:', e);
        }
      }
    }
  };

  // Add watermark first (behind content)
  addWatermark();

  // Header Border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.5);
  doc.line(margin, 15, pageWidth - margin, 15);

  // Header - Name
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  centerText(candidate.fullName.toUpperCase(), yPos, 24);
  yPos += 10;

  // Contact Info line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  
  const contactParts: string[] = [];
  if (candidate.phone) contactParts.push(candidate.phone);
  if (candidate.address) contactParts.push(candidate.address);
  
  const contactLine = contactParts.join('  |  ');
  centerText(contactLine, yPos, 10);
  yPos += 8;

  // Personal details line
  const personalParts: string[] = [];
  if (candidate.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
    personalParts.push(`Age: ${age} years`);
  }
  if (candidate.nationality) personalParts.push(candidate.nationality);
  if (candidate.maritalStatus) personalParts.push(candidate.maritalStatus);
  
  if (personalParts.length > 0) {
    centerText(personalParts.join('  |  '), yPos, 9);
    yPos += 6;
  }

  // Languages
  if (candidate.languages && candidate.languages.length > 0) {
    centerText(`Languages: ${candidate.languages.join(', ')}`, yPos, 9);
    yPos += 8;
  }

  // Horizontal line after header
  yPos += 5;
  doc.setLineWidth(0.5);
  doc.setDrawColor(100, 100, 100);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Section helper
  const addSection = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.text(title.toUpperCase(), margin, yPos);
    yPos += 2;
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, margin + 35, yPos);
    yPos += 8;
  };

  // Career Objective
  if (candidate.careerObjective) {
    addSection('Career Objective');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const objectiveLines = doc.splitTextToSize(candidate.careerObjective, contentWidth);
    doc.text(objectiveLines, margin, yPos);
    yPos += objectiveLines.length * 5 + 10;
  }

  // Professional Summary
  addSection('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  
  const summaryText = `Dedicated and hardworking professional with ${candidate.experienceYears} years of hands-on experience. ` +
    `Completed ${candidate.educationLevel} level education. Seeking opportunities to contribute skills and grow professionally. ` +
    `Known for reliability, strong work ethic, and ability to work in team environments.`;
  
  const summaryLines = doc.splitTextToSize(summaryText, contentWidth);
  doc.text(summaryLines, margin, yPos);
  yPos += summaryLines.length * 5 + 12;

  // Work Experience
  addSection('Work Experience');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  if (candidate.workHistory && candidate.workHistory.length > 0) {
    candidate.workHistory.forEach((work, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        addWatermark();
        yPos = 25;
      }

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`${work.position}`, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`| ${work.company}`, margin + 5 + doc.getTextWidth(work.position + ' '), yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(work.duration, margin + 5, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const respLines = doc.splitTextToSize(`• ${work.responsibilities}`, contentWidth - 10);
      doc.text(respLines, margin + 5, yPos);
      yPos += respLines.length * 5 + 8;
    });
  } else {
    doc.setTextColor(50, 50, 50);
    doc.text(`• ${candidate.experienceYears} years of professional work experience`, margin + 5, yPos);
    yPos += 6;
    doc.text(`• Experienced in ${candidate.skills.slice(0, 3).join(', ')}`, margin + 5, yPos);
    yPos += 6;
    doc.text(`• Based in ${candidate.address}`, margin + 5, yPos);
    yPos += 12;
  }

  // Education
  if (yPos > pageHeight - 80) {
    doc.addPage();
    addWatermark();
    yPos = 25;
  }

  addSection('Education');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`• ${candidate.educationLevel}`, margin + 5, yPos);
  yPos += 12;

  // Skills
  addSection('Skills & Competencies');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  // Display skills in columns
  const skillsPerRow = 3;
  const skillWidth = contentWidth / skillsPerRow;
  candidate.skills.forEach((skill, index) => {
    const col = index % skillsPerRow;
    const row = Math.floor(index / skillsPerRow);
    if (col === 0 && row > 0) yPos += 6;
    doc.text(`• ${skill}`, margin + 5 + col * skillWidth, yPos);
  });
  yPos += 12;

  // Expected Salary
  if (yPos > pageHeight - 50) {
    doc.addPage();
    addWatermark();
    yPos = 25;
  }

  addSection('Expected Remuneration');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.text(`NPR ${candidate.expectedSalary.toLocaleString()} per month (negotiable)`, margin + 5, yPos);
  yPos += 12;

  // References
  if (candidate.referenceContacts && candidate.referenceContacts.length > 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      addWatermark();
      yPos = 25;
    }

    addSection('References');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    candidate.referenceContacts.forEach((ref) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(ref.name, margin + 5, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`${ref.relationship} at ${ref.company}`, margin + 5, yPos);
      yPos += 4;
      doc.text(`Phone: ${ref.phone}`, margin + 5, yPos);
      yPos += 8;
    });
  } else if (candidate.references) {
    addSection('References');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    doc.text(`• ${candidate.references}`, margin + 5, yPos);
    yPos += 12;
  }

  // Declaration
  if (yPos > pageHeight - 40) {
    doc.addPage();
    addWatermark();
    yPos = 25;
  }

  addSection('Declaration');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const declaration = 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.';
  const declLines = doc.splitTextToSize(declaration, contentWidth);
  doc.text(declLines, margin, yPos);
  yPos += declLines.length * 4 + 15;

  // Signature area
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text('Date: _______________', margin, yPos);
  doc.text('Signature: _______________', pageWidth - margin - 60, yPos);

  // Footer
  const footerY = pageHeight - 12;
  doc.setLineWidth(0.3);
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated by ${settings.agencyName}`, margin, footerY);
  doc.text(new Date().toLocaleDateString('en-NP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), pageWidth - margin - 35, footerY);

  // Save the PDF
  doc.save(`CV_${candidate.fullName.replace(/\s+/g, '_')}.pdf`);
};
