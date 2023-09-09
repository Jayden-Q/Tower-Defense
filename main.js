import Game from "./src/Game.js";

/* DOM Elements */

/* Different Menus to Display */
const menus = document.querySelectorAll(".menu");

const mainMenu = Array.from(menus).find(menu => menu.className.includes("main-menu"));
const levelsMenu = Array.from(menus).find(menu => menu.className.includes("levels-menu"));
const shopMenu = Array.from(menus).find(menu => menu.className.includes("shop-menu"));
const loadingScreen = Array.from(menus).find(menu => menu.className.includes("loading-screen"));
const gameScreen = Array.from(menus).find(menu => menu.className.includes("game-screen"));
const pauseMenu = Array.from(menus).find(menu => menu.className.includes("pause-menu"));

/* Main Menu - Buttons */
const playButton = mainMenu.querySelector("#play-button");
const levelsButton = mainMenu.querySelector("#levels-button");
const shopButton = mainMenu.querySelector("#shop-button");

/* Level List */
const levelsList = levelsMenu.querySelector(".level-list");
const levelsBackButton = levelsMenu.querySelector("#back-button");

/* Game UI - Buttons */
const settingsButton = document.querySelector(".settings-button");
const resumeButton = document.querySelector(".resume-button");
const retryButtons = document.querySelectorAll(".retry-button");
const backToMenuButtons = document.querySelectorAll(".back-to-menu-button");

/* Keep Game Instance In Global Variable So It Can Be Reused */
let GAME = null;

/* Changes DOM Element's Visibility */
const setElementVisibility = (element, visible) => {
    visible ? element.classList.remove("hidden") : element.classList.add("hidden");
}

/* Open Desired Menu And Close The Other Menus */
const open = page => {
    setElementVisibility(page, true);

    menus.forEach(menu => {
        if (menu.className.includes(page.className)) return;
        
        setElementVisibility(menu, false);
    });
}

/* Click Event Listeners For Buttons */
levelsButton.addEventListener("click", () => open(levelsMenu)); /* Open Levels Menu */
levelsBackButton.addEventListener("click", () => open(mainMenu)); /* Open Main Menu */
shopButton.addEventListener("click", () => open(shopMenu)); /* Open Shop Menu */

/* Start Game */
playButton.addEventListener("click", () => {
    open(loadingScreen);

    if (!GAME) {
        GAME = new Game(1, () => open(gameScreen));
        window.GAME = GAME;
        return;
    };

    GAME.SetLevel(1);
    open(gameScreen);
});

/* Toggle Game Paused State */
settingsButton.addEventListener("click", () => {
    const isHidden = pauseMenu.classList.toggle("hidden");

    if (isHidden) {
        GAME.Resume();
        return;
    };

    GAME.Pause();
});

/* Resume Game */
resumeButton.addEventListener("click", () => {
    pauseMenu.classList.add("hidden");
    GAME.Resume();
});

/* Load Selected Level */
levelsList.addEventListener("click", e => {
    if (e.target.className != "level") return;
    open(loadingScreen);

    const levelID = parseInt(e.target.id);

    if (!GAME) {
        GAME = new Game(levelID, () => open(gameScreen));
        window.GAME = GAME;
        return;
    }

    GAME.SetLevel(levelID);
    open(gameScreen);
});

/* Retry Game */
retryButtons.forEach(button => {
    button.addEventListener("click", () => {
        GAME.SetLevel(GAME._level_ID);
        open(gameScreen);
    });
});

/* Back To Menu */
backToMenuButtons.forEach(button => {
    button.addEventListener("click", () => open(mainMenu));
})

/* Pause Game When User Switches Tabs */
document.addEventListener("visibilitychange", e => {
    if (document.visibilityState == "visible") {
        if (!GAME) return;
        pauseMenu.classList.remove("hidden");
        GAME.Pause();
    }
});