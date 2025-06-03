import React from 'react';
import { formatDate } from '../../lib/utils'; // Assuming formatDate is in utils

const ResumePreview = ({ resumeData }) => {
  if (!resumeData) {
    return <div className="p-8 bg-white shadow-lg rounded-lg text-gray-500">Loading preview...</div>;
  }

  const { personalInfo, experience, education, skills } = resumeData;

  return (
    <div className="p-8 bg-white shadow-2xl rounded-lg w-full max-w-2xl mx-auto my-8 print-area">
      {/* Header */}
      <header className="text-center mb-8 pb-4">
        {personalInfo?.profileImage && (
          <img
            src={personalInfo.profileImage}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 shadow-lg border-2 border-gray-200"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-800">{personalInfo?.name || 'Your Name'}</h1>
        <p className="text-md text-gray-600 mt-1">
          {personalInfo?.email || 'your.email@example.com'}
          {personalInfo?.phone && ` | ${personalInfo.phone}`}
          {personalInfo?.address && ` | ${personalInfo.address}`}
        </p>
      </header>
      <div className="border-b mb-8"></div> {/* Separator line */}


      {/* Experience Section */}
      {experience?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-1 mb-3">Experience</h2>
          {experience.map((exp, index) => (
            <div key={exp.id || index} className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700">{exp.jobTitle || 'Job Title'}</h3>
              <p className="text-md text-gray-600">{exp.company || 'Company Name'} | {formatDate(exp.startDate)} - {exp.endDate === 'Present' ? 'Present' : formatDate(exp.endDate)}</p>
              <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{exp.responsibilities || 'Responsibilities...'}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-1 mb-3">Education</h2>
          {education.map((edu, index) => (
            <div key={edu.id || index} className="mb-4">
              <h3 className="text-xl font-semibold text-gray-700">{edu.degree || 'Degree'}</h3>
              <p className="text-md text-gray-600">{edu.institution || 'Institution Name'} | {formatDate(edu.graduationDate)}</p>
              {edu.details && <p className="text-sm text-gray-500 mt-1">{edu.details}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills Section */}
      {skills?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-1 mb-3">Skills</h2>
          <ul className="list-disc list-inside flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <li key={index} className="text-md text-gray-700 bg-gray-100 px-3 py-1 rounded-md">{skill}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Placeholder for other sections */}
      {/*
      {customSections?.map(section => (
        <section key={section.id} className="mb-6">
          <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-blue-200 pb-1 mb-3">{section.title}</h2>
          <p className="text-md text-gray-700 whitespace-pre-line">{section.content}</p>
        </section>
      ))}
      */}
    </div>
  );
};

export default ResumePreview;
