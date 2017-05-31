
import AppManager from './appManager';
import AppSettings from './appSettings';
import YouTubeApiClient from './youTubeApiClient';
import SearchResult from './searchResult';


document.body.appendChild(AppManager.disableScreen);
AppManager.disableScreen.style.display = 'none';
document.body.appendChild(AppManager.spiner);
AppManager.spiner.style.display = 'none';
AppManager.videoNodes = [];
AppManager.pageControllers = [];

document.body.onresize = () => {
    AppSettings.screenWidth = document.body.offsetWidth;
    if (AppSettings.screenWidth < 400) {
        AppSettings.videoNodeWidth = AppSettings.screenWidth;
        document.body.className = 'phone';
        AppManager.searchInput.className = 'phone';
        AppManager.searchButton.className += ' phone';
    } else {
        AppSettings.videoNodeWidth = AppSettings.videoNodeWidthExceptPhones;
        document.body.className = '';
        AppManager.searchInput.className = '';
        AppManager.searchButton.className = 'search';
    }
    AppManager.videoNodes.map((el, index) => {
        AppManager.videoNodes[index].DOMElement.style.width = `${AppSettings.videoNodeWidth}px`;
        return el;
    });
    if (AppManager.resultsList) {
        let videosOnPage;
        if (AppSettings.screenWidth < 400) {
            videosOnPage = 1;
        } else {
            videosOnPage = AppManager.resultsList.videosOnPage();
        }
        const margin = ((AppSettings.screenWidth - (AppSettings.videoNodeWidth * videosOnPage)) / (videosOnPage * 2));
        const page = Math.ceil((((AppManager.resultsList.page - 1) * AppManager.resultsList.prevVideosOnPageNumber) + 1) / videosOnPage);
        const width = (AppManager.resultsList.videoNodes.length * AppSettings.videoNodeWidth) + (AppManager.resultsList.videoNodes.length * margin * 2);
        AppManager.resultsList.setWidth(width);
        AppManager.resultsList.setMargin(margin);
        AppManager.resultsList.setPage(page);
    }
};


document.body.appendChild(AppManager.searchInput);
document.body.appendChild(AppManager.searchButton);

document.onkeypress = (event) => {
    if (event.keyCode === 13) {
        AppManager.searchButton.click();
    }
};

function renderPreviews() {
    const list = new SearchResult();
    list.create();
}

export default function onSearchSuccessCallback() {
    if (AppManager.resultsList) {
        AppManager.resultsList.remove();
    }

    YouTubeApiClient.search(() => {
        document.body.style.display = 'block';
        renderPreviews();
        if (AppSettings.screenWidth < 400) {
            document.body.className = 'phone';
            AppManager.searchInput.className = 'phone';
            AppManager.searchButton.className += ' phone';
        }
    });
}
