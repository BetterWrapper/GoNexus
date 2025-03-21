(function() {
    if (window._vyondCookiePolicyScriptLoaded) {
        return;
    }
    window._vyondCookiePolicyScriptLoaded = true;

    var iframeResizer = '/static/iframeResizer.js';
    var thirdPartyCookieList = 'https://app.vyond.com/v2/cookies/list';
    var origin = 'https://app.vyond.com';

    var isStringentPrivacyCountry = false;
    var cookieDomain = '.vyond.com';
    var cookieImageUrl = '/static/cookies.png';
    var cookiePolicyUrl = 'https://www.vyond.com/cookies';
    var showCookiePolicyOnLoad = !window.location.href.match(cookiePolicyUrl);

    var minDialogHeight = 462;
    var titleAreaHeight = 60;
    var bottomAreaHeight = 72;

    var allActiveCookieValues = {
        strict: 1,
        functional: 1,
        analytics: 1,
        targeting: 1
    };
    var defaultCookieValues = {
        strict: 1,
        functional: 0,
        analytics: 0,
        targeting: 0
    };

    var insertedCookieSettingDialogStyles = false;

    var dialog,
        overlay,
        cookieValues,
        scrollable,
        defaultOverflowY;

    var adjustScrollableArea = function() {
        if (scrollable) {
            var dialogHeight = window.innerHeight * 0.8;

            dialogHeight = Math.max(minDialogHeight, dialogHeight);

            scrollable.style.height = (dialogHeight - titleAreaHeight - bottomAreaHeight) + 'px';
        }
    };

    var cookieString = getCookie('cookieConsent');

    try {
        cookieValues = JSON.parse(cookieString);
    } catch (err) {
        cookieValues = null;
    }

    var areCookiesSet = (cookieValues !== null) && (cookieValues !== undefined);

    if (!areCookiesSet) {
        cookieValues = defaultCookieValues;
    }

    if (isStringentPrivacyCountry) {
        if (areCookiesSet) {
            pushDataLayerVariables(cookieValues);
        } else if (showCookiePolicyOnLoad) {
            ready(function() {
                loadAndDisplayCookiePolicy();
            });
        }
    } else {
        pushDataLayerVariables(allActiveCookieValues);
    }

    ready(function() {
        fillCookiePolicyDialogTrigger();
        fillCookieListIframe();
    });

    function showCookieSettingsDialog() {
        insertCookieSettingDialogStyles();
        showOverlay();
        displayCookieSettings();
    };

    function loadAndDisplayCookiePolicy() {
        insertCookieSettingDialogStyles();
        showOverlay();
        displayCookiePolicy();
    }

    function insertCookieSettingDialogStyles() {
        if (insertedCookieSettingDialogStyles) {
            return;
        }

        insertedCookieSettingDialogStyles = true;

        var overlayStyle = document.createElement('style'),
            dialogStyle = document.createElement('style'),
            paragraphStyle = document.createElement('style'),
            buttonStyle = document.createElement('style'),
            titleStyle = document.createElement('style'),
            dividerStyle = document.createElement('style'),
            linkStyle = document.createElement('style'),
            imageStyle = document.createElement('style'),
            sliderStyle = document.createElement('style'),
            mediaQueryStyle = document.createElement('style');

        var cookieSettingDialogStyles = [
            overlayStyle,
            dialogStyle,
            paragraphStyle,
            buttonStyle,
            titleStyle,
            dividerStyle,
            linkStyle,
            imageStyle,
            sliderStyle,
            mediaQueryStyle
        ];

        overlayStyle.innerHTML = '.cookie-overlay { position: fixed; top: 0; min-width: 100%; min-height:100%; z-index: 16777271; background-color: rgba(244,244,244,0.5)}';
        dialogStyle.innerHTML = '.scrollable-content{ overflow-y: scroll; } .cookie-dialog { display:flex; flex-direction: column; position: absolute; top: 50%; left: 50%; width: 500px; max-height: 80vh; min-height: 462px; background-color: #fff; transform: translate(-50%, -50%); box-shadow: 0 0 30px rgba(0,0,0,0.3); border-radius: 4px } .cookie-dialog-bottom { height: 72px; min-height: 72px }';
        paragraphStyle.innerHTML = '.cookie-paragraph { position: relative; margin: 16px; font-size: 13px; font-weight: 400; color: grey; line-height: 1.6 }';
        buttonStyle.innerHTML = '.cookie-button { position: relative; margin: 16px 16px 16px 0; font-size: 11px; font-weight: 500; color: #fff; border: 1px solid transparent; border-radius: 3px; letter-spacing: 1.2px; padding: 12px 30px; cursor: pointer; text-align: center; text-transform: uppercase; background-color: #d85e27; float: right; outline: 0; } .cookie-button:hover { opacity: .65; background-color: #d85e27; } .cookie-button:focus { outline: thin dotted; outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; } .cookie-button--white { color: #576a75; background-color: #fff; border-color: #576a75 } .cookie-button--white:hover { background-color: #fff; border-color: #8ca8b7; color: #8ca8b7; }';
        titleStyle.innerHTML = '.cookie-title-container { display: flex; justify-content: space-between } .cookie-title { position: relative; top: 0; left: 0; margin: 20px 16px; font-size: 18px; line-height: 20px; color: #d85e27; font-weight: 400 } .cookie-title--subtitle { color: #000; font-size: 14px; margin: 0 16px 0 16px } .cookie-title--blue { color: #00a1cc; font-size: 14px; margin: 0 30px 0 16px }';
        dividerStyle.innerHTML = '.cookie-divider { margin: 0; width: 100%; background-color: rgba(0,0,0,0.2); height: 1px; border: 0 }';
        linkStyle.innerHTML = '.cookie-link { position: relative; display: block; margin: 0 0 16px 16px; cursor: pointer; color: #5596e6; font-weight: 500; text-decoration: none }';
        imageStyle.innerHTML = '.cookie-image { background-position-x: center; background-repeat: no-repeat; background-size: contain; width: 100%; height: 200px; display: block; margin: 0 auto }';
        sliderStyle.innerHTML = '.cookie-slider-container { display: flex; align-items: center; margin-right: 12px } .cookie-slider-text { width: 60px; margin-left: 16px; font-size: 14px; color: #999; } .cookie-slider-text--active { color: #00a1cc; }.cookie-switch-button { position:relative; display:flex; width:32px; height:16px } .cookie-switch-button__slider { position:absolute; cursor:pointer; top:1px; left:1px; right:1px; bottom:1px; background-color:#eaedf1; transition:.4s; border-radius:7px } .cookie-switch-button__slider::before{ position:absolute; content:""; height:16px; width:16px; left:-1px; bottom:-1px; background-color:#fff; transition:.4s; box-shadow:0 0 2px 0 rgba(0,0,0,.5); border-radius:50% } .cookie-switch-button__slider:hover::before{ box-shadow:0 0 2px 0 rgba(0,0,0,.8) } .cookie-switch-button--selected .cookie-switch-button__slider{ background-color:#00a1cc } .cookie-switch-button--selected .cookie-switch-button__slider::before{ transform:translateX(16px) }';
        mediaQueryStyle.innerHTML = '@media (max-width: 500px) { .cookie-image { height: 100px } .cookie-dialog { width: 300px } .cookie-button { margin: 16px 16px 10px 0 } }';

        cookieSettingDialogStyles.forEach(function(style) {
            document.head.appendChild(style);
        });
    }

    function showOverlay() {
        defaultOverflowY = document.body.style.overflowY;

        document.body.style.overflowY = 'hidden';
        overlay = document.createElement('div');
        overlay.className = 'cookie-overlay';
        overlay.setAttribute('tabindex', -1);
        document.body.appendChild(overlay);
    }

    function displayCookiePolicy() {
        if (dialog) {
            dialog.parentNode.removeChild(dialog);
        }

        dialog = createDialog();

        var paragraph = createParagraph('We use cookies for the core functionality of this website. We also use third-party cookies to offer extra functionality and customized content, as well as to analyze our traffic.');
        var linkPolicy = createLink('Cookie Policy', cookiePolicyUrl);
        var dialogBottom = document.createElement('div');
        var settingsButton = createButton('Cookie Settings', true);
        var acceptButton = createButton('Accept All Cookies');
        var img = document.createElement('div');

        img.style.backgroundImage = 'url(\'' + cookieImageUrl + '\')';
        img.className = 'cookie-image';

        dialogBottom.className = 'cookie-dialog-bottom';
        overlay.className = 'cookie-overlay';

        dialogBottom.appendChild(acceptButton);
        dialogBottom.appendChild(settingsButton);
        dialog.appendChild(createTitle('Cookie Policy'));
        dialog.appendChild(img);
        dialog.appendChild(paragraph);
        dialog.appendChild(linkPolicy);
        dialog.appendChild(createDivider());
        dialog.appendChild(dialogBottom);

        overlay.appendChild(dialog);

        acceptButton.onclick = function() {
            setCookie('cookieConsent', JSON.stringify(allActiveCookieValues));
            pushDataLayerVariables(allActiveCookieValues);

            overlay.parentNode.removeChild(overlay);

            document.body.style.overflowY = defaultOverflowY;
        };

        settingsButton.onclick = function() {
            displayCookieSettings();
        };

        enforceFocus();
    }

    function displayCookieSettings() {
        if (dialog) {
            dialog.parentNode.removeChild(dialog);
        }

        dialog = createDialog();

        var paragraphStrict = createParagraph('These cookies are strictly necessary to provide you with services available through our websites and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary, you cannot refuse them, as it would impact how our websites function.');
        var paragraphFunctional = createParagraph('These cookies are used to enhance the functionality and performance of our websites but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.');
        var paragraphAnalytics = createParagraph('These cookies collect information that is used either in aggregate form to help us understand how our websites are being used or how effective our marketing campaigns are, or to help us customize our websites and application for you in order to enhance your experience.');
        var paragraphTargeting = createParagraph('These cookies are used to make advertising messages more relevant to you and your interests. They also perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.');

        var alwaysActiveText = createSubtitle('Always Active', 'cookie-title cookie-title--blue');
        var sliderFunctional = createSlider('functional');
        var sliderAnalytics = createSlider('analytics');
        var sliderTargeting = createSlider('targeting');

        var subtitleStrict = createSubtitle('Strictly Necessary Cookies');
        var subtitleFunctional = createSubtitle('Functionality & Performance Cookies');
        var subtitleAnalytics = createSubtitle('Analytics & Customization Cookies');
        var subtitleTargeting = createSubtitle('Targeting & Advertising Cookies');

        scrollable = document.createElement('div');
        var dialogBottom = document.createElement('div');

        dialogBottom.className = 'cookie-dialog-bottom';
        scrollable.className = 'scrollable-content';

        adjustScrollableArea();
        window.addEventListener('resize', adjustScrollableArea);

        var saveButton = createButton('Save');

        saveButton.addEventListener('click', function() {
            document.body.style.overflowY = defaultOverflowY;

            overlay.parentNode.removeChild(overlay);

            document.body.style.overflowY = '';

            window.removeEventListener('resize', adjustScrollableArea);

            setCookie('cookieConsent', JSON.stringify(cookieValues));

            pushDataLayerVariables(cookieValues);
        });

        subtitleStrict.appendChild(alwaysActiveText);
        subtitleFunctional.appendChild(sliderFunctional);
        subtitleAnalytics.appendChild(sliderAnalytics);
        subtitleTargeting.appendChild(sliderTargeting);

        dialog.appendChild(createTitle('Cookie Settings'));
        scrollable.appendChild(subtitleStrict);
        scrollable.appendChild(paragraphStrict);
        scrollable.appendChild(subtitleFunctional);
        scrollable.appendChild(paragraphFunctional);
        scrollable.appendChild(subtitleAnalytics);
        scrollable.appendChild(paragraphAnalytics);
        scrollable.appendChild(subtitleTargeting);
        scrollable.appendChild(paragraphTargeting);
        dialogBottom.appendChild(saveButton);
        dialog.appendChild(scrollable);
        dialog.appendChild(createDivider());
        dialog.appendChild(dialogBottom);
        overlay.appendChild(dialog);

        enforceFocus();
    }

    function createDialog(height) {
        var dialog = document.createElement('div');

        dialog.className = 'cookie-dialog';

        return dialog;
    }

    function createParagraph(text) {
        var paragraph = document.createElement('div');
        var paragraphText = document.createTextNode(text);

        paragraph.className = 'cookie-paragraph';

        paragraph.appendChild(paragraphText);

        return paragraph;
    }

    function createTitle(text) {
        var title = document.createElement('div');
        var titleText = document.createTextNode(text);

        title.appendChild(titleText);

        title.className = 'cookie-title';

        return title;
    }

    function createSubtitle(text, className) {
        var titleContainer = document.createElement('div');
        var title = createTitle(text);

        titleContainer.appendChild(title);
        titleContainer.className = 'cookie-title-container';

        if (className) {
            title.className = className;
        } else {
            title.className = 'cookie-title cookie-title--subtitle';
        }

        return titleContainer;
    }

    function createButton(text, isWhite) {
        var button = document.createElement('button');
        var buttonText = document.createTextNode(text);

        button.appendChild(buttonText);

        if (isWhite) {
            button.className = 'cookie-button cookie-button--white';
        } else {
            button.className = 'cookie-button';
        }

        return button;
    }

    function createDivider() {
        var divider = document.createElement('hr');

        divider.className = 'cookie-divider';

        return divider;
    }

    function createLink(text, href) {
        var link = document.createElement('a');
        var linkText = document.createTextNode(text);

        link.appendChild(linkText);

        link.className = 'cookie-link';

        if (href) {
            link.href = href;
        }

        return link;
    }

    function createSlider(cookieName) {
        var sliderWithText = document.createElement('div');
        var switchContainer = document.createElement('div');
        var sliderInput = document.createElement('input');
        var sliderLabel = document.createElement('label');
        var sliderSpan = document.createElement('span');
        var sliderTextContainer = document.createElement('div');
        var sliderText = document.createTextNode('Active');

        sliderInput.checked = cookieValues[cookieName];

        if (cookieValues[cookieName]) {
            sliderLabel.className = 'cookie-switch-button cookie-switch-button--selected';
            sliderText.nodeValue = 'Active';
            sliderTextContainer.className = 'cookie-slider-text cookie-slider-text--active';
        } else {
            sliderLabel.className = 'cookie-switch-button';
            sliderText.nodeValue = 'Inactive';
            sliderTextContainer.className = 'cookie-slider-text';
        }

        sliderLabel.addEventListener('click', function() {
            sliderInput.checked = !sliderInput.checked;

            cookieValues[cookieName] = Number(sliderInput.checked);

            if (sliderInput.checked) {
                sliderLabel.className = 'cookie-switch-button cookie-switch-button--selected';
                sliderText.nodeValue = 'Active';
                sliderTextContainer.className = 'cookie-slider-text cookie-slider-text--active';
            } else {
                sliderLabel.className = 'cookie-switch-button';
                sliderText.nodeValue = 'Inactive';
                sliderTextContainer.className = 'cookie-slider-text';
            }
        });

        sliderInput.type = 'checkbox';
        sliderInput.style.display = 'none';
        sliderSpan.className = 'cookie-switch-button__slider';
        sliderWithText.className = 'cookie-slider-container';

        sliderTextContainer.appendChild(sliderText);
        sliderLabel.appendChild(sliderSpan);
        switchContainer.appendChild(sliderInput);
        switchContainer.appendChild(sliderLabel);
        sliderWithText.appendChild(switchContainer);
        sliderWithText.appendChild(sliderTextContainer);

        return sliderWithText;
    }

    function pushDataLayerVariables(values) {
        if (window.dataLayer) {
            window.dataLayer.push({
                'cookieConsent': values,
                'userId': '',
                'event': 'cookieConsent_Accept'
            });

            if (window._vyccq && Array.isArray(window._vyccq) && (window._vyccq.length > 0)) {
                var numFunctions = window._vyccq.length;
                for (var i = 0; i < numFunctions; i++) {
                    if (typeof window._vyccq[i] === 'function') {
                        window._vyccq[i]();
                    }
                }
            }
        }
    }

    function getCookie(cname) {
        var name = cname + '=';
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];

            c = c.replace(/^\s+|\s+$/gm, '');

            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return null;
    }

    function setCookie(cname, cvalue) {
        var date = new Date();

        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + date.toUTCString();

        document.cookie = cname + '=' + escape(cvalue) + ';' + expires + ';path=/;domain=' + cookieDomain + ';secure';
    }

    function fillCookiePolicyDialogTrigger() {
        if (!isStringentPrivacyCountry) {
            return;
        }

        var cookiePolicyDialogTriggers = document.getElementsByClassName('cookie-policy-dialog-trigger'),
            numCookiePolicyDialogTriggers = cookiePolicyDialogTriggers.length;

        if (numCookiePolicyDialogTriggers === 0) {
            return;
        }

        var triggerButtonStyle = document.createElement('style');

        triggerButtonStyle.innerHTML = '.trigger-button { background: #00a1cc; color: #fff; font-weight: 500; display: inline-block; padding: 0.5em 1.2em; border-radius: 3px; -webkit-transition: all 0.4s cubic-bezier(0.5, 0.25, 0, 1.395); transition: all 0.4s cubic-bezier(0.5, 0.25, 0, 1.395); margin-top: 1em; outline: none; border: 0; line-height: 1.6; border: 0; } .trigger-button:hover { background: #0499bc; }';
        document.head.appendChild(triggerButtonStyle);

        for (var i = 0; i < numCookiePolicyDialogTriggers; i++) {
            var cookiePolicyDialogTrigger = cookiePolicyDialogTriggers[i],
                text = cookiePolicyDialogTrigger.innerHTML,
                button = document.createElement('button');

            button.className = 'trigger-button';
            button.innerHTML = 'Cookies Settings';

            cookiePolicyDialogTrigger.appendChild(button);
            button.onclick = function(e) {
                showCookieSettingsDialog();
            };
        }
    }

    function fillCookieListIframe() {
        var iFrameResizeScriptTag = document.createElement('script'),
            thirdPartyCookieListIframeContainers = document.getElementsByClassName('third-party-cookie-list-iframe-container'),
            numThirdPartyCookieListIframeContainers = thirdPartyCookieListIframeContainers.length;

        if (numThirdPartyCookieListIframeContainers === 0) {
            return;
        }

        iFrameResizeScriptTag.setAttribute('src', iframeResizer);

        document.head.appendChild(iFrameResizeScriptTag);

        iFrameResizeScriptTag.onload = function() {
            for (var i = 0; i < numThirdPartyCookieListIframeContainers; i++) {
                var thirdPartyCookieListIframeContainer = thirdPartyCookieListIframeContainers[i],
                    thirdPartyCookieListIframe = document.createElement('iframe');

                thirdPartyCookieListIframe.className = 'third-party-cookie-list-iframe';
                thirdPartyCookieListIframe.src = thirdPartyCookieList;
                thirdPartyCookieListIframe.frameBorder = 0;
                thirdPartyCookieListIframe.width = '100%';
                thirdPartyCookieListIframe.scrolling = 'no';
                thirdPartyCookieListIframe.allowTransparency = true;

                thirdPartyCookieListIframeContainer.appendChild(thirdPartyCookieListIframe);
            }

            iFrameResize({
                checkOrigin: [origin],
            }, '.third-party-cookie-list-iframe');
        }
    }

    function ready(fn) {
        if (document.attachEvent ? (document.readyState === 'complete') : (document.readyState !== 'loading')) {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function enforceFocus() {
        document.removeEventListener('focusin', checkFocus); // Guard against infinite focus loop
        document.addEventListener('focusin', checkFocus);
    }

    function checkFocus(event) {
        if ((document !== event.target) &&
            (overlay !== event.target) &&
            !overlay.contains(event.target)
        ) {
            overlay.focus();
        }
    }
})();