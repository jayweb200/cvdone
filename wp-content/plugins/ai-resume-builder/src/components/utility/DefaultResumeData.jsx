// Placeholder for DefaultResumeData.jsx
// In a real scenario, this would export an object with default resume structure.
export const defaultResumeData = {
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, Anytown, USA',
    profileImage: null, // Added profileImage field
  },
  experience: [
    {
      id: 1,
      jobTitle: 'Software Engineer',
      company: 'Tech Solutions Inc.',
      startDate: '2020-01-01',
      endDate: 'Present',
      responsibilities: 'Developed and maintained web applications.',
    },
  ],
  education: [
    {
      id: 1,
      degree: 'B.S. in Computer Science',
      institution: 'University of Example',
      graduationDate: '2019-12-31',
    },
  ],
  skills: ['JavaScript', 'React', 'Node.js', 'WordPress'],
  sectionsOrder: ['personalInfo', 'experience', 'education', 'skills'], // Default order
  // Add other sections as needed by the original components
};

// Placeholder for any other utility functions or data if needed
export const anotherUtilityFunction = () => {
  // console.log("Another utility function");
};
