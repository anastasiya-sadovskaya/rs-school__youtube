import AppManager from './appManager';
import AppSettings from './appSettings';

export default (function YouTubeApiClient() {
    let url = '';
    const getVideoInfo = (ids, successCallback) => {
        new Promise((resolve, reject) => {
            const XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
            const xhr = new XHR();
            url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=AIzaSyCCXDIVUSpoxFGLOAK3jx9iANFtCHb5PG0&id=';
            for (let i = 0; i < ids.length; i += 1) {
                url += `${ids[i]},`;
            }

            xhr.open('GET', url, true);
            xhr.send();
            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    const error = new Error(xhr.statusText);
                    error.code = xhr.status;
                    reject(error);
                }
            };
        })

            .then((response) => {
                AppManager.currentVideos = response.items;
                AppSettings.responsItemsCount = response.items.length;
                successCallback(response);
            });
    };

    return {
        search(successCallback) {
            return new Promise((resolve, reject) => {
                AppManager.disableScreen.style.display = 'block';
                AppManager.spiner.style.display = 'block';
                const XHR = ('onload' in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
                const q = AppManager.searchInput.value;
                const xhr = new XHR();
                url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&alt=json&key=AIzaSyCCXDIVUSpoxFGLOAK3jx9iANFtCHb5PG0&q=${q}`;
                if (AppSettings.nextPageToken) {
                    url += `&pageToken=${AppSettings.nextPageToken}`;
                }
                xhr.open('GET', url, true);
                xhr.send();
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        const error = new Error(xhr.statusText);
                        error.code = xhr.status;
                        reject(error);
                    }
                };
            })
                .then((response) => {
                    AppSettings.nextPageToken = response.nextPageToken;
                    const ids = [];
                    for (let i = 0; i < response.items.length; i += 1) {
                        ids.push(response.items[i].id.videoId);
                    }

                    getVideoInfo(ids, successCallback);
                });
        },
    };
}());
