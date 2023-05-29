(async function (startPage=1, endPage, timeout=0) {
    // Init
    let w;
    const f = document.createElement("iframe");
    const baseURL = `${location.href.substring(0, nthIndexOf(location.href, "/", 5) + 1)}games/`;
    let targetURL;
    let gameIDs = [];

    let i = startPage - 1;
    let iMax = endPage || getNumberOfPages();

    const pageCounter = document.createElement("div");
    pageCounter.style.fontSize = "48px";

    //f.style.width = "90vw";
    //f.style.height = "90vh";
    f.style.display = "none";

    f.addEventListener("load", fInitOnload, { once: true });
    function fInitOnload() {
        pageCounter.textContent = "Initiation...";
        w = f.contentWindow;
        f.addEventListener("load", fCollectOnload, false);
        nextPage();
    }

    document.body.appendChild(f);
    f.src = baseURL;

    document.body.appendChild(pageCounter);

    // Collecting links
    function nextPage() {
        i++;

        if (i > iMax) {
            f.removeEventListener("load", fCollectOnload, false);
            f.addEventListener("load", fLikeOnload, false);
            console.log(gameIDs);
            likeNext();
            return;
        }
        pageCounter.textContent = `Collecting page ${i}`;

        setSrc(`${baseURL}${i}/`);
    }

    function fCollectOnload() {
        const links = w.document.querySelectorAll(".thumbpanel");
        for (let link of links) if (link) gameIDs.push(substringIndex(link.href, "/", 3));

        nextPage();
    }

    // Smashing that like button!!!!!!!!!!!
    function likeNext() {
        const id = gameIDs.pop();

        if (!id) {
            pageCounter.textContent = `Done! (Started on page ${startPage} and ended on page ${iMax})`;
            return;
        }
        pageCounter.textContent = `${gameIDs.length} games left`;

        if (!endPage) {
            iMax = getNumberOfPages(w);
        }

        setTimeout(() => {
            setSrc(`https://drawception.com/game/${id}/a/`);
        }, timeout);
    }

    function fLikeOnload() {
        const button = w.document.querySelector(".likebutton.btn-default");
        if (button) button.click();

        likeNext();
    }

    // General use functions //

    function nthIndexOf(str, substr, n) {
        let i = 0;
        let index = null;

        while (i++ < n + 1 && index !== -1) index = str.indexOf(substr, index + 1);

        return index;
    }

    function substringIndex(str, substr, n) {
        return str.substring(nthIndexOf(str, substr, n) + 1, nthIndexOf(str, substr, n + 1))
    }

    function getNumberOfPages(w=window) {
        const button = w.document.querySelector("ul.pagination > li:nth-last-child(2) > a, ul.pagination > li:nth-last-child(2) > span");
        return button ? parseInt(button.textContent) : 1;
    }

    function setSrc(src) {
        targetURL = src;
        w.location.replace(src);
    }
})();