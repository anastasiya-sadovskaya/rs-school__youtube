import AppManager from './appManager';
import AppSettings from './appSettings';
import ElementFactory from './elementFactory';

export default class VideoNode {
    constructor(width) {
        AppManager.videoNodes.push(this);
        this.margin = 0;
        AppSettings.videoNodeWidth = width;
        this.width = AppSettings.videoNodeWidth;
        this.rendered = false;
    }

    create(responseItem) {
        const date = responseItem.snippet.publishedAt.substring(0, 10);

        this.DOMElement = ElementFactory.create('div', this.getContainerAttributes(), this.getContainerProperties());
        this.play = ElementFactory.create('div', { class: 'playVideo' }, { style: { display: 'none' }, innerHTML: '<i class="fa fa-play" aria-hidden="true"></i>' });
        this.image = ElementFactory.create('div', { class: 'preview' }, { style: { backgroundImage: `url(${responseItem.snippet.thumbnails.high.url})` } });
        this.info = ElementFactory.create('div', { class: 'info' });
        this.title = ElementFactory.create('a', { class: 'title', href: `https://www.youtube.com/watch?v=${responseItem.id}`, target: '_blank' }, { innerHTML: responseItem.snippet.title });
        this.viewCount = ElementFactory.create('div', { class: 'viewCount' }, { innerHTML: responseItem.statistics.viewCount });
        this.author = ElementFactory.create('div', { class: 'author' }, { innerHTML: responseItem.snippet.channelTitle });
        this.date = ElementFactory.create('span', { class: 'date' }, { innerHTML: date });
        this.description = ElementFactory.create('div', { class: 'description' }, { innerHTML: responseItem.snippet.description });
        this.more = ElementFactory.create('a', { class: 'more', href: `https://www.youtube.com/watch?v=${responseItem.id}`, target: '_blank' }, { innerHTML: '...' });

        const node = this.DOMElement;
        node.onmousedown = () => {
            node.style.cursor = '-webkit-grabbing';
        };

        node.onmouseup = () => {
            node.style.cursor = 'pointer';
        };
    }

    render() {
        this.setMargin();
        ElementFactory.render(this.DOMElement, AppManager.resultsList.DOMElement);
        ElementFactory.render(this.image, this.DOMElement);
        ElementFactory.render(this.info, this.DOMElement);
        ElementFactory.render(this.title, this.info);
        ElementFactory.render(this.play, this.DOMElement);
        ElementFactory.render(this.viewCount, this.info);
        ElementFactory.render(this.author, this.info);
        ElementFactory.render(this.date, this.info);
        ElementFactory.render(this.description, this.info);
        ElementFactory.render(this.more, this.description);

        this.rendered = true;
    }

    setMargin(margin) {
        this.margin = margin;
        this.DOMElement.style.marginLeft = `${this.margin}px`;
        this.DOMElement.style.marginRight = `${this.margin}px`;
    }

    getContainerAttributes() {
        this.class = { class: 'videoNode' };
        return this.class;
    }

    getContainerProperties() {
        return { style: { margin: '0', width: `${this.width}px` } };
    }
}

