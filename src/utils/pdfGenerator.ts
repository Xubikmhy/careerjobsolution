import jsPDF from 'jspdf';
import { Candidate } from '@/types';
import { getAgencySettings } from './agencySettings';

export const generateCandidateCV = (candidate: Candidate): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const settings = getAgencySettings();

  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue-600
  const darkColor: [number, number, number] = [15, 23, 42]; // Slate-900
  const grayColor: [number, number, number] = [71, 85, 105]; // Slate-500
  const lightGray: [number, number, number] = [148, 163, 184]; // Slate-400

  const checkPageBreak = (needed: number) => {
    if (yPos + needed > pageHeight - 25) {
      doc.addPage();
      addWatermark();
      yPos = 20;
    }
  };

  const addWatermark = () => {
    if (settings.logoBase64 || settings.logoUrl) {
      const logoData = settings.logoBase64 || settings.logoUrl;
      if (logoData) {
        try {
          const logoSize = 70;
          doc.saveGraphicsState();
          doc.setGState(doc.GState({ opacity: 0.06 }));
          doc.addImage(logoData, 'PNG', (pageWidth - logoSize) / 2, (pageHeight - logoSize) / 2, logoSize, logoSize);
          doc.restoreGraphicsState();
        } catch (e) { console.warn('Watermark failed:', e); }
      }
    }
  };

  addWatermark();

  // ─── Header: Blue accent bar ───
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  yPos = 22;

  // Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...darkColor);
  doc.text(candidate.fullName.toUpperCase(), margin, yPos);
  yPos += 10;

  // Contact line with separator dots
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  const contactParts: string[] = [];
  if (candidate.phone) contactParts.push(candidate.phone);
  if (candidate.address) contactParts.push(candidate.address);
  doc.text(contactParts.join('  •  '), margin, yPos);
  yPos += 6;

  // Personal info line
  const personalParts: string[] = [];
  if (candidate.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
    personalParts.push(`Age: ${age}`);
  }
  if (candidate.nationality) personalParts.push(candidate.nationality);
  if (candidate.maritalStatus) personalParts.push(candidate.maritalStatus);
  if (personalParts.length > 0) {
    doc.text(personalParts.join('  •  '), margin, yPos);
    yPos += 6;
  }

  // Languages
  if (candidate.languages && candidate.languages.length > 0) {
    doc.text(`Languages: ${candidate.languages.join(', ')}`, margin, yPos);
    yPos += 6;
  }

  // Divider
  yPos += 4;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 12;

  // ─── Section Helper ───
  const addSection = (title: string) => {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(title.toUpperCase(), margin, yPos);
    yPos += 1.5;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.4);
    doc.line(margin, yPos, margin + doc.getTextWidth(title.toUpperCase()) + 4, yPos);
    yPos += 7;
  };

  const addBodyText = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    checkPageBreak(lines.length * 5);
    doc.text(lines, margin + indent, yPos);
    yPos += lines.length * 5;
  };

  // ─── Career Objective ───
  if (candidate.careerObjective) {
    addSection('Career Objective');
    addBodyText(candidate.careerObjective);
    yPos += 6;
  }

  // ─── Professional Summary ───
  addSection('Professional Summary');
  const summaryText = `Results-oriented professional with ${candidate.experienceYears} year${candidate.experienceYears !== 1 ? 's' : ''} of practical experience. ` +
    `Holds ${candidate.educationLevel} level education with proficiency in ${candidate.skills.slice(0, 4).join(', ')}. ` +
    `Recognized for reliability, adaptability, and a strong commitment to delivering quality work.`;
  addBodyText(summaryText);
  yPos += 6;

  // ─── Work Experience ───
  addSection('Work Experience');
  if (candidate.workHistory && candidate.workHistory.length > 0) {
    candidate.workHistory.forEach((work) => {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...darkColor);
      doc.text(work.position, margin + 4, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayColor);
      doc.setFontSize(10);
      doc.text(` — ${work.company}`, margin + 4 + doc.getTextWidth(work.position + ' '), yPos);
      yPos += 5;

      if (work.duration) {
        doc.setFontSize(9);
        doc.setTextColor(...lightGray);
        doc.text(work.duration, margin + 4, yPos);
        yPos += 5;
      }

      if (work.responsibilities) {
        doc.setFontSize(10);
        doc.setTextColor(...darkColor);
        const respLines = doc.splitTextToSize(`• ${work.responsibilities}`, contentWidth - 8);
        checkPageBreak(respLines.length * 5);
        doc.text(respLines, margin + 4, yPos);
        yPos += respLines.length * 5 + 4;
      }
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    const expItems = [
      `${candidate.experienceYears} year${candidate.experienceYears !== 1 ? 's' : ''} of professional work experience`,
      `Skilled in ${candidate.skills.slice(0, 3).join(', ')}`,
      `Based in ${candidate.address}`,
    ];
    expItems.forEach((item) => {
      checkPageBreak(6);
      doc.text(`•  ${item}`, margin + 4, yPos);
      yPos += 6;
    });
  }
  yPos += 6;

  // ─── Education ───
  addSection('Education');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(`•  ${candidate.educationLevel}`, margin + 4, yPos);
  yPos += 10;

  // ─── Skills & Competencies ───
  addSection('Skills & Competencies');
  checkPageBreak(Math.ceil(candidate.skills.length / 3) * 7 + 5);

  const skillColWidth = contentWidth / 3;
  candidate.skills.forEach((skill, i) => {
    const col = i % 3;
    const x = margin + 4 + col * skillColWidth;
    if (col === 0 && i > 0) yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...darkColor);
    doc.text(`•  ${skill}`, x, yPos);
  });
  yPos += 10;

  // ─── Expected Salary ───
  addSection('Expected Remuneration');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(`NPR ${candidate.expectedSalary.toLocaleString()} per month (negotiable)`, margin + 4, yPos);
  yPos += 10;

  // ─── References ───
  if (candidate.referenceContacts && candidate.referenceContacts.length > 0) {
    addSection('References');
    candidate.referenceContacts.forEach((ref) => {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(ref.name, margin + 4, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...grayColor);
      doc.text(`${ref.relationship} at ${ref.company}  |  ${ref.phone}`, margin + 4, yPos);
      yPos += 7;
    });
  } else if (candidate.references) {
    addSection('References');
    addBodyText(`•  ${candidate.references}`, 4);
    yPos += 6;
  }

  // ─── Declaration ───
  checkPageBreak(35);
  addSection('Declaration');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  const declaration = 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.';
  const declLines = doc.splitTextToSize(declaration, contentWidth);
  doc.text(declLines, margin, yPos);
  yPos += declLines.length * 4 + 14;

  // Signature
  checkPageBreak(15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('Date: _______________', margin, yPos);
  doc.text('Signature: _______________', pageWidth - margin - 55, yPos);

  // ─── Footer ───
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 10;
    doc.setDrawColor(...lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(8);
    doc.setTextColor(...lightGray);
    doc.text(`Generated by ${settings.agencyName}`, margin, footerY);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2 - 10, footerY);
    doc.text(new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin - 40, footerY);

    // Bottom accent bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');
  }

  doc.save(`CV_${candidate.fullName.replace(/\s+/g, '_')}.pdf`);
};
