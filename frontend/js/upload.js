// ── STATE ──
let currentAnalysis = null;

// ── DOM REFERENCES ──
const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("file-input");
const imagePreview = document.getElementById("image-preview");
const uploadText = document.getElementById("upload-text");
const analyzeBtn = document.getElementById("analyze-btn");
const loadingState = document.getElementById("loading-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const confirmBtn = document.getElementById("confirm-btn");

// ── FILE SELECTED ──
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
        uploadText.style.display = "none";
        document.querySelector(".upload-icon").style.display = "none";
    };
    reader.readAsDataURL(file);

    analyzeBtn.style.display = "block";
    errorState.style.display = "none";
});
// ── ANALYZE BUTTON ──
analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Show spinner, hide the analyze button
    analyzeBtn.style.display = "none";
    loadingState.style.display = "flex";
    errorState.style.display = "none";

    try {
        // Build the form data — this is how we send a file over HTTP
        const formData = new FormData();
        formData.append("file", file);

        // Send to our FastAPI backend
        const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData,
            // Note: do NOT set Content-Type header manually when sending
            // FormData — the browser sets it automatically with the correct
            // boundary value. Setting it manually breaks the request.
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Analysis failed");
        }

        const analysis = await response.json();

        // Store it so confirm button can access it
        currentAnalysis = analysis;

        // Pass to results.js to render on screen
        renderResults(analysis);

        // Show results section, hide loading
        document.getElementById("results-section").style.display = "block";
        loadingState.style.display = "none";

        // Scroll down to results smoothly
        document.getElementById("results-section").scrollIntoView({
            behavior: "smooth",
        });
    } catch (error) {
        // Something went wrong — show error, hide spinner
        loadingState.style.display = "none";
        errorState.style.display = "block";
        errorMessage.textContent =
            error.message || "Something went wrong. Please try again.";
        analyzeBtn.style.display = "block";
    }
});

// ── CONFIRM BUTTON ──
// User has seen the analysis and taps "Yes, Log This Meal"
confirmBtn.addEventListener("click", async () => {
    if (!currentAnalysis) return;

    // Disable button so user can't double-tap
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Saving...";

    try {
        const response = await fetch("/api/meals/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dishName: currentAnalysis.dishName,
                nutrition: currentAnalysis.nutrition,
                qualityScore: currentAnalysis.qualityScore,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to save meal");
        }

        // Meal saved — refresh the dashboard to show it
        loadDashboard();

        // Reset the upload section for next meal
        resetUpload();

        // Scroll back to top so user sees the updated dashboard
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "✓ Yes, Log This Meal";
        alert("Failed to save meal. Please try again.");
    }
});

// ── RESET ──
// Clears everything back to the initial upload state
function resetUpload() {
    // Reset file input
    fileInput.value = "";

    // Reset upload zone visuals
    imagePreview.style.display = "none";
    imagePreview.src = "";
    uploadText.style.display = "block";
    document.querySelector(".upload-icon").style.display = "block";

    // Reset buttons and states
    analyzeBtn.style.display = "none";
    loadingState.style.display = "none";
    errorState.style.display = "none";

    // Hide results
    document.getElementById("results-section").style.display = "none";

    // Reset confirm button
    confirmBtn.disabled = false;
    confirmBtn.textContent = "✓ Yes, Log This Meal";

    // Clear stored analysis
    currentAnalysis = null;
}

// ── HEADER DATE ──
// Show today's date in the header
document.getElementById("header-date").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
