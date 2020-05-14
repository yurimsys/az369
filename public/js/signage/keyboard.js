/**
 *  Virtual Keyvoard v1.0
 *  
 *  유의 사항 : hangul.js 추가 해야 합니다.
 * 
 *  CDN : <script src="https://unpkg.com/hangul-js" type="text/javascript"></script>
 * 
 *  Hangul.js Document : https://github.com/e-/Hangul.js/
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
    properties: {
        value: "",
        capsLock: false,
        bufferValue: "",
        currentKeyboardType: "eng"
    },
    init() {
        // Create main elements
        this.elements.main = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.main.appendChild( this._createKeys() );

        this.elements.keys.eng = this.elements.keysContainer.eng.querySelectorAll(".keyboard__key");
        this.elements.keys.kor = this.elements.keysContainer.kor.querySelectorAll(".keyboard__key");

        // Init Visiable Keyboard Type
        this.elements.keysContainer[ this.properties.currentKeyboardType ].classList.add( 'active' )
        
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
        this.elements.keysContainer.eng = document.createElement("div");
        this.elements.keysContainer.eng.id = 'eng_keyboard';
        this.elements.keysContainer.eng.classList.add("keyboard__keys");
        
        this.elements.keysContainer.kor = document.createElement("div");
        this.elements.keysContainer.kor.id = 'kor_keyboard';
        this.elements.keysContainer.kor.classList.add("keyboard__keys");
        
        const keyContainerFragment = document.createDocumentFragment();
        const keyFragment = document.createDocumentFragment();
        const keyLayout = {
            // Eng Keyboard Layout
            eng: [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
                "a", "s", "d", "f", "g", "h", "j", "k", "l", "done",
                "caps", "z", "x", "c", "v", "b", "n", "m",
                "가", "space"
            ],

            // Kor Keyboard Layout
            kor: [
                "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
                "ㅂ|ㅃ", "ㅈ|ㅉ", "ㄷ|ㄸ", "ㄱ|ㄲ", "ㅅ|ㅆ", "ㅛ", "ㅕ", "ㅑ", "ㅐ|ㅒ", "ㅔ|ㅖ",
                "ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "done",
                "caps", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ",
                "A", "space"
            ]
        }

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        }

        for (let type in keyLayout) {
            keyLayout[type].forEach(key => {
                const keyElement = document.createElement("button");

                // 줄넘김을 추가할 마지막 key
                const insertLineBreak = ["backspace", "p", "done", "m", "ㅔ|ㅖ", "ㅡ"].indexOf(key) !== -1;

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

                    case "가":
                    case "A":
                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            this._toggleLanguage(this.properties.currentKeyboardType);
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

                keyFragment.appendChild(keyElement);

                if (insertLineBreak) {
                    keyFragment.appendChild(document.createElement("br"));
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

        switch( this.properties.currentKeyboardType ){
            case "eng":
                // 영문 키보드 토글
                for (const key of this.elements.keys.eng) {
                    if (key.childElementCount === 0) {
                        key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
                    }
                }
                break;
            
            case "kor":
                    // 한글 키보드 토글
                    for (const key of this.elements.keys.kor) {
                        if (key.childElementCount === 0 && key.dataset.capsOn !== undefined) {
                            key.textContent = this.properties.capsLock ? key.dataset.capsOn : key.dataset.capsOff;
                        }
                    }
                break;
        }

    },

    _toggleLanguage( currentKeyboardType ) {
        this.properties.currentKeyboardType = (currentKeyboardType == "eng") ? "kor" : "eng";
        this.elements.keysContainer[ currentKeyboardType ].classList.remove('active');
        this.elements.keysContainer[ this.properties.currentKeyboardType ].classList.add('active');
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
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add("keyboard--hidden");
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
