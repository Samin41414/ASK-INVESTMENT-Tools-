document.addEventListener("DOMContentLoaded", function () {
    const splashScreen = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");

    // Splash screen duration (approx 1.8 seconds)
    setTimeout(() => {
        splashScreen.classList.add("fade-out");
        mainContent.classList.add("visible");
    }, 1800);
});