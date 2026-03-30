// ── RENDER RESULTS ──
// Called by upload.js after Gemini responds
// Takes the full analysis object and fills every card on screen
function renderResults(analysis) {
    renderDishCard(analysis);
    renderNutrition(analysis.nutrition);
    renderQuality(
        analysis.qualityScore,
        analysis.qualityTitle,
        analysis.insights,
    );
    renderLacksAndExcess(analysis.whatMealLacks, analysis.whatIsInExcess);
    renderImprovements(analysis.improvements);
    renderActivities(analysis.activities);
}

// ── DISH CARD ──
function renderDishCard(analysis) {
    document.getElementById("dish-name").textContent = analysis.dishName;
    document.getElementById("dish-description").textContent =
        analysis.description;
    document.getElementById("portion-note").textContent = analysis.portionNote;

    // Confidence badge — color changes based on High/Medium/Low
    const badge = document.getElementById("confidence-badge");
    badge.textContent = analysis.confidence + " confidence";
    badge.className = "badge"; // reset first
    badge.classList.add("badge-" + analysis.confidence.toLowerCase());
}

// ── NUTRITION GRID ──
function renderNutrition(nutrition) {
    const grid = document.getElementById("nutrition-grid");

    // Define what we want to show and in what order
    const items = [
        {
            label: "Calories",
            value: nutrition.calories,
            unit: "kcal",
            highlight: true,
        },
        { label: "Protein", value: nutrition.protein_g, unit: "g" },
        { label: "Carbs", value: nutrition.carbs_g, unit: "g" },
        { label: "Fat", value: nutrition.fat_g, unit: "g" },
        { label: "Saturated Fat", value: nutrition.saturated_fat_g, unit: "g" },
        { label: "Fibre", value: nutrition.fiber_g, unit: "g" },
        { label: "Sugar", value: nutrition.sugar_g, unit: "g" },
        { label: "Sodium", value: nutrition.sodium_mg, unit: "mg" },
    ];

    grid.innerHTML = items
        .map(
            (item) => `
        <div class="nutrition-item ${item.highlight ? "highlight" : ""}">
            <div class="nutrition-value">${Math.round(item.value)}</div>
            <div class="nutrition-label">${item.label}</div>
            <div class="nutrition-unit">${item.unit}</div>
        </div>
    `,
        )
        .join("");
}

// ── QUALITY SCORE ──
function renderQuality(score, title, insights) {
    // Score circle — border color changes based on score
    const scoreColor =
        score >= 7
            ? "var(--good)"
            : score >= 5
              ? "var(--warn)"
              : "var(--danger)";

    document.getElementById("quality-display").innerHTML = `
        <div class="score-circle" style="border-color: ${scoreColor};">
            <span class="score-number" style="color: ${scoreColor};">${score}</span>
            <span class="score-out-of">/10</span>
        </div>
        <div>
            <div class="score-title">${title}</div>
            <div class="subtle">${
                score >= 7
                    ? "Good nutritional balance"
                    : score >= 5
                      ? "Some room for improvement"
                      : "Needs significant improvement"
            }</div>
        </div>
    `;

    // Insights list
    const insightsList = document.getElementById("insights-list");
    insightsList.innerHTML = insights
        .map(
            (insight) => `
        <li class="insight-item ${insight.type}">
            <div class="insight-dot"></div>
            <div class="insight-content">
                <strong>${insight.title}</strong>
                ${insight.detail}
            </div>
        </li>
    `,
        )
        .join("");
}

// ── WHAT MEAL LACKS + IN EXCESS ──
function renderLacksAndExcess(lacks, excess) {
    document.getElementById("lacks-list").innerHTML = lacks
        .map(
            (item) => `
        <li>${item}</li>
    `,
        )
        .join("");

    document.getElementById("excess-list").innerHTML = excess
        .map(
            (item) => `
        <li>${item}</li>
    `,
        )
        .join("");
}

// ── IMPROVEMENTS ──
function renderImprovements(improvements) {
    document.getElementById("improvements-list").innerHTML = improvements
        .map(
            (item) => `
        <li>${item}</li>
    `,
        )
        .join("");
}

// ── ACTIVITIES ──
function renderActivities(activities) {
    document.getElementById("activities-grid").innerHTML = activities
        .map(
            (activity) => `
        <div class="activity-item">
            <span class="activity-emoji">${activity.emoji}</span>
            <div class="activity-details">
                <strong>${activity.name}</strong>
                <span>${activity.duration} · ${activity.detail}</span>
            </div>
        </div>
    `,
        )
        .join("");
}
