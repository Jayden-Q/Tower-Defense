class HealthManager {
    constructor(healthAmount) {
        this._health = healthAmount ?? 5;
        this._health_dom_element = document.querySelector(".health-count");

        this.SetHealth(5);
    }

    get Health() {
        return this._health;
    }

    SetHealth(amount) {
        this._health = amount ?? 10;
        this.UpdateDOMElement();
    }

    Increase(amount) {
        this._health += amount ?? 1;
        this.UpdateDOMElement();
    }

    Decrease(amount) {
        this._health -= amount ?? 1;
        this.UpdateDOMElement();
    }

    UpdateDOMElement() {
        this._health_dom_element.innerText = this._health;
    }
}

export default HealthManager;