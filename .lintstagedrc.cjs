const isWin = process.platform === "win32";

module.exports = {
  "backend/**/*.java": () => isWin 
    ? "backend\\gradlew.bat spotlessCheck -p backend" 
    : "./backend/gradlew spotlessCheck -p backend",

  "frontend/**/*.{js,jsx,ts,tsx}": [
    "npm --prefix frontend run lint:staged --",
    "npm --prefix frontend run format:check --"
  ],

  "frontend/**/*.{css,scss,less,html,json,md}": [
    "npm --prefix frontend run format:check --"
  ]
};