// Resume PDF Generator using jsPDF
// This utility generates a professional resume PDF matching the desired format

export const generateResumePDF = async (formData) => {
    // Dynamically import jsPDF from CDN
    const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Helper function to add text with word wrap
    const addText = (text, x, y, maxWidth, fontSize = 10, fontStyle = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * (fontSize * 0.4));
    };

    // Helper function to add section heading
    const addSectionHeading = (title, y) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 2, pageWidth - margin, y + 2);
        return y + 8;
    };

    // Helper function to add bullet point
    const addBullet = (text, y) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('•', margin + 5, y);
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        doc.text(lines, margin + 10, y);
        return y + (lines.length * 4);
    };

    // ===== HEADER =====
    // Name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(formData.name || 'Your Name', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    // Role
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Full Stack Developer', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // Contact Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const contactLine1 = `${formData.phone || ''} | ${formData.email || ''}`;
    doc.text(contactLine1, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;

    const contactLine2 = `LinkedIn: ${formData.linkedin || 'N/A'} | GitHub: ${formData.portfolio || 'N/A'}`;
    doc.text(contactLine2, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // ===== CAREER OBJECTIVE =====
    yPos = addSectionHeading('Career Objective', yPos);
    yPos = addText(formData.objective || 'Your career objective here.', margin, yPos, contentWidth);
    yPos += 6;

    // ===== EDUCATION =====
    yPos = addSectionHeading('Education', yPos);
    if (formData.education) {
        const eduLines = formData.education.split('\n');
        eduLines.forEach(line => {
            if (line.trim()) {
                yPos = addBullet(line.trim(), yPos);
            }
        });
    }
    yPos += 6;

    // ===== TECHNICAL SKILLS =====
    yPos = addSectionHeading('Technical Skills', yPos);
    if (formData.skills) {
        const skillLines = formData.skills.split('\n');
        skillLines.forEach(line => {
            if (line.trim()) {
                yPos = addText(line.trim(), margin, yPos, contentWidth, 10, 'normal');
            }
        });
    }
    yPos += 6;

    // ===== PROJECTS =====
    yPos = addSectionHeading('Project', yPos);
    if (formData.projects) {
        const projectLines = formData.projects.split('\n');
        projectLines.forEach(line => {
            if (line.trim()) {
                if (line.includes('http')) {
                    // It's a link
                    doc.setTextColor(0, 0, 255);
                    yPos = addText(line.trim(), margin, yPos, contentWidth, 10, 'normal');
                    doc.setTextColor(0, 0, 0);
                } else if (line.startsWith('•') || line.startsWith('-')) {
                    yPos = addBullet(line.replace(/^[•-]\s*/, ''), yPos);
                } else {
                    yPos = addText(line.trim(), margin, yPos, contentWidth, 10, 'bold');
                }
            }
        });
    }
    yPos += 6;

    // ===== SOFT SKILLS =====
    if (formData.softSkills) {
        yPos = addSectionHeading('Soft Skills', yPos);
        yPos = addText(formData.softSkills, margin, yPos, contentWidth);
        yPos += 6;
    }

    // ===== DECLARATION =====
    yPos = addSectionHeading('Declaration', yPos);
    yPos = addText(formData.declaration || 'I hereby declare that the information furnished above is true to the best of my knowledge.', margin, yPos, contentWidth);

    // Save PDF
    const fileName = `${formData.name.replace(/\s+/g, '_')}_Resume.pdf`;
    doc.save(fileName);

    return { success: true, fileName };
};

// Alternative: Generate using HTML template (simpler approach)
export const generateResumeFromHTML = (formData) => {
    // Create a hidden div with resume HTML
    const resumeHTML = `
    <div id="resume-print" style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 24px;">${formData.name}</h1>
        <p style="margin: 5px 0; font-style: italic;">Full Stack Developer</p>
        <p style="margin: 5px 0; font-size: 12px;">${formData.phone} | ${formData.email}</p>
        <p style="margin: 5px 0; font-size: 12px;">LinkedIn: ${formData.linkedin} | GitHub: ${formData.portfolio}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Career Objective</h2>
        <p>${formData.objective}</p>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Education</h2>
        <pre style="white-space: pre-wrap; font-family: Arial;">${formData.education}</pre>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Technical Skills</h2>
        <pre style="white-space: pre-wrap; font-family: Arial;">${formData.skills}</pre>
      </div>
      
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Project</h2>
        <pre style="white-space: pre-wrap; font-family: Arial;">${formData.projects}</pre>
      </div>
      
      ${formData.softSkills ? `
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Soft Skills</h2>
        <p>${formData.softSkills}</p>
      </div>
      ` : ''}
      
      <div style="margin: 20px 0;">
        <h2 style="border-bottom: 2px solid #000; padding-bottom: 5px;">Declaration</h2>
        <p>${formData.declaration}</p>
      </div>
    </div>
  `;

    // Open print dialog
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write('<html><head><title>Resume</title></head><body>');
    printWindow.document.write(resumeHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
};
