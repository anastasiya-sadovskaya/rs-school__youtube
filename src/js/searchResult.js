import AppManager from './appManager';
import AppSettings from './appSettings';
import ElementFactory from './elementFactory';
import YouTubeApiClient from './youTubeApiClient';
import VideoNode from './videoNode';
import Button from './button';

export default class SearchResult {
    constructor() {
        AppManager.resultsList = this;
        AppManager.resultsList.pageFunctions = {
            1: page => page - 1,
            2: page => page,
            3: page => page + 1,
        };

        AppManager.resultsList.videoNodes = [];
        AppManager.resultsList.page = 1;
        AppManager.resultsList.videosOnPageNumber = null;
        AppManager.resultsList.prevVideosOnPageNumber = null;
        AppManager.resultsList.swipeLength = 100;
        AppManager.resultsList.lastPage = null;
        AppManager.resultsList.noResults = false;
    }

    create() {
        this.DOMElement = ElementFactory.create('div', { class: 'resultList' });
        if (AppSettings.responsItemsCount !== 0) {
            if (AppSettings.screenWidth < 400) {
                AppManager.resultsList.createNodes(AppSettings.screenWidth);
            } else {
                AppManager.resultsList.createNodes(400);
            }
            for (let i = 0; i < AppSettings.responsItemsCount; i += 1) {
                AppManager.resultsList.videoNodes[i].render();
            }
            AppManager.resultsList.buttons = [];

            const countOfVideos = AppManager.resultsList.videosOnPage();
            const margin = ((AppSettings.screenWidth - (AppSettings.videoNodeWidth * countOfVideos)) / (countOfVideos * 2));
            this.setMargin(margin);

            const width = (AppManager.resultsList.videoNodes.length * AppSettings.videoNodeWidth) + (AppManager.resultsList.videoNodes.length * margin * 2);
            this.setWidth(width);

            document.body.appendChild(AppManager.resultsList.DOMElement);
            AppManager.resultsList.controllers = ElementFactory.create('div', { class: 'controllers' });
            document.body.appendChild(AppManager.resultsList.controllers);

            for (let i = 0; i < 5; i += 1) {
                AppManager.resultsList.buttons.push(new Button());
                AppManager.resultsList.buttons[i].create();
                if (i > 0 && i < 4) {
                    AppManager.resultsList.buttons[i].DOMElement.innerHTML = i;
                    AppManager.resultsList.buttons[i].DOMElement.onclick = () => AppManager.resultsList.changePage(AppManager.resultsList.buttons[i], undefined);
                }
            }
            if (AppSettings.screenWidth > 767) {
                AppManager.resultsList.buttons.map((el, index) => {
                    AppManager.resultsList.buttons[index].DOMElement.className = 'pageController';
                    return el;
                });
            }

            AppManager.resultsList.buttons[0].DOMElement.innerHTML = 'Prev';
            AppManager.resultsList.buttons[0].DOMElement.id = 'prev';
            AppManager.resultsList.buttons[0].DOMElement.onclick = AppManager.resultsList.prevPage;
            AppManager.resultsList.buttons[4].DOMElement.innerHTML = 'Next';
            AppManager.resultsList.buttons[4].DOMElement.id = 'next';
            AppManager.resultsList.buttons[4].DOMElement.onclick = AppManager.resultsList.nextPage;

            const firstLoadPagesCount = Math.ceil(AppSettings.responsItemsCount / AppManager.resultsList.videosOnPage());
            if (firstLoadPagesCount < 4) {
                for (let i = 1; i <= firstLoadPagesCount; i += 1) {
                    AppManager.resultsList.buttons[i].DOMElement.className = 'pageController';
                }
            } else {
                for (let i = 1; i < 4; i += 1) {
                    AppManager.resultsList.buttons[i].DOMElement.className = 'pageController';
                }
            }

            // for (let i = 0; i < 5; i += 1) {
            //      AppManager.resultsList.buttons.push(new Button);
            // }

            // var firstLoadPagesCount = Math.ceil(AppSettings.responsItemsCount / AppManager.resultsList.videosOnPage());
            // if(firstLoadPagesCount < 4){
            //     for(var i = 1; i <= firstLoadPagesCount; i += 1 ){
            //         AppManager.resultsList.buttons[i].create();
            //         AppManager.resultsList.buttons[i].DOMElement.innerHTML = i;
            //         AppManager.resultsList.buttons[i].DOMElement.onclick = () => AppManager.resultsList.changePage(AppManager.resultsList.buttons[i], undefined);
            //     }
            // }


            AppManager.resultsList.calcLastPage();
            AppManager.resultsList.setPage(1);
        } else {
            AppManager.resultsList.setWidth(AppSettings.screenWidth);
            document.body.appendChild(AppManager.resultsList.DOMElement);
            AppManager.resultsList.page = 1;
            AppManager.resultsList.DOMElement.innerHTML = '<span class = "nullRes">Sorry, nothing was found :(</span>';
            AppManager.resultsList.DOMElement.style.cursor = 'default';
            AppManager.resultsList.noResults = true;
        }


        const list = AppManager.resultsList.DOMElement;
        if (!AppManager.resultsList.noResults) {
            list.onmousedown = (e) => {
                function getCoords(elem) {
                    const box = elem.getBoundingClientRect();

                    return {
                        left: box.left + pageXOffset,
                    };
                }

                const coords = getCoords(list);
                const shiftX = e.pageX - coords.left;
                AppManager.resultsList.screenX = event.screenX;
                AppManager.resultsList.DOMElement.style.cursor = '-webkit-grabbing';

                function moveAt(ev) {
                    list.style.transition = 'none';
                    list.style.transform = `translate(${ev.pageX - shiftX}px)`;
                    AppManager.resultsList.deltaTranslate = ev.pageX - shiftX;
                }

                list.style.position = 'relative';
                moveAt(e);

                document.onmousemove = (ev) => {
                    moveAt(ev);
                };

                list.onmouseup = () => {
                    list.style.transition = 'transform 1s';
                    document.onmousemove = null;
                    document.onmouseup = null;
                    list.onmouseup = null;
                    list.onmousemove = null;
                    AppManager.resultsList.DOMElement.style.cursor = '-webkit-grab';
                    const delta = AppManager.resultsList.screenX - event.screenX;
                    if (delta < 0) {
                        if (delta < -AppManager.resultsList.swipeLength) {
                            if (AppManager.resultsList.page > 1) {
                                AppManager.resultsList.prevPage();
                            } else {
                                list.style.transform = `translate(${AppManager.resultsList.currentTranslate}px)`;
                            }
                        } else {
                            list.style.transform = `translate(${AppManager.resultsList.currentTranslate}px)`;
                        }
                    }

                    if (delta > 0) {
                        if (delta > AppManager.resultsList.swipeLength) {
                            if (AppManager.resultsList.page !== AppManager.resultsList.lastPage) {
                                AppManager.resultsList.nextPage();
                            } else {
                                list.style.transform = `translate(${AppManager.resultsList.currentTranslate}px)`;
                                for (let i = 0; i < 5; i += 1) {
                                    if (AppManager.pageControllers[i].DOMElement.innerHTML === AppManager.resultsList.page) {
                                        for (let j = 4; j > i; j -= 1) {
                                            AppManager.pageControllers[j].DOMElement.className = 'pageController disable';
                                            AppManager.pageControllers[j].DOMElement.onclick = 'none';
                                        }
                                    }
                                }
                            }
                        } else {
                            list.style.transform = `translate(${AppManager.resultsList.currentTranslate}px)`;
                            for (let i = 0; i < 5; i += 1) {
                                if (AppManager.pageControllers[i].DOMElement.innerHTML === AppManager.resultsList.page) {
                                    for (let j = 4; j > i; j -= 1) {
                                        AppManager.pageControllers[j].DOMElement.className = 'pageController disable';
                                        AppManager.pageControllers[j].DOMElement.onclick = 'none';
                                    }
                                }
                            }
                        }
                    }
                };
                return false;
            };

            list.ondragstart = () => false;

            list.addEventListener('touchstart', (e) => {
                list.startSwipe = e.touches[0].clientX;
            });

            list.addEventListener('touchend', (e) => {
                const delta = list.startSwipe - e.changedTouches[0].clientX;
                if (Math.abs(delta) >= 50 && delta < 0) {
                    AppManager.resultsList.prevPage();
                }
                if (Math.abs(delta) >= 50 && delta > 0) {
                    AppManager.resultsList.nextPage();
                }
            });
        }

        AppManager.disableScreen.style.display = 'none';
        AppManager.spiner.style.display = 'none';
    }


