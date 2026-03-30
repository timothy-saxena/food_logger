// ── CONSTANTS ──
const DAILY_CALORIE_GOAL = 2000;

// ── LOAD DASHBOARD ──
// Fetches today's meals from the backend and renders them
// Called on page load and after every meal is confirmed
async function loadDashboard() {
    try {
        const response = await fetch("/api/meals/today");
        if (!response.ok) throw new Error("Failed to fetch meals");

        const data = await response.json();
        renderMealsList(data.meals);
        renderProgressBar(data.meals);
    } catch (error) {
        console.error("Dashboard error:", error);
    }
}

// ── RENDER MEALS LIST ──
function renderMealsList(meals) {
    const mealsList = document.getElementById("meals-list");

    if (meals.length === 0) {
        mealsList.innerHTML = `
            <p class="subtle" id="empty-log-msg">
                No meals logged yet today.
            </p>
        `;
        return;
    }

    mealsList.innerHTML = meals
        .map(
            (meal) => `
        <div class="meal-entry">
            <div class="meal-entry-left">
                <div class="meal-entry-name">${meal.dish_name}</div>
                <div class="meal-entry-time">${formatTime(meal.logged_at)}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div class="meal-entry-cal">${Math.round(meal.calories)} kcal</div>
                <button 
                    class="meal-delete-btn" 
                    onclick="deleteMeal(${meal.id})"
                    title="Remove this meal"
                >×</button>
            </div>
        </div>
    `,
        )
        .join("");
}

// ── RENDER PROGRESS BAR ──
function renderProgressBar(meals) {
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const percentage = Math.min(
        (totalCalories / DAILY_CALORIE_GOAL) * 100,
        100,
    );

    // Update the label
    document.getElementById("total-calories-label").textContent =
        `${Math.round(totalCalories)} kcal eaten`;

    // Update the progress bar width
    const fill = document.getElementById("progress-fill");
    fill.style.width = percentage + "%";

    // Turn red if over the daily goal
    if (totalCalories > DAILY_CALORIE_GOAL) {
        fill.classList.add("over");
    } else {
        fill.classList.remove("over");
    }
}

// ── DELETE MEAL ──
async function deleteMeal(mealId) {
    if (!confirm("Remove this meal from today's log?")) return;

    try {
        const response = await fetch(`/api/meals/${mealId}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete meal");

        // Refresh dashboard after deletion
        loadDashboard();
    } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to remove meal. Please try again.");
    }
}

// ── FORMAT TIME ──
// Converts "2026-03-29T15:57:08.097546" to "3:57 PM"
function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── ON PAGE LOAD ──
// Load the dashboard immediately when the page opens
loadDashboard();
