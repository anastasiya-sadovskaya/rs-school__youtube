import ElementFactory from './elementFactory';
import onSearchSuccessCallback from './app';

export default (function AppManager() {
    return {
        searchInput: ElementFactory.create('input', { type: 'text', class: 'input', id: 'query', autofocus: '', placeholder: 'Enter request...' }),
        searchButton: ElementFactory.create('button', { class: 'search', id: 'search' }, { innerHTML: 'Search', onclick: onSearchSuccessCallback }),
        disableScreen: ElementFactory.create('div', { class: 'disableScreen' }),
        spiner: ElementFactory.create('img', { class: 'spiner', src: 'img/spiner2.gif' }),
        currentVideos: [],
        resultsList: null,
        videoNodes: [],
        pageControllers: [],
    };
}());