    createNodes(width) {
        for (let i = 0; i < AppSettings.responsItemsCount; i += 1) {
            const videoNode = new VideoNode(width);
            AppManager.resultsList.videoNodes.push(videoNode);
            videoNode.create(AppManager.currentVideos[i]);
        }
    }

    getDOMElement() {
        return this.DOMElement;
    }

    setWidth(width) {
        this.width = width;
        if (Math.ceil(this.width / AppSettings.screenWidth) === (this.width / AppSettings.screenWidth)) {
            this.DOMElement.style.width = `${this.width}px`;
        } else {
            this.width = Math.ceil(this.width / AppSettings.screenWidth) * AppSettings.screenWidth;
            this.DOMElement.style.width = `${this.width}px`;
        }
    }

    setMargin(margin) {
        if (AppManager.resultsList.videoNodes.length) {
            for (let i = 0; i < AppManager.resultsList.videoNodes.length; i += 1) {
                AppManager.resultsList.videoNodes[i].setMargin(margin);
            }
        }
    }

    videosOnPage() {
        if (this.videosOnPageNumber == null) {
            if (AppManager.videoNodes.length !== 0) {
                this.videosOnPageNumber = Math.floor(AppSettings.screenWidth / AppManager.videoNodes[0].width);
            } else {
                this.videosOnPageNumber = 0;
            }
            this.prevVideosOnPageNumber = this.videosOnPageNumber;
        } else {
            this.prevVideosOnPageNumber = this.videosOnPageNumber;
            this.videosOnPageNumber = Math.floor(AppSettings.screenWidth / AppManager.videoNodes[0].width);
        }
        return this.videosOnPageNumber;
    }

