import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BulletPoint,
} from 'docx';

// Helper function to create a standard paragraph with optional styling
function createStyledParagraph(text, styleOptions = {}) {
  const {
    bold = false,
    size = 20, // Default size 10pt (20 half-points)
    font = 'Calibri',
    alignment = AlignmentType.LEFT,
    color = '000000', // Default black
    isHeading = false,
    headingLevel = HeadingLevel.HEADING_1, // Only if isHeading is true
  } = styleOptions;

  const textRuns = [
    new TextRun({
      text,
      bold,
      size,
      font,
      color,
    }),
  ];

  if (isHeading) {
    return new Paragraph({
      children: textRuns,
      heading: headingLevel,
      alignment,
    });
  }
  return new Paragraph({
    children: textRuns,
    alignment,
  });
}

// Helper for contact line with an icon (placeholder for icon, docx doesn't directly support icons like FontAwesome)
function createContactLine(iconPlaceholder, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${iconPlaceholder} `, font: 'Symbol', size: 20 }), // Placeholder, Symbol font might have some icons
      new TextRun({ text, size: 20, font: 'Calibri' }),
    ],
    spacing: { after: 100 }, // Add some space after the paragraph
  });
}

export function buildDocx(resumeData) {
  const { personalInfo, experience, education, skills, sectionsOrder } = resumeData;
  const children = [];

  // Define a component map for ordering if sectionsOrder is used
  const sectionRenderers = {
    personalInfo: () => {
      if (!personalInfo) return [];
      const piSection = [
        createStyledParagraph(personalInfo.name || 'Your Name', {
          isHeading: true,
          headingLevel: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          size: 36, // Larger for name
          bold: true,
        }),
        createStyledParagraph(
          `${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${personalInfo.address || ''}`,
          {
            alignment: AlignmentType.CENTER,
            size: 20, // Smaller for contact details
            color: '555555',
          }
        ),
        new Paragraph({ text: '', spacing: { after: 300 } }), // Spacer
      ];
      return piSection;
    },
    experience: () => {
      if (!experience || experience.length === 0) return [];
      const expSection = [
        createStyledParagraph('Work Experience', {
          isHeading: true,
          headingLevel: HeadingLevel.HEADING_2,
          size: 28,
          bold: true,
        }),
      ];
      experience.forEach(exp => {
        expSection.push(
          createStyledParagraph(exp.jobTitle || 'Job Title', { bold: true, size: 24 })
        );
        expSection.push(
          createStyledParagraph(
            `${exp.company || 'Company'} | ${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
            { size: 20, color: '333333' }
          )
        );
        if (exp.responsibilities) {
          // Split responsibilities by newline and create bullet points
          exp.responsibilities.split('\n').filter(line => line.trim() !== '').forEach(resp => {
            expSection.push(
              new Paragraph({
                children: [new TextRun({ text: resp, size: 20 })],
                bullet: { level: 0 },
                indent: { left: 720 }, // 0.5 inch indent
                spacing: { after: 100 },
              })
            );
          });
        }
        expSection.push(new Paragraph({ text: '', spacing: { after: 200 } })); // Spacer after each entry
      });
      return expSection;
    },
    education: () => {
      if (!education || education.length === 0) return [];
      const eduSection = [
        createStyledParagraph('Education', {
          isHeading: true,
          headingLevel: HeadingLevel.HEADING_2,
          size: 28,
          bold: true,
        }),
      ];
      education.forEach(edu => {
        eduSection.push(
          createStyledParagraph(edu.degree || 'Degree', { bold: true, size: 24 })
        );
        eduSection.push(
          createStyledParagraph(
            `${edu.institution || 'Institution'} | ${edu.graduationDate || 'Graduation Date'}`,
            { size: 20, color: '333333' }
          )
        );
        if (edu.details) {
           eduSection.push(createStyledParagraph(edu.details, { size: 20, color: '555555' }));
        }
        eduSection.push(new Paragraph({ text: '', spacing: { after: 200 } })); // Spacer
      });
      return eduSection;
    },
    skills: () => {
      if (!skills || skills.length === 0) return [];
      const skillsSection = [
        createStyledParagraph('Skills', {
          isHeading: true,
          headingLevel: HeadingLevel.HEADING_2,
          size: 28,
          bold: true,
        }),
        // Render skills as a comma-separated list or individual bullet points
        // For simplicity, a single paragraph with comma-separated skills:
        new Paragraph({
          children: [new TextRun({ text: skills.join(', '), size: 20 })],
          spacing: { after: 200 }
        })
        // Or for bullet points:
        // ...skills.map(skill => new Paragraph({ text: skill, bullet: { level: 0 } }))
      ];
      return skillsSection;
    },
    // Add other sections if present in resumeData and sectionsOrder
  };

  // Use sectionsOrder if available, otherwise a default order
  const currentSectionsOrder = sectionsOrder || ['personalInfo', 'experience', 'education', 'skills'];
  currentSectionsOrder.forEach(sectionKey => {
    if (sectionRenderers[sectionKey]) {
      children.push(...sectionRenderers[sectionKey]());
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { // Standard 1-inch margins
            top: 1440, // 1 inch = 1440 twentieths of a point (twips)
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: children.length > 0 ? children : [new Paragraph("No content available.")],
    }],
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            font: "Calibri",
            size: 22, // 11pt default
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            color: "333333",
          },
          paragraph: {
            spacing: { after: 240, before: 240 }, // 12pt spacing
          },
        },
         {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28, // 14pt
            bold: true,
            color: "444444",
          },
          paragraph: {
            spacing: { after: 200, before: 200 },
          },
        },
      ],
    },
  });

  return Packer.toBlob(doc);
}
