/**
 *  Virtual Keyvoard v1.0
 *  
 *  유의 사항 : hangul.js 추가 해야 합니다.
 * 
 *  CDN : <script src="https://unpkg.com/hangul-js" type="text/javascript"></script>
 * 
 *  Hangul.js Document : https://github.com/e-/Hangul.js/
 */

 /**
  * keyboard mode : qwerty, chunjiin
  * 
  */
const Keyboard = {
    elements: {
        main: null,
        keysContainer: {},
        keys: {}
    },
    eventHandlers: {
        oninput: null,
        onclose: null
    },
    config : {
        lineBreakWord : "\n",
        mode : "cheonjiin",
        layout : {
            qwerty : {
                // Kor Keyboard Layout
                korean : [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "\n",
                    "ㅂ|ㅃ", "ㅈ|ㅉ", "ㄷ|ㄸ", "ㄱ|ㄲ", "ㅅ|ㅆ", "ㅛ", "ㅕ", "ㅑ", "ㅐ|ㅒ", "ㅔ|ㅖ", "\n",
                    "ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "done", "\n",
                    "caps", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "\n",
                    "A", "space"
                ],
                // Eng Keyboard Layout
                english : [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "\n",
                    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "\n",
                    "a", "s", "d", "f", "g", "h", "j", "k", "l", "done", "\n",
                    "caps", "z", "x", "c", "v", "b", "n", "m", "\n",
                    "가", "space"
                ]
            },
            cheonjiin : {
                 // Kor Keyboard Layout
                 korean : [
                    "ㅣ", "·", "ㅡ", "backspace", "\n",
                    "ㄱㅋ", "ㄴㄹ", "ㄷㅌ", "done", "\n",
                    "ㅂㅍ", "ㅅㅎ", "ㅈㅊ", ".,?!", "\n",
                    "!#1","ㅇㅁ", "space"
                ],
                // Eng Keyboard Layout == qwerty Layout
                english : [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "\n",
                    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "\n",
                    "a", "s", "d", "f", "f", "h", "j", "k", "l", "done", "\n",
                    "caps", "z", "x", "c", "v", "b", "n", "m", "\n",
                    "가", "space"
                ]
            }
        }
    },
    default : {
        value: "",
        capsLock: false,
        bufferValue: "",
        currentLanguage: "korean",
        languageType : ""
    },
    properties: {},
    init() {
        // Init properties 
        this.properties = JSON.parse(JSON.stringify(this.default));
        this.properties.languageType = Object.keys( this.config.layout[this.config.mode] );
        
        // Create main elements
        this.elements.main = document.createElement("div");

        // Create Keycontainer
        this.properties.languageType.forEach( type => {
            this.elements.keysContainer[ type ] = document.createElement("div");
            this.elements.keysContainer[ type ].id = 'eng_keyboard';
            this.elements.keysContainer[ type ].classList.add("keyboard__keys");
        });

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.main.appendChild( this._createKeys() );

        // Setup keys elements
        this.properties.languageType.forEach( type => {
            this.elements.keys[ type ] = this.elements.keysContainer[ type ].querySelectorAll(".keyboard__key");
        });
        
        // Init Visiable Keyboard Type
        this.elements.keysContainer[ this.properties.currentLanguage ].classList.add( 'active' )
        
        // Add to DOM
        document.body.appendChild(this.elements.main);

        document.querySelectorAll(".use-virtual-keyboard").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },
    _createKeys() {
        
        const keyContainerFragment = document.createDocumentFragment();
        const keyFragment = document.createDocumentFragment();
        const keyLayout = this.config.layout[ this.config.mode ];

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        }

        for (let type in keyLayout) {
            keyLayout[type].forEach(key => {
                const keyElement = document.createElement("button");

                // 줄넘김을 추가할 마지막 key
                const insertLineBreak = this.config.lineBreakWord === key;

                // Add attributes/classes
                keyElement.setAttribute("type", "button");
                keyElement.classList.add("keyboard__key");

                switch (key) {
                    case "backspace":
                        keyElement.classList.add("keyboard__key--wide");
                        keyElement.innerHTML = createIconHTML("backspace");

                        keyElement.addEventListener("click", () => {
                            
                            this.properties.bufferValue = this.properties.bufferValue.substring(0, this.properties.bufferValue.length - 1);
                            this.properties.value = Hangul.a( this.properties.bufferValue );
                            this._triggerEvent("oninput");
                        });

                        break;

                    case "caps":
                        keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                        keyElement.innerHTML = createIconHTML("keyboard_capslock");

                        keyElement.addEventListener("click", () => {
                            this._toggleCapsLock();
                            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                        });

                        break;

                    // Enter Key Config
                    // case "enter":
                    //     keyElement.classList.add("keyboard__key--wide");
                    //     keyElement.innerHTML = createIconHTML("keyboard_return");

                    //     keyElement.addEventListener("click", () => {
                    //         this.properties.value += "\n";
                    //         this._triggerEvent("oninput");
                    //     });

                    //     break;

                    case "space":
                        keyElement.classList.add("keyboard__key--extra-wide");
                        keyElement.innerHTML = createIconHTML("space_bar");

                        keyElement.addEventListener("click", () => {
                            this.properties.bufferValue += " ";
                            this.properties.value += " ";
                            this._triggerEvent("oninput");
                        });

                        break;

                    case "done":
                        keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                        keyElement.innerHTML = createIconHTML("check_circle");

                        keyElement.addEventListener("click", () => {
                            this.close();
                            this._triggerEvent("onclose");
                        });

                        break;
                    
                    // qwerty 한/영 변환
                    case "가":
                    case "A":
                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            this._toggleLanguage(this.properties.currentLanguage);
                        });

                        keyElement.classList.add("keyboard__key--wide");
                        break;

                    default:
                        if( !key.includes('|') ){
                            keyElement.textContent = key.toLowerCase();
                        } else {
                            let keySplit = key.split('|');
                            keyElement.textContent = keySplit[0];
                            keyElement.dataset.capsOff = keySplit[0];
                            keyElement.dataset.capsOn = keySplit[1];
                        }

                        keyElement.addEventListener("click", () => {
                            this.properties.bufferValue += keyElement.textContent;
                            this.properties.value = Hangul.a(this.properties.bufferValue);

                            this._triggerEvent("oninput");
                        });

                        break;
                }

                if (insertLineBreak) {
                    keyFragment.appendChild(document.createElement("br"));
                } else {
                    keyFragment.appendChild(keyElement);
                }
            });

            this.elements.keysContainer[type].appendChild( keyFragment );
            keyContainerFragment.appendChild( this.elements.keysContainer[type] );
        }

        return keyContainerFragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        switch( this.properties.currentLanguage ){
            case "english":
                // 영문 키보드 토글
                for (const key of this.elements.keys.english) {
                    if (key.childElementCount === 0) {
                        key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                    }
                }
                break;
            
            case "korean":
                    // 한글 키보드 토글
                    for (const key of this.elements.keys.korean) {
                        if (key.childElementCount === 0 && key.dataset.capsOn !== undefined) {
                            key.textContent = this.properties.capsLock ? key.dataset.capsOn : key.dataset.capsOff;
                        }
                    }
                break;
        }

    },

    _toggleLanguage( currentLanguage ) {
        this.properties.currentLanguage = (currentLanguage == "english") ? "korean" : "english";
        this.elements.keysContainer[ currentLanguage ].classList.remove('active');
        this.elements.keysContainer[ this.properties.currentLanguage ].classList.add('active');
    },

    open(initialValue, oninput, onclose) {
        this.properties.bufferValue = Hangul.a(initialValue) || "";
        this.properties.value = this.properties.bufferValue;
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove("keyboard--hidden");
    },

    close() {
        this.properties.bufferValue = "";
        this.properties.value = "";
        this.elements.main.classList.add("keyboard--hidden");
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
