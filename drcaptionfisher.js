function fish(target) {
    var i = document.createElement("iframe");
    i.style.width = "90vw";
    i.style.height = "90vh";
    i.style.minWidth = "875px";
    i.style.minHeight = "1200px";

    var a = new Audio();
    a.loop = true;
    a.src = "https://sounds.pond5.com/ice-cream-truck-loop-music-046402548_prev.m4a";
    document.body.appendChild(a);

    i.onload = function () {
        var w = i.contentWindow;
        var caption = w.document.querySelector(".play-phrase");
        console.log(caption ? caption.textContent.trim() : "");
        if (caption && caption.textContent.trim() === target) {
            a.play();
            alert(`hey! "${target}"`);
            return;
        }
        setTimeout(function () {
            w.document.querySelector("button[title='Skip']").click();
        }, 300 + Math.random() * 900);
    };

    document.body.appendChild(i);
    i.src = "https://drawception.com/play/";
}