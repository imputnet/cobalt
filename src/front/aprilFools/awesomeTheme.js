function changeIcon(button, src) {
    document.getElementById(button).querySelector('.emoji').src = `aprilFools/assets/${src}`;
}

// load an Awesome theme on an Awesome day
let date = new Date();
if (date.getMonth() === 3 && date.getDate() === 1 && localStorage.getItem("disableChangelog") !== "true") {
    let head = document.head;

    head.appendChild(document.createElement('link')).rel = 'stylesheet';
    head.lastChild.href = 'aprilFools/awesomeFonts.css';

    head.appendChild(document.createElement('link')).rel = 'stylesheet';
    head.lastChild.href = 'aprilFools/awesomeStyle.css';

    changeIcon('urgent-notice-child', 'lock.jpg');

    changeIcon('paste', 'paste.jpg');

    changeIcon('audioMode-true', 'music.jpg');
    changeIcon('audioMode-false', 'auto.jpg');

    changeIcon('about-footer', 'dragon.jpg');
    changeIcon('about-donate-footer', 'heart.jpg');
    changeIcon('settings-footer', 'settings.jpg');

    switch(document.documentElement.lang) {
        case "en":
            document.getElementById("logo").innerHTML = "Cobalt Media Downloader Ultra Pro Plus Max 2024";
            break;
        case "ru":
            document.getElementById("logo").innerHTML = "Кобальт Медиа Загрузчик Ультра Про Плюс Макс 2024";
            break;
    }
}