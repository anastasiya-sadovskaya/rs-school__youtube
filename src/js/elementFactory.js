export default (function ElementFactory() {
    let element = null;
    return {
        create(tagName, attrs, props) {
            element = document.createElement(tagName);

            Object.keys(attrs).forEach((attr) => {
                element.setAttribute(attr, attrs[attr]);
            });

            Object.assign(element, props);
            if (props && props.style) {
                Object.assign(element.style, props.style);
            }
            return element;
        },

        render(el, parent) {
            if (!parent) {
                document.body.appendChild(el);
            } else {
                parent.appendChild(el);
            }
            return el;
        },
    };
}());