    setPage(pageNum) {
        AppManager.resultsList.page = pageNum;
        AppManager.resultsList.DOMElement.style.left = '0px';
        AppManager.resultsList.DOMElement.style.transform = `translateX(-${(pageNum - 1) * AppSettings.screenWidth}px)`;
        AppManager.resultsList.currentTranslate = -((pageNum - 1) * AppSettings.screenWidth);
        AppManager.resultsList.calcLoadPage();
        AppManager.resultsList.onPageSet();

        if (AppSettings.responsItemsCount) {
            if (AppManager.resultsList.page !== AppManager.resultsList.pageForLoad && (AppManager.resultsList.page + 1) !== AppManager.resultsList.lastPage) {
                if (AppManager.resultsList.page <= 1) {
                    AppManager.resultsList.buttons[0].DOMElement.className = 'pageController disable';
                    AppManager.resultsList.buttons[0].DOMElement.onclick = 'none';
                    for (let i = 1; i < 4; i += 1) {
                        AppManager.resultsList.buttons[i].DOMElement.innerHTML = i;
                    }
                } else {
                    AppManager.resultsList.buttons[0].DOMElement.className = 'pageController';
                    AppManager.resultsList.buttons[0].DOMElement.onclick = AppManager.resultsList.prevPage;
                    Object.keys(AppManager.resultsList.pageFunctions).forEach((key) => {
                        AppManager.resultsList.buttons[key].DOMElement.innerHTML = AppManager.resultsList.pageFunctions[key](AppManager.resultsList.page);
                    });
                }

                AppManager.resultsList.buttons[4].DOMElement.className = 'pageController';
                AppManager.resultsList.buttons[4].DOMElement.onclick = AppManager.resultsList.nextPage;
            }
        }

        for (let i = 1; i < 4; i += 1) {
            if (this.buttons[i].DOMElement) {
                const buttonController = this.buttons[i];
                buttonController.setActive(buttonController.DOMElement.innerHTML === String(pageNum));
            }
        }

        // if (AppManager.resultsList.isLastPage()) {
        //     if (AppSettings.screenWidth > 767) {
        //         AppManager.resultsList.buttons[4].DOMElement.className = 'pageController disable';
        //     }
        //     AppManager.resultsList.buttons[4].DOMElement.onclick = 'none';
        // } else {
        //     AppManager.resultsList.buttons[4].DOMElement.className = 'pageController';
        //     AppManager.resultsList.buttons[4].DOMElement.onclick = AppManager.resultsList.nextPage;
        // }
    }

