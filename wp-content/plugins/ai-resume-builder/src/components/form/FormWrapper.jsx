import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import PersonalInfoForm from './PersonalInfoForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import SkillsForm from './SkillsForm';
// Import other form sections if they were created

// Define a mapping from section key to component and title
const sectionComponents = {
  personalInfo: { Component: PersonalInfoForm, title: 'Personal Information' },
  experience: { Component: ExperienceForm, title: 'Work Experience' },
  education: { Component: EducationForm, title: 'Education' },
  skills: { Component: SkillsForm, title: 'Skills' },
  // Add other sections here if they become draggable
};

const FormWrapper = ({ resumeData, onResumeDataChange }) => {
  // Ensure sectionsOrder exists in resumeData, fallback to a default if not
  const sectionsOrder = resumeData.sectionsOrder || ['personalInfo', 'experience', 'education', 'skills'];

  const handleSectionDataChange = (sectionKey, newData) => {
    onResumeDataChange({ ...resumeData, [sectionKey]: newData });
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return; // Dropped outside the list
    if (source.index === destination.index) return; // Dropped in the same place

    const newSectionsOrder = Array.from(sectionsOrder);
    const [removed] = newSectionsOrder.splice(source.index, 1);
    newSectionsOrder.splice(destination.index, 0, removed);

    onResumeDataChange({ ...resumeData, sectionsOrder: newSectionsOrder });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-50 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Edit Your Resume
      </h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="resumeSections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
              {sectionsOrder.map((sectionKey, index) => {
                const section = sectionComponents[sectionKey];
                if (!section) return null; // Skip if sectionKey is invalid

                const { Component, title } = section;
                const data = resumeData[sectionKey];

                return (
                  <Draggable key={sectionKey} draggableId={sectionKey} index={index}>
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        className="p-1 bg-gray-100 rounded-md shadow-sm" // Added some bg for draggable area visibility
                      >
                        <div {...providedDraggable.dragHandleProps} className="p-2 bg-gray-200 text-gray-600 rounded-t-md cursor-move text-sm font-medium">
                          Drag to reorder: {title}
                        </div>
                        <Component
                          data={data}
                          onChange={(newData) => handleSectionDataChange(sectionKey, newData)}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default FormWrapper;
