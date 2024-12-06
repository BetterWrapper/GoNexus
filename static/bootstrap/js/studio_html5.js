/*
The HTML5 version of the GoAnimate Legacy Video Maker
*/
// loads all the themes for the studio
class Studio {
    constructor() {
        jQuery.getJSON("/api/themes/get?no_extras=true", this.themes);
        this.className = ".form-control-dark";
        this.currentElem = $(this.className);
        this.swap();
        $("#themes").html(this.themes.map(v => `<li>
            <button class="dropdown-item" onclick="studioHtml5.themeSelect('${v.attr.id}')">${v.attr.name}</button>
        </li>`).join(''));
    }
    swap(oldElem) {
        if (oldElem && oldElem.hasClass(this.className)) oldElem.removeClass(this.clasName);
        if (!this.currentElem.hasClass(this.className)) this.currentElem.addClass(this.clasName);
    }
}
