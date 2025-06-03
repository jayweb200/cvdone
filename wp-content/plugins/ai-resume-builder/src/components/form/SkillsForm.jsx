import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FaPlus, FaTimes } from 'react-icons/fa';

const SkillsForm = ({ data, onChange }) => {
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAddSkill = () => {
    if (currentSkill.trim() && !data?.includes(currentSkill.trim())) {
      onChange([...(data || []), currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange(data?.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Skills</h3>
      <div className="flex items-center mb-4">
        <Input
          type="text"
          value={currentSkill}
          onChange={(e) => setCurrentSkill(e.target.value)}
          placeholder="Add a skill"
          className="mr-2 flex-grow"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSkill();
            }
          }}
        />
        <Button type="button" onClick={handleAddSkill} size="sm" className="flex items-center">
          <FaPlus className="mr-1" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {data?.map((skill, index) => (
          <div
            key={index}
            className="flex items-center bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
          >
            {skill}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill)}
              className="ml-2 text-blue-500 hover:text-blue-700"
              aria-label="Remove skill"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsForm;
