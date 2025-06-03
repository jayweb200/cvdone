import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { generateId } from '../../lib/utils'; // For new entries
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import AISuggestionButton from '../ai/AISuggestionButton'; // Import AI Button
import { generateExperienceBulletPoints } from '../../lib/gemini'; // Import gemini helper

const ExperienceForm = ({ data, onChange }) => {
  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...data];
    updatedExperience[index] = { ...updatedExperience[index], [name]: value };
    onChange(updatedExperience);
  };

  const addExperience = () => {
    const newExperience = {
      id: generateId(),
      jobTitle: '',
      company: '',
      startDate: '',
      endDate: '',
      responsibilities: '',
    };
    onChange([...data, newExperience]);
  };

  const removeExperience = (index) => {
    const updatedExperience = data.filter((_, i) => i !== index);
    onChange(updatedExperience);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Work Experience</h3>
      {data?.map((exp, index) => (
        <div key={exp.id || index} className="mb-6 p-4 border rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Job Title</label>
              <Input
                type="text"
                name="jobTitle"
                value={exp.jobTitle || ''}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="e.g., Software Engineer"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Company</label>
              <Input
                type="text"
                name="company"
                value={exp.company || ''}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="e.g., Tech Solutions Inc."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
              <Input
                type="date"
                name="startDate"
                value={exp.startDate || ''}
                onChange={(e) => handleExperienceChange(index, e)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
              <Input
                type="date"
                name="endDate"
                value={exp.endDate || ''}
                onChange={(e) => handleExperienceChange(index, e)}
                placeholder="Present or End Date"
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Responsibilities</label>
            <textarea
              name="responsibilities"
              value={exp.responsibilities || ''}
              onChange={(e) => handleExperienceChange(index, e)}
              placeholder="Describe your role and achievements"
              className="w-full h-24 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
              <AISuggestionButton
                onSuggest={async () => {
                  try {
                    const suggestion = await generateExperienceBulletPoints(exp.jobTitle, exp.company, exp.responsibilities);
                    // Update the specific experience entry's responsibilities
                    const updatedExperience = [...data];
                    updatedExperience[index] = { ...updatedExperience[index], responsibilities: suggestion };
                    onChange(updatedExperience);
                  } catch (error) {
                    // Error is already logged by AISuggestionButton, but can handle more here if needed
                    console.error("Failed to apply AI suggestion to form:", error);
                    // Potentially show a more specific error message to the user in the form
                  }
                }}
                buttonText="Suggest Responsibilities"
                variant="ghost"
                size="sm"
                className="mt-1 text-xs text-blue-600 hover:text-blue-800"
              />
          </div>
          <div className="mt-2 text-right">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeExperience(index)}
            >
              <FaTrashAlt className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addExperience} variant="outline" className="mt-2 flex items-center">
        <FaPlus className="mr-1" /> Add Experience
      </Button>
    </div>
  );
};

export default ExperienceForm;
