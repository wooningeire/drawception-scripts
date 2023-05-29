(function (includeCaptions, barWidth, padding) {
    "use strict";

    if (!startsWith(location.href, /https\:\/\/(www.)?drawception\.com\/player\//)) {
        alert(`You don’t seem to be on a Drawception player page.<br /><br />
Esta página no parece ser una de un usuario de Drawception.`);
        console.warn("URL must lead to Drawception player page");
    };

    var lastPageTab; 

    var pages;

    var baseURL = `${location.href.substring(0, nthIndexOf(location.href, "/", 5) + 1)}${includeCaptions ? "games" : "drawings"}/`;

    var points = [];

    var i = 1;
    var w;
    var f = document.createElement("iframe");
    f.style.display = "none";
    //f.style.width = "80vw";
    //f.style.height = "80vh";

    f.addEventListener("load", fInitOnload, false);
    function fInitOnload() {
        f.removeEventListener("load", fInitOnload, false);
        w = f.contentWindow;
        nextPage();
    }

    document.body.appendChild(f);
    f.src = `${baseURL}${i}/`;

    unapprise();
    apprise(
        `The script is now collecting the data! Do not navigate away from this window.<br />When finished, the graph will be found at the bottom of the page.<br /><br />
¡El script está obteniendo la información! No salga esta página, por favor.<br />Cuando está listo, la gráfica estará en el fondo.`
    );

    function nextPage() { console.log(i);
        if (i === 1) {
            let lastPageTab = w.document.querySelector(".pagination > li:nth-last-child(2) > a");

            if (!lastPageTab) {
                alert(`This player does not have any ${includeCaptions ? "public games" : "drawings"}.<br /><br />
Este usuario no ${includeCaptions ? "ha participado en ningún juego público" : "tiene ningún dibujo"}.`);
                console.warn("player has no drawings");
            }

            pages = parseInt(lastPageTab.textContent);
        }

        var url = `${baseURL}${i}/`

        f.src = url;

        f.addEventListener("load", fOnload, false);
        function fOnload() {
            if (!w.document) {
                unapprise();
                apprise("end of the road. (data collection canceled manually)");
                return;
            }

            if (w.location.href !== url || w.document.readyState === "loading") return;

            collectPageData();
        }

        function collectPageData() {
            var pointsPage = w.document.querySelectorAll(".text-muted.pull-right > small");

            for (let j = 0; j < pointsPage.length; j++) {
                points.push(Number(pointsPage[j].textContent.replace(/[^\d]/g, "")));
            }

            if (i < pages) {
                i++;
                nextPage();
            } else {
                f.remove();
                createGraph(padding, barWidth);
            }
        }
    }

    function createGraph(padding=80, barWidth=Math.floor((Math.max(innerWidth, 800) - padding * 2) / points.length) || 1) {
        points.sort((a, b) => b - a);

        var max = points[0];
        var min = points[points.length - 1];
        var sum = points.reduce((a, b) => a + b);

        var innerWidth = barWidth * points.length;
        var offsetHeight = max + padding;
        var width = innerWidth + padding * 2;
        var height = offsetHeight + padding;

        var s = ce("svg", ["xmlns", "http://www.w3.org/2000/svg"], ["width", innerWidth + padding * 2], ["height", height]);
        s.style.background = "#fff";
        s.style.marginBottom = "60px";


        // title

        var title = ce("text", ["id", "title"], ["x", width / 2], ["y", 64], ["text-anchor", "middle"]);
        title.textContent = document.querySelector(".clear-top").firstChild.textContent.trim();
        s.appendChild(title);

        var bigstats = ce("text", ["id", "bigstats"], ["x", width / 2], ["y", offsetHeight + 60], ["text-anchor", "middle"]);
        bigstats.textContent = `drawings ${points.length} | sum ${sum}`;
        s.appendChild(bigstats);

        var smallstats = ce("text", ["id", "smallstats"], ["x", width / 2], ["y", offsetHeight + 75], ["text-anchor", "middle"]);
        smallstats.textContent = `mean ${mean(points).toFixed(2)} | median ${median(points).toFixed(1)} | stddev ${stddev(points).toFixed(2)}`;
        s.appendChild(smallstats);


        // bars

        var bars = ce("g", ["id", "bars"], ["transform", `translate(${padding} ${padding})`]);

        var scale = ce("g", ["id", "scale"]);

        var divisor = Math.floor(max / 24) || 1;
        var steps = [];
        for (let i = 0; i <= divisor; i++) {
            steps.push(i * max / divisor);
        }
        steps = steps.map(e => Math.round(e));

        for (let i = 0; i < steps.length; i++) {
            let y = max - steps[i];

            let t = ce("text", ["x", -8], ["y", y], ["text-anchor", "end"], ["alignment-baseline", "middle"]);
            t.textContent = steps[i];
            scale.appendChild(t);

            let r = ce("rect", ["y", y], ["width", innerWidth], ["height", 2]);
            scale.appendChild(r);
        }

        bars.appendChild(scale);

        var left = 0;

        for (let i = 0; i < points.length; i++) {
            let color = `#${`000000${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`.slice(-6)}`;

            let rect = ce("rect", ["x", left], ["y", max - points[i]], ["width", barWidth], ["height", points[i]], ["fill", color]);

            bars.appendChild(rect);

            left += barWidth;
        }

        let hoverRect = ce("rect", ["width", barWidth], ["width", innerWidth], ["height", max], ["id", "rect-hover"]);
        hoverRect.onmouseenter = function () {
            tooltip.style.opacity = 1;
        };
        hoverRect.onmousemove = function (e) {
            var left = e.clientX - e.target.getBoundingClientRect().left;
            var index = Math.floor(left / barWidth);
            var xp = points[index] || min;
            tooltipText.textContent = xp;
            tooltip.setAttribute("transform", `translate(${left + padding + barWidth} ${offsetHeight - xp - 40})`);
        };
        hoverRect.onmouseleave = function () {
            tooltip.style.opacity = 0;
        };
        bars.appendChild(hoverRect);

        var verticallySizeable = max >= 70;

        var topLabel = ce("text", ["id", "label-top"], ["alignment-baseline", "hanging"], ["x", verticallySizeable ? 0 : barWidth + 6], ["y", verticallySizeable ? -12 : 4]);
        for (let t of [`max ${max} XP`, `${(max / points[1]).toFixed(2)}× greater than second-max`, `${(100 * max / sum).toFixed(2)}% of total XP`]) {
            let p;
            
            if (verticallySizeable) {
                p = ce("tspan", ["x", barWidth + 6], ["dy", "1.2em"]);
                p.textContent = t;
            } else {
                p = ce("tspan");
                p.textContent = `${t} / `;
            }

            topLabel.appendChild(p);
        }

        bars.insertBefore(topLabel, hoverRect);


        // tooltip

        var tooltip = ce("g", ["id", "tooltip"]);
        //tooltip.appendChild(ce("rect", ["filter", "url('#blur')"], ["width", "60"], ["height", "32"], ["fill", "#000"]));
        tooltip.appendChild(ce("rect", ["width", "60"], ["height", "32"], ["fill", "#fff"]));
        var tooltipText = tooltip.appendChild(ce("text", ["alignment-baseline", "middle"], ["text-anchor", "middle"], ["x", 30], ["y", 18]));


        // percentages

        var percentages = ce("g", ["id", "percentages"]);

        var cumSum = 0;
        var i = -1;

        while (cumSum < sum / 2) {
            cumSum += points[++i];
        }

        var factoidStr = (value, p) => `${value} (${(100 * (value) / points.length).toFixed(0)}% of) game${value > 1 ? "s" : ""} compose${value > 1 ? "" : "s"} ${p}% of XP`;

        var b = ce("rect", ["x", padding], ["y", offsetHeight + 2], ["width", barWidth * (i + 1)], ["height", 6]);
        var bLabel = ce("text", ["x", padding], ["y", offsetHeight + 7], ["alignment-baseline", "hanging"]);
        bLabel.textContent = factoidStr(i + 1, 50);

        var halfLength = Math.ceil(points.length / 2);
        var b50 = ce("rect", ["width", barWidth * halfLength], ["x", padding], ["y", offsetHeight + 22], ["height", 6]);
        var b50Label = ce("text", ["x", padding], ["y", offsetHeight + 27], ["alignment-baseline", "hanging"]);
        b50Label.textContent = factoidStr(halfLength, (100 * points.slice(0, halfLength).reduce((a, b) => a + b) / sum).toFixed(0));
        
        percentages.appendChild(b);
        percentages.appendChild(bLabel);
        percentages.appendChild(b50);
        percentages.appendChild(b50Label);

        s.appendChild(percentages);

        // unrenderables

        var filter = ce("filter", ["id", "blur"]);
        filter.appendChild(ce("feGaussianBlur", ["in", "SourceGraphic"], ["stdDeviation", "5"]));

        var style = ce("style");
        style.innerHTML = `
            text { 
                font-family: Nunito, sans-serif;
                font-weight: 700;
                fill: #444;
            }

            #title {
                font-size: 72px;
            }

            #bigstats {
                font-size: 20px;
                fill: #aaa;
            }

            #smallstats {
                font-size: 12px;
                fill: #aaa;
            }

            #bars > #scale > text {
                fill: #aaa;
            }

            #bars > #scale > rect {
                fill: #eee;
            }

            #bars > #rect-hover {
                fill: rgba(0, 0, 0, 0);
            }

            #percentages > * {
                fill: #aaa;
            }

            #percentages > text {
                font-size: 12px;
            }

            #tooltip {
                opacity: 0;
                pointer-events: none;
                transition: opacity .2s ease, transform .1s ease;
            }

            #tooltip > text {
                font-size: 22px;
            }

            #label-top {
                font-size: 16px;
            }
        `;
        
        s.appendChild(bars);
        s.appendChild(tooltip);

        s.appendChild(filter);
        s.appendChild(style);

        unapprise();
        document.body.appendChild(s);

        var button = document.createElement("button");
        button.textContent = "Rasterize";
        button.onclick = function () {
            var img = new Image();
            img.src = `data:image/svg+xml;charset=utf-8,${new XMLSerializer().serializeToString(s).replace(/#/g, "%23")}`;
            document.body.appendChild(img);

            button.remove();
        };
        document.body.appendChild(button);

        scrollTo(0, document.body.offsetHeight);
    }

    // General-use functions //

    function nthIndexOf(str, substr, n) {
        var i = 0;
        var index = null;

        while (i++ < n + 1 && index !== -1) index = str.indexOf(substr, index + 1);

        return index;
    }

    function startsWith(str, substr) { // to allow regular expressions
        if (!str.search(substr)) return true;
        return false;
    }

    function ce(tag, ...attrs) {
        var e = document.createElementNS("http://www.w3.org/2000/svg", tag);

        for (let a of attrs) {
            e.setAttribute(a[0], a[1]);
        }

        return e;
    }

    function unapprise() {
        var b = document.querySelector("button[value='ok']");
        if (b) b.click();
    }

    // Statistics functions //

    function sum(arr) {
        return arr.reduce((a, b) => a + b);
    }

    function mean(arr) {
        return sum(arr) / arr.length;
    }

    function median(arr) {
        var halfLength = arr.length / 2;

        if (arr.length % 2) return arr[halfLength - .5];
        else return (arr[halfLength - 1] + arr[halfLength]) / 2;
    }

    function stddev(arr) {
        var avg = mean(arr);
        var devs = arr.map(e => (e - avg) ** 2);
        return Math.sqrt(mean(devs));
    }
})(true);