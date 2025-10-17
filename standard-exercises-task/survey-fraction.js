// Load fraction-survey stylesheet
const fractionSurveyStylesheet = document.createElement('link');
fractionSurveyStylesheet.rel = 'stylesheet';
fractionSurveyStylesheet.href = 'survey-fraction.css';
document.head.appendChild(fractionSurveyStylesheet);

// Create HTML for a single vertical fraction
function createFractionHTML(num, den) {
  return `
    <div class="fraction">
      <span class="numerator">${num}</span>
      <span class="denominator">${den}</span>
    </div>
  `;
}
