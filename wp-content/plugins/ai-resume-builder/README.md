# AI Resume Builder WordPress Plugin

A powerful AI-assisted resume builder WordPress plugin with multiple templates, PDF/DOCX export, image uploading, and more.

## Key Features

*   WordPress Admin Interface for Resume Building
*   React-based Frontend
*   AI-Powered Content Suggestions (via Gemini API, proxied through WordPress)
*   Custom Post Type for Resume Template Management
*   Dynamic Template Loading
*   Drag & Drop Reordering of Resume Sections
*   Client-side PDF Export (using jsPDF & html2canvas)
*   Client-side DOCX Export (using docx.js)
*   Profile Image Uploading and Cropping
*   User Data Auto-Saved to Browser (2-hour expiry)
*   Tailwind CSS for Styling

## Plugin Installation (For End Users)

1.  Download the plugin ZIP file (e.g., `ai-resume-builder.zip`).
2.  In your WordPress admin dashboard, navigate to Plugins > Add New.
3.  Click 'Upload Plugin' and choose the downloaded ZIP file.
4.  Click 'Install Now' and then 'Activate Plugin'.
5.  Configure the Gemini API Key: Navigate to 'AI Resume Builder' in the admin menu, go to 'Settings' (this section is on the main plugin page), enter your Gemini API Key, and save.

## Development Setup (For Developers)

This plugin is built using React for the frontend and requires Node.js and npm for managing JavaScript dependencies and assets.

1.  Ensure you have a local WordPress development environment set up.
2.  Clone this repository into your `wp-content/plugins/` directory: `git clone <repository_url> ai-resume-builder` (Note: If you've cloned the entire monorepo, this plugin is already in `wp-content/plugins/ai-resume-builder`).
3.  Navigate to the plugin's directory: `cd wp-content/plugins/ai-resume-builder`
4.  Install JavaScript dependencies: `npm install --legacy-peer-deps` (the `--legacy-peer-deps` flag is currently needed due to some dependencies' compatibility with newer React versions).
5.  Build assets for development (with file watching): `npm run dev`
6.  Build assets for production: `npm run build`
7.  Activate the plugin in your WordPress admin under 'Plugins'.
8.  Configure the Gemini API Key: In the WordPress admin, navigate to 'AI Resume Builder', go to 'Settings' (this section is on the main plugin page), enter your Gemini API Key, and save.

## How to Use

*   **Admin Interface**: Access the main resume builder interface via the 'AI Resume Builder' menu item in your WordPress admin dashboard.
*   **Managing Templates**: Create and manage resume templates under the 'Resume Templates' Custom Post Type in the WordPress admin. Templates should be structured in JSON format (refer to `src/components/utility/DefaultResumeData.jsx` for the expected structure, including `sectionsOrder` for drag and drop).
*   **Building a Resume**: Use the forms to fill in resume details. The preview will update live. Utilize AI suggestions where available.
*   **Exporting**: Download your resume as a PDF or DOCX file using the provided buttons.

## Built With

*   WordPress (Plugin API, Settings API, Custom Post Types, AJAX)
*   PHP
*   React
*   Webpack & Babel
*   Tailwind CSS
*   jsPDF & html2canvas (for PDF export)
*   docx & file-saver (for DOCX export)
*   react-cropper & cropperjs (for image cropping)
*   react-beautiful-dnd (for drag and drop)
*   Google Gemini API (for AI suggestions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the `LICENSE` file in the main repository for details. (Assuming the main repo has a LICENSE file, or one should be added here if this plugin is standalone).