    onPageSet() {
        // if (AppManager.resultsList.pageForLoad != AppManager.resultsList.lastPage) {
        if (AppManager.resultsList.page === AppManager.resultsList.pageForLoad) {
            YouTubeApiClient.search((response) => {
                AppManager.currentVideos = response.items;
                AppManager.resultsList.calcLastPage();
                if (AppManager.resultsList.page !== AppManager.resultsList.lastPage) {
                    if (AppSettings.screenWidth < 400) {
                        AppManager.resultsList.createNodes(AppSettings.screenWidth);
                    } else {
                        AppManager.resultsList.createNodes(400);
                    }
                    AppManager.resultsList.calcLastPage();
                    AppManager.disableScreen.style.display = 'none';
                    AppManager.spiner.style.display = 'none';
                    const countOfVideos = AppManager.resultsList.videosOnPage();
                    const margin = ((AppSettings.screenWidth - (AppSettings.videoNodeWidth * countOfVideos)) / (countOfVideos * 2));
                    AppManager.resultsList.setMargin(margin);

                    const width = (AppManager.resultsList.videoNodes.length * AppSettings.videoNodeWidth) + (AppManager.resultsList.videoNodes.length * margin * 2);
                    AppManager.resultsList.setWidth(width);

                    AppManager.resultsList.videoNodes.filter(vn => vn.rendered === false).map(vn => vn.render());
                    // if (AppManager.resultsList.isLastPage()) {
                    //     if (AppSettings.screenWidth > 767) {
                    //         AppManager.resultsList.buttons[4].DOMElement.className = 'pageController disable';
                    //     }
                    //     AppManager.resultsList.buttons[4].DOMElement.onclick = 'none';
                    // } else {

                    AppManager.resultsList.buttons[4].DOMElement.className = 'pageController';
                    AppManager.resultsList.buttons[4].DOMElement.onclick = AppManager.resultsList.nextPage;
                    // }
                }
            });


            // AppManager.resultsList.calcLastPage();


            // }
        } else {
            AppManager.resultsList.buttons[4].DOMElement.className = 'pageController disable';
            AppManager.resultsList.buttons[4].DOMElement.onclick = 'none';
        }
    }

    calcLoadPage() {
        const tempPageForLoad = AppManager.videoNodes.length / AppManager.resultsList.videosOnPage();
        if (Number.isInteger(tempPageForLoad)) {
            AppManager.resultsList.pageForLoad = tempPageForLoad - 1;
        } else {
            AppManager.resultsList.pageForLoad = Math.floor(tempPageForLoad);
        }
    }

    nextPage() {
        AppManager.resultsList.setPage(AppManager.resultsList.page + 1);
    }

    prevPage() {
        AppManager.resultsList.setPage(AppManager.resultsList.page - 1);
    }

    changePage(button, pageNum) {
        AppManager.resultsList.setPage(pageNum === undefined ? parseInt(button.DOMElement.innerHTML, 10) : pageNum);
    }

    calcLastPage() {
        const lastVideos = AppSettings.responsItemsCount / AppManager.resultsList.videosOnPage();
        if (AppSettings.responsItemsCount < 15) {
            if (Math.ceil(lastVideos) === lastVideos) {
                AppManager.resultsList.lastPage = AppManager.videoNodes.length / AppManager.resultsList.videosOnPage();
            } else {
                AppManager.resultsList.lastPage = Math.ceil(AppManager.videoNodes.length / AppManager.resultsList.videosOnPage());
            }
        } else {
            AppManager.resultsList.lastPage = Math.ceil(AppManager.videoNodes.length / AppManager.resultsList.videosOnPage());
        }
        return AppManager.resultsList.lastPage;
    }

    isLastPage() {
        if (AppManager.resultsList.page === AppManager.resultsList.lastPage) {
            return true;
        }
        return false;
    }

    remove() {
        if (AppManager.resultsList.noResults) {
            AppManager.resultsList.DOMElement.parentNode.removeChild(AppManager.resultsList.DOMElement);
        } else {
            document.body.removeChild(AppManager.resultsList.controllers);
            AppManager.videoNodes = [];
            AppSettings.nextPageToken = null;
            AppManager.currentVideos = [];
            AppManager.resultsList.DOMElement.parentNode.removeChild(AppManager.resultsList.DOMElement);
            AppManager.resultsList = null;
            AppSettings.responsItemsCount = 0;
        }
    }
}

