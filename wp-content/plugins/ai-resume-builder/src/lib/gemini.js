/**
 * Fetches AI-generated content suggestions from the WordPress backend via AJAX.
 *
 * @param {string} prompt The prompt to send to the AI.
 * @returns {Promise<string>} A promise that resolves with the AI's suggestion text.
 * @throws {Error} If the request fails or the API returns an error.
 */
export async function fetchAISuggestion(prompt) {
  // Ensure global aiResumeBuilder object and necessary properties are available
  if (!window.aiResumeBuilder || !window.aiResumeBuilder.ajax_url || !window.aiResumeBuilder.ai_suggestion_nonce) {
    console.error('AI Resume Builder localization data is missing (ajax_url or nonce).');
    throw new Error('AI configuration is missing. Cannot fetch suggestion.');
  }

  const { ajax_url, ai_suggestion_nonce } = window.aiResumeBuilder;

  const formData = new FormData();
  formData.append('action', 'airb_get_ai_suggestion'); // WordPress AJAX action
  formData.append('security_nonce', ai_suggestion_nonce); // Nonce for security
  formData.append('prompt', prompt);

  try {
    const response = await fetch(ajax_url, {
      method: 'POST',
      body: formData,
      // Headers are not strictly necessary for FormData with fetch,
      // but 'Accept' can be good practice.
      // 'Content-Type': 'application/x-www-form-urlencoded' is implied by FormData.
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      // Attempt to parse error response from wp_send_json_error
      const errorData = await response.json().catch(() => ({ message: 'HTTP error with non-JSON response' }));
      throw new Error(errorData.data?.message || `HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    if (responseData.success) {
      return responseData.data.suggestion;
    } else {
      // Error from wp_send_json_error
      const message = responseData.data?.message || 'An unknown error occurred while fetching AI suggestion.';
      const details = responseData.data?.details;
      console.error('AI Suggestion Error:', message, details);
      throw new Error(message);
    }
  } catch (error) {
    console.error('Failed to fetch AI suggestion:', error);
    throw error; // Re-throw to be caught by the calling component
  }
}

// Example of a more specific function if needed, e.g., for resume bullet points
/**
 * Generates bullet points for a given job description or role.
 * @param {string} jobTitle
 * @param {string} company
 * @param {string} currentResponsibilities (optional) existing text to refine
 * @returns {Promise<string>}
 */
export async function generateExperienceBulletPoints(jobTitle, company, currentResponsibilities = '') {
  const prompt = `Generate 3-5 concise, action-oriented bullet points for a resume based on the following job information.
If existing responsibilities are provided, refine them or add to them.
Job Title: ${jobTitle}
Company: ${company}
${currentResponsibilities ? `Existing Responsibilities (to refine/add to):\n${currentResponsibilities}` : ''}

Focus on achievements and skills. Start each bullet point with an action verb.`;

  return fetchAISuggestion(prompt);
}

// Add other specific helper functions that use fetchAISuggestion as needed.
// For example, a function to summarize experience or suggest skills.
export async function suggestSkillsForRole(jobTitle, description = '') {
  const prompt = `Based on the job title "${jobTitle}" ${description ? `and description: "${description}"` : ''}, suggest 5-7 relevant skills for a resume. Return as a comma-separated list.`;
  const result = await fetchAISuggestion(prompt);
  return result.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
}
