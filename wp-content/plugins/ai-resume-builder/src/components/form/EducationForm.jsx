import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { generateId } from '../../lib/utils';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';

const EducationForm = ({ data, onChange }) => {
  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = [...data];
    updatedEducation[index] = { ...updatedEducation[index], [name]: value };
    onChange(updatedEducation);
  };

  const addEducation = () => {
    const newEducation = {
      id: generateId(),
      degree: '',
      institution: '',
      graduationDate: '',
      details: '', // e.g., GPA, honors
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index) => {
    const updatedEducation = data.filter((_, i) => i !== index);
    onChange(updatedEducation);
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Education</h3>
      {data?.map((edu, index) => (
        <div key={edu.id || index} className="mb-6 p-4 border rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Degree/Certificate</label>
              <Input
                type="text"
                name="degree"
                value={edu.degree || ''}
                onChange={(e) => handleEducationChange(index, e)}
                placeholder="e.g., B.S. in Computer Science"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Institution</label>
              <Input
                type="text"
                name="institution"
                value={edu.institution || ''}
                onChange={(e) => handleEducationChange(index, e)}
                placeholder="e.g., University of Example"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Graduation Date</label>
              <Input
                type="date"
                name="graduationDate"
                value={edu.graduationDate || ''}
                onChange={(e) => handleEducationChange(index, e)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Details (Optional)</label>
            <textarea
              name="details"
              value={edu.details || ''}
              onChange={(e) => handleEducationChange(index, e)}
              placeholder="e.g., GPA, Honors, relevant coursework"
              className="w-full h-20 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="mt-2 text-right">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => removeEducation(index)}
            >
              <FaTrashAlt className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={addEducation} variant="outline" className="mt-2 flex items-center">
        <FaPlus className="mr-1" /> Add Education
      </Button>
    </div>
  );
};

export default EducationForm;
