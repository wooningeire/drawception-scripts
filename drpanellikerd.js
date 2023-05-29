(async function (endPage, offset=0, timeout=1000) {
    // Init
    let w;
    const f = document.createElement("iframe");
    const baseURL = `${location.href.substring(0, nthIndexOf(location.href, "/", 5) + 1)}games/`;
    let targetURL;
    let gameIDs = [];

    const lastPageNumber = parseInt(document.querySelector("ul.pagination > li:nth-last-child(2) > a, ul.pagination > li:nth-last-child(2) > span").textContent);
    let i = lastPageNumber - offset + 1;
    const iMin = endPage || 1;
    let j = -1;
    let jMax;

    f.style.width = "90vw";
    f.style.height = "90vh";

    f.addEventListener("load", fInitOnload, { once: true });
    function fInitOnload() {
        console.log("Initiation.");
        w = f.contentWindow;
        onsrcchange(f, () => {
            awaitIFrameReady();
        });
        nextPage();
    }

    document.body.appendChild(f);
    f.src = baseURL;

    // Collecting links
    function nextPage() {
        i--;

        if (i < iMin) {
            console.log("Done!");
            return;
        }
        console.log(`PAGE ${i}`);

        setTimeout(() => {
            setSrc(`${baseURL}${i}/`);
        }, timeout);
    }

    function fCollectOnload() {
        //if (w.location.href !== targetURL || w.document.readyState === "loading") return;
        if (substringIndex(w.location.href, "/", 2) !== "player") return;

        gameIDs = [];

        const links = w.document.querySelectorAll(".thumbpanel");
        for (let link of links) if (link) gameIDs.push(substringIndex(link.href, "/", 3));

        j = -1;
        jMax = gameIDs.length - 1;

        likeNext();
    }

    // Smashing that like button!!!!!!!!!!!
    function likeNext() {
        j++; console.log(j);

        if (j > jMax) {
            console.clear();
            console.log("Collecting next page");
            nextPage();
            return;
        }
        console.log(`${j} / ${jMax}`);

        setTimeout(() => {
            setSrc(`https://drawception.com/game/${gameIDs[j]}/a/`);
        }, timeout);
    }

    function fLikeOnload() {
        if (substringIndex(w.location.href, "/", 2) !== "game") return;

        const button = w.document.querySelector(".likebutton.btn-default");
        if (button) button.click();

        likeNext();
    }

    // General use functions //
    function awaitIFrameReady(callback=fOnready) {
        const d = w.document;

        if (d.readyState !== "loading") {
            callback(d);
        } else {
            d.addEventListener("DOMContentLoaded", callback, { once: true });
        }
    }

    function fOnready() {
        fCollectOnload();
        fLikeOnload();
    }

    function nthIndexOf(str, substr, n) {
        var i = 0;
        var index = null;

        while (i++ < n + 1 && index !== -1) index = str.indexOf(substr, index + 1);

        return index;
    }

    function substringIndex(str, substr, n) {
        return str.substring(nthIndexOf(str, substr, n) + 1, nthIndexOf(str, substr, n + 1))
    }

    function setSrc(src) {
        targetURL = src;
        w.location.replace(src);
    }

    function onsrcchange(iframe, callback) {
        const fUnload = function () {
            setTimeout(() => {
                callback(iframe.contentWindow.location.href);
            }, 0);
        };

        function attachUnload() {
            iframe.contentWindow.removeEventListener("unload", fUnload, false);
            iframe.contentWindow.addEventListener("unload", fUnload, false);
        }

        iframe.addEventListener("load", attachUnload, false);
        attachUnload();
    }
})();