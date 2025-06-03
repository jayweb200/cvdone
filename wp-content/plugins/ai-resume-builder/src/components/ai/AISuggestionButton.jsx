import React, { useState } from 'react';
import { Button } from '../ui/Button'; // Assuming Button component exists
import { FaMagic } from 'react-icons/fa'; // Example icon

/**
 * A button that, when clicked, calls a provided onSuggest function
 * (which is expected to trigger an AI suggestion fetch) and displays a loading state.
 *
 * @param {Object} props
 * @param {Function} props.onSuggest - Async function to call when suggestion is requested. Should return a Promise.
 * @param {string} [props.buttonText='Get AI Suggestion'] - Text for the button.
 * @param {React.ReactNode} [props.children] - Alternative to buttonText for more complex content.
 * @param {string} [props.className] - Additional class names for the button.
 * @param {Object} [props.variant='outline'] - Button variant.
 * @param {Object} [props.size='sm'] - Button size.
 */
const AISuggestionButton = ({
  onSuggest,
  buttonText = 'Get AI Suggestion',
  children,
  className,
  variant = 'outline',
  size = 'sm',
  ...restProps
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSuggest(); // The parent component handles the result of onSuggest
    } catch (err) {
      console.error('AI Suggestion fetch error:', err);
      setError(err.message || 'Failed to get suggestion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-suggestion-button-container my-2">
      <Button
        onClick={handleClick}
        disabled={isLoading}
        className={className}
        variant={variant}
        size={size}
        {...restProps}
      >
        <FaMagic className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Generating...' : (children || buttonText)}
      </Button>
      {error && <p className="text-red-500 text-xs mt-1">Error: {error}</p>}
    </div>
  );
};

export default AISuggestionButton;
