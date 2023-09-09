class MessageManager {
    constructor() {
        this._dom_element = document.querySelector(".game-message");
        this._display_time = 1000;
    }

    Display(message, color) {
        this._dom_element.innerText = message;
        this._dom_element.style.color = color;
        this._dom_element.classList.remove("hidden");

        setTimeout(() => {
            this._dom_element.classList.add("hidden");
        }, this._display_time);
    }
}

export default MessageManager;