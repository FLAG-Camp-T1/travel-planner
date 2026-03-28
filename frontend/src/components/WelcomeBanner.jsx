import { getRandomGreeting } from '@/utils/greetingHelper';

/**
 * A Welcome Banner component by pure JavaScript XML.
 * This snippet is JSDoc, to demonstrate how to provide type information and documentation for other developers using the component.
 * @component
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.userName - The name of the user to greet.
 * @returns {JSX.Element} A welcome banner element with a random greeting message.
 */
export default function WelcomeBanner(props) {
  const greetingText = getRandomGreeting(props.userName);

  return (
    <div className="bg-gradient-to-r from-amber-100 to-orange-200 p-4 rounded-xl shadow-sm border border-orange-300 mb-6">
      <h3 className="text-lg font-bold text-orange-800">{greetingText}</h3>
      <div className="mt-3 text-xs text-orange-600 font-medium flex items-center gap-1">
        <span>
          -- This component is powered by pure JavaScript <code>.jsx</code> ---
        </span>
      </div>
    </div>
  );
}
