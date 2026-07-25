import { jsPDF } from 'jspdf';
import { Project } from '../types';

export function exportToPDF(project: Project) {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(124, 58, 237); // Purple header accent
  doc.rect(0, 0, 210, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("SWARM AI - STRATEGIC BOARDROOM EVALUATION", 14, 10);
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.text(`Project Audit: ${project.idea.substring(0, 50)}${project.idea.length > 50 ? '...' : ''}`, 14, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Project ID: ${project.id}  |  Date: ${new Date(project.createdAt).toLocaleString()}`, 14, 32);
  
  // Score block
  doc.setFillColor(245, 243, 255);
  doc.rect(14, 37, 182, 22, 'F');
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(109, 40, 217);
  doc.text(`Composite V-Score: ${project.score}%`, 20, 48);
  
  if (project.subScores) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Market & Demand: ${project.subScores.market}%  |  Risk Survival: ${project.subScores.riskSurvival}%  |  Tech Feasibility: ${project.subScores.techFeasibility}%`, 20, 54);
  }

  // Consensus Resolution
  let currentY = 67;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("1. Consensus Director Decision & Resolution", 14, currentY);
  
  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const splitResolution = doc.splitTextToSize(project.strategist || "No resolution available", 180);
  doc.text(splitResolution, 14, currentY);

  currentY += splitResolution.length * 4.5 + 8;

  // Final Plan
  if (currentY < 250) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("2. Key Strategic Execution Roadmap", 14, currentY);
    
    currentY += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const cleanPlan = (project.final_plan || "").replace(/[#*`]/g, '');
    const splitPlan = doc.splitTextToSize(cleanPlan.substring(0, 1000), 180);
    doc.text(splitPlan, 14, currentY);
  }

  doc.save(`swarm-ai-audit-${project.id}.pdf`);
}

export function exportToMarkdown(project: Project) {
  const content = `# SWARM AI Strategic Boardroom Audit

**Project Pitch:** ${project.idea}  
**Project ID:** \`${project.id}\`  
**Evaluation Date:** ${new Date(project.createdAt).toLocaleString()}  
**Composite V-Score:** **${project.score}%**

${project.subScores ? `### Component Sub-Scores & Rubrics
- **Market & Demand (35% Weight):** ${project.subScores.market}%
- **Risk Survival (35% Weight):** ${project.subScores.riskSurvival}%
- **Technical Feasibility (30% Weight):** ${project.subScores.techFeasibility}%
` : ''}

---

## 1. Consensus Director Decision & Resolution
${project.strategist}

---

## 2. Final Strategic Execution Roadmap
${project.final_plan}

---

## 3. Boardroom Dialectic Outputs

### Dr. Evelyn Carter (Research Specialist)
${project.research}

${project.groundingSources && project.groundingSources.length > 0 ? `
#### Live Web Grounding Sources:
${project.groundingSources.map(s => `- [${s.title || s.url}](${s.url})`).join('\n')}
` : ''}

---

### Julian Vance (Threat & Risk Auditor)
${project.critic}

---

### Chief Architect Linus (Systems Architect)
${project.engineer}
`;

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `swarm-audit-${project.id}.md`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
