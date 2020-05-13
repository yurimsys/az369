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
        keys: []
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
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
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
        const fragment = document.createDocumentFragment();
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
            // kor: [
            //     "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
            //     "ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ", "ㅐ", "ㅔ",
            //     "ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "done",
            //     "caps", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "caps",
            //     "A", "space"
            // ]
        }

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        for (let type in keyLayout) {
            keyLayout[type].forEach(key => {
                const keyElement = document.createElement("button");

                // 줄넘김을 추가할 마지막 key
                const insertLineBreak = ["backspace", "p", "done", "m", "ㅔ"].indexOf(key) !== -1;

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
                        keyElement.textContent = key.toLowerCase();
                        keyElement.classList.add("keyboard__key--wide");
                        break;

                    default:
                        keyElement.textContent = key.toLowerCase();

                        keyElement.addEventListener("click", () => {
                            // 대 소문자 구분 입력.
                            // 한글, 영문 입력.
                            // 한글 pair 입력.
                            this.properties.bufferValue += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                            this.properties.value = Hangul.a(this.properties.bufferValue);

                            // 삭제예정.
                            // this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                            this._triggerEvent("oninput");
                        });

                        break;
                }

                fragment.appendChild(keyElement);

                if (insertLineBreak) {
                    fragment.appendChild(document.createElement("br"));
                }
            });
        }

        return fragment;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        const koreanKeyPair = [
            ["ㅂ", "ㅃ"],
            ["ㅈ", "ㅉ"],
            ["ㄷ", "ㄸ"],
            ["ㄱ", "ㄲ"],
            ["ㅅ", "ㅆ"],
            ["ㅐ", "ㅒ"],
            ["ㅔ", "ㅖ"],
        ];
        // 한글 caps lock 시 KeyPair 에 맞게 수정.
        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _toggleLanguage() {
        // this.    
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
