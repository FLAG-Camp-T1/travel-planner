/**
 * Returns a greeting message randomly.
 * This function demonstrates how to use JS.
 *
 * @param {string} userName - The name of the user to greet.
 * @returns {string} A greeting message.
 */
export const getRandomGreeting = (userName) => {
  const name = userName || 'Guest';

  const greetings = [
    `Hello, ${name}! Welcome back!`,
    `Hi there, ${name}! Great to see you!`,
    `Welcome, ${name}! Hope you have a fantastic day!`,
    `Hey, ${name}! Ready for another adventure?`,
    `Greetings, ${name}! Let's make today amazing!`,
  ];

  const randomIndex = Math.floor(Math.random() * greetings.length);
  return greetings[randomIndex];
};
