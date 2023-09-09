class CurrencyManager {
    constructor(defaultCurrencyAmount) {
        this._default_amount = defaultCurrencyAmount;
        this._currency = defaultCurrencyAmount ?? 20;
        this._currency_dom_element = document.querySelector(".money-count");

        this.SetCurrency(this._currency);
    }

    get Currency() {
        return this._currency;
    }

    SetCurrency(amount) {
        this._currency = amount;
        this.UpdateDOMElement();
    }

    Increase(amount) {
        this._currency += amount ?? 5;
        this.UpdateDOMElement();
    }

    Decrease(amount) {
        this._currency -= amount ?? 5;
        this.UpdateDOMElement();
    }

    UpdateDOMElement() {
        this._currency_dom_element.innerText = `$${this._currency}`;
    }

    Reset() {
        this.SetCurrency(this._default_amount);
    }
}

export default CurrencyManager;