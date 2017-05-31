import AppManager from './appManager';
import ElementFactory from './elementFactory';

export default class Button {
    constructor() {
        AppManager.pageControllers.push(this);
        this.className = 'pageController';
    }

    create() {
        this.DOMElement = ElementFactory.create('button', { class: this.className });
        AppManager.resultsList.controllers.appendChild(this.DOMElement);
    }

    setActive(value) {
        this.DOMElement.className = this.className + (value ? ' active' : '');
    }
}
