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
  * keyboard mode : qwerty, cheonjiin
  * 
  */
const Keyboard = {
    elements: {
        main: null,
        keysContainer: {},
        keys: {},
        close: null
    },
    eventHandlers: {
        oninput: null,
        onclose: null,
        onsearch: null
    },
    config : {
        debugger : false,
        BlankLineWord : "---",
        lineBreakWord : "\n",
        mode : "cheonjiin",
        layout : {
            qwerty : {
                // Kor Keyboard Layout
                korean : [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "\n",
                    "ㅂ|ㅃ", "ㅈ|ㅉ", "ㄷ|ㄸ", "ㄱ|ㄲ", "ㅅ|ㅆ", "ㅛ", "ㅕ", "ㅑ", "ㅐ|ㅒ", "ㅔ|ㅖ", "\n",
                    "ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ", "ㅣ", "search", "\n",
                    "caps", "ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "\n",
                    "A", "space"
                ],
                // Eng Keyboard Layout
                english : [
                    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace", "\n",
                    "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "\n",
                    "a", "s", "d", "f", "g", "h", "j", "k", "l", "search", "\n",
                    "caps", "z", "x", "c", "v", "b", "n", "m", "\n",
                    "가", "space"
                ]
            },
            cheonjiin : {
                 // Kor Keyboard Layout
                 korean : [
                    "ㅣ", "·", "ㅡ", "backspace", "\n",
                    "ㄱㅋ", "ㄴㄹ", "ㄷㅌ", "search", "\n",
                    "ㅂㅍ", "ㅅㅎ", "ㅈㅊ", "A","\n",
                    "","ㅇㅁ", "", "space",
                    "---",
                    "1", "2", "3", "-/", "\n",
                    "4", "5", "6", ".,?!", "\n",
                    "7", "8", "9", "@#", "\n",
                    "","0","","","\n"
                ],
                // Eng Keyboard Layout == qwerty Layout
                english : [
                    "a", "b", "c","backspace", "\n",
                    "d", "e", "f", "search", "\n",
                    "g", "h", "i", "가", "\n",
                    "j", "k", "l", "space", "\n",
                    "m", "n", "o", "caps", "\n",
                    "p", "q", "r", "-/", "\n",
                    "s", "t", "u", ".,?!", "\n",
                    "v", "w", "x", "", "\n",
                    "y", "z", "", "", "\n"
                ]
            }
        }
    },
    default : {
        value: "",
        capsLock: false,
        bufferValue: "",
        currentLanguage: "korean",
        languageType : "",
        beforCharDurationSec : 1.5
    },
    properties: {
        beforeCharResetTimeout : null,
        beforeChar : "",
        cheonjiinMapData : {
            "ㄱㅋ" : ['ㄱ', 'ㅋ', 'ㄲ'],
            "ㄴㄹ" : ['ㄴ', 'ㄹ'],
            "ㄷㅌ" : ['ㄷ', 'ㅌ', 'ㄸ'],
            "ㅂㅍ" : ['ㅂ', 'ㅍ', 'ㅃ'],
            "ㅅㅎ" : ['ㅅ', 'ㅎ', 'ㅆ'],
            "ㅈㅊ" : ['ㅈ', 'ㅊ', 'ㅉ'],
            "ㅇㅁ" : ['ㅇ', 'ㅁ'],
            "-/"  : ['-', '/'],
            "@#"  : ['@', '#'],
            ".,?!" : [".", ",", "?", "!"]
        },
        cIndex : 0
    },
    init() {
        if( document.querySelector('.keyboard') != undefined ) return false;
        // Init properties 
        this.properties = Object.assign(this.properties, this.default);
        this.properties.languageType = Object.keys( this.config.layout[this.config.mode] );
        
        // Create main elements
        this.elements.main = document.createElement("div");

        // Create Keycontainer
        this.properties.languageType.forEach( type => {
            this.elements.keysContainer[ type ] = document.createElement("div");
            this.elements.keysContainer[ type ].id = 'eng_keyboard';
            this.elements.keysContainer[ type ].classList.add("keyboard__keys");
        });

        // Setup 닫기 Element
        this.elements.close = document.createElement('div');
        this.elements.close.style.display = "flex";
        this.elements.close.innerHTML = `<div class="keyboard__key keyboard__close keyboard__key--wide keyboard__key--dark">닫 기</div>`;
        this.elements.close.firstChild.addEventListener("click", () => {
            this.close();
        })

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.main.appendChild( this._createKeys() );
        this.elements.main.appendChild( $("<div class='keyboard__blank_line'>")[0] );
        this.elements.main.appendChild( this.elements.close );

        // Setup keys elements
        this.properties.languageType.forEach( type => {
            this.elements.keys[ type ] = this.elements.keysContainer[ type ].querySelectorAll(".keyboard__key");
        });
        
        // Init Visiable Keyboard Type
        this.elements.keysContainer[ this.properties.currentLanguage ].classList.add( 'active' );
        
        // Add to DOM
        document.body.appendChild(this.elements.main);

        document.querySelectorAll(".use-virtual-keyboard").forEach(element => {
            // Focus Event 
            element.addEventListener("focus", () => {
                this.open(element.value, 
                    currentValue => {
                        element.value = currentValue;
                        // Input Event execute
                        $(element).trigger('input');
                        // Debugger
                        this.debugger();
                    }
                );
                
                // Layout Position setup
                let searchLeftPosition = document.querySelector(".searchLeft").getBoundingClientRect();
                let keyboardElement = document.querySelector(".keyboard");
                keyboardElement.style.top = searchLeftPosition.top+"px";
                keyboardElement.style.left = searchLeftPosition.left+"px";
                keyboardElement.style.height = searchLeftPosition.height+"px";
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
                const insertBlankLine = this.config.BlankLineWord === key;

                // Add attributes/classes
                keyElement.setAttribute("type", "button");
                keyElement.classList.add("keyboard__key");

                switch (key) {
                    case "backspace":
                        // keyElement.classList.add("keyboard__key--wide");
                        keyElement.innerHTML = createIconHTML("backspace");

                        keyElement.addEventListener("click", () => {
                            this.properties.beforeChar = '';
                            this.properties.bufferValue = this.properties.bufferValue.substring(0, this.properties.bufferValue.length - 1);
                            this.properties.value = Hangul.a( this.properties.bufferValue );
                            this._triggerEvent("oninput");
                        });

                        break;

                    case "caps":
                        if(this.config.mode === 'qwerty'){
                            keyElement.classList.add("keyboard__key--wide");
                        }
                        keyElement.classList.add("keyboard__key--activatable");
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
                        if(this.config.mode === "cheonjiin"){

                        } else {
                            keyElement.classList.add("keyboard__key--extra-wide");
                        }
                        keyElement.innerHTML = createIconHTML("space_bar");

                        keyElement.addEventListener("click", () => {
                            this.properties.beforeChar = "";
                            this.properties.bufferValue += " ";
                            this.properties.value += " ";
                            this._triggerEvent("oninput");
                        });

                        break;

                    case "search":
                        // keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                        keyElement.classList.add("keyboard__key--dark");
                        keyElement.innerHTML = createIconHTML("search");

                        keyElement.addEventListener("click", () => {
                            this.properties.beforeChar = "";
                            this._triggerEvent("onserch");
                            this.close();
                        });

                        break;
                    
                    // qwerty 한/영 변환
                    case "가":
                    case "A":
                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            this.properties.beforeChar = '';
                            this._toggleLanguage(this.properties.currentLanguage);
                        });

                        if(this.config.mode === 'qwerty'){
                            keyElement.classList.add("keyboard__key--wide");
                        }
                        break;


                    // 천지인 모음 자판
                    case "ㅣ":

                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            if(this.properties.beforeChar === '·')          this._cheonjiinInputEvent('ㅓ');
                            else if (this.properties.beforeChar === '··')   this._cheonjiinInputEvent('ㅕ');
                            else if (this.properties.beforeChar === 'ㅏ')   this._cheonjiinInputEvent('ㅐ');
                            else if (this.properties.beforeChar === 'ㅑ')   this._cheonjiinInputEvent('ㅒ');
                            else if (this.properties.beforeChar === 'ㅓ')   this._cheonjiinInputEvent('ㅔ');
                            else if (this.properties.beforeChar === 'ㅕ')   this._cheonjiinInputEvent('ㅖ');
                            else if (this.properties.beforeChar === 'ㅗ')   this._cheonjiinInputEvent('ㅚ');
                            else if (this.properties.beforeChar === 'ㅜ')   this._cheonjiinInputEvent('ㅟ');
                            else if (this.properties.beforeChar === 'ㅠ')   this._cheonjiinInputEvent('ㅝ');
                            else if (this.properties.beforeChar === 'ㅘ')   this._cheonjiinInputEvent('ㅙ');
                            else if (this.properties.beforeChar === 'ㅝ')   this._cheonjiinInputEvent('ㅞ');
                            else if (this.properties.beforeChar === 'ㅡ')   this._cheonjiinInputEvent('ㅢ')
                            else {
                                this.properties.beforeChar = keyElement.textContent;
                                this.properties.bufferValue += keyElement.textContent;
                                this.properties.value = Hangul.a(this.properties.bufferValue);
                            }
                            this._triggerEvent("oninput");
                        });

                        break;
                    case "·": 
                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            clearTimeout(this.properties.beforeCharResetTimeout);
                            if(this.properties.beforeChar === '·')          this._cheonjiinInputEvent('··');
                            else if (this.properties.beforeChar === '··')   this._cheonjiinInputEvent('·');
                            else if (this.properties.beforeChar === 'ㅣ')   this._cheonjiinInputEvent('ㅏ');
                            else if (this.properties.beforeChar === 'ㅏ')   this._cheonjiinInputEvent('ㅑ');
                            else if (this.properties.beforeChar === 'ㅡ')   this._cheonjiinInputEvent('ㅜ');
                            else if (this.properties.beforeChar === 'ㅜ')   this._cheonjiinInputEvent('ㅠ');
                            else if (this.properties.beforeChar === 'ㅚ')   this._cheonjiinInputEvent('ㅘ');
                            else {
                                this.properties.beforeChar = keyElement.textContent;
                                this.properties.bufferValue += keyElement.textContent;
                                this.properties.value = Hangul.a(this.properties.bufferValue);
                            }
                            this._triggerEvent("oninput");
                        });

                        break;
                    case "ㅡ":
                        keyElement.textContent = key.toString();
                        keyElement.addEventListener("click", () => {
                            if(this.properties.beforeChar === '·')          this._cheonjiinInputEvent('ㅗ');
                            else if (this.properties.beforeChar === '··')   this._cheonjiinInputEvent('ㅛ');
                            else {
                                this.properties.beforeChar = keyElement.textContent;
                                this.properties.bufferValue += keyElement.textContent;
                                this.properties.value = Hangul.a(this.properties.bufferValue);
                            }
                            this._triggerEvent("oninput");
                        });

                        break;
                    default:
                        // capsLock 분리
                        if( !key.includes('|') ){
                            keyElement.textContent = key.toLowerCase();
                        } else {
                            let keySplit = key.split('|');
                            keyElement.textContent = keySplit[0];
                            keyElement.dataset.capsOff = keySplit[0];
                            keyElement.dataset.capsOn = keySplit[1];
                        }

                        keyElement.addEventListener("click", () => {
                            if(this.config.mode.toLowerCase() === "qwerty"){
                                this.properties.bufferValue += keyElement.textContent;
                                this.properties.value = Hangul.a(this.properties.bufferValue);
                            } else if(this.config.mode.toLowerCase() === "cheonjiin" ) {
                                // timeout reset
                                clearTimeout(this.properties.beforeCharResetTimeout);
                                this.properties.beforeCharResetTimeout = setTimeout( this.beforeCharReset, this.properties.beforCharDurationSec * 1000);
                                let keyChar = this._getCharCheonjiin( keyElement )
                                this._cheonjiinInputEvent( keyChar.char, keyChar.mode );
                            }
                            
                            this._triggerEvent("oninput");
                        });

                        break;
                }

                if ( insertLineBreak ) {
                    keyFragment.appendChild( document.createElement("br") );
                } else if( insertBlankLine ) {
                    let blankLine = document.createElement("div");
                    blankLine.classList.add('keyboard__blank_line');
                    keyFragment.appendChild( blankLine );
                } else {
                    keyFragment.appendChild( keyElement );
                }
            });

            this.elements.keysContainer[type].appendChild( keyFragment );
            keyContainerFragment.appendChild( this.elements.keysContainer[type] );
        }

        return keyContainerFragment;
    },

    _cheonjiinInit(){
        this.properties.cIndex = 0;
        this.properties.beforeChar = '';
        this.properties.bufferValue = '';
        this.properties.value = '';
    },

    beforeCharReset(){
        Keyboard.properties.beforeChar = '';
    },

    _getCharCheonjiin( keyElement ) {
        let result = {
            char : "",
            mode : ""
        };

        if( this.properties.cheonjiinMapData[ keyElement.textContent ] !== undefined ){
            let charList = this.properties.cheonjiinMapData[ keyElement.textContent ];

            if( this.properties.cheonjiinMapData[ keyElement.textContent ].indexOf( this.properties.beforeChar ) === -1 ) {
                // 다른 버튼을 누른 경우
                this.properties.cIndex = 0;
                this.properties.beforeChar = charList[ this.properties.cIndex ];
                result.mode = "add";
            } else {
                // 같은 버튼을 누른 경우
                this.properties.cIndex = ( this.properties.cIndex === charList.length - 1 ) ? 0 : this.properties.cIndex + 1 ;
                this.properties.beforeChar = charList[ this.properties.cIndex ];
                result.mode = "replace";
            }
            
            result.char = this.properties.beforeChar;
        } else {
            this.properties.beforeChar = keyElement.textContent;
            result.char = this.properties.beforeChar;
            result.mode = "add";
        }
        return result;
        
    },

    /**
     * 
     * @param {string} char 입력할 문자
     * @param {string} mode "add" / "replace"(default)
     */
    _cheonjiinInputEvent(char, mode = "replace") {
        if( mode === "replace" ) {
            if( this.properties.beforeChar === '··') {
                this.properties.bufferValue = this.properties.bufferValue.substring(0, this.properties.bufferValue.length-2);
            } else {
                this.properties.bufferValue = this.properties.bufferValue.substring(0, this.properties.bufferValue.length-1);
            }
        }
        this.properties.beforeChar = char;
        this.properties.bufferValue += char;
        this.properties.value = Hangul.a( this.properties.bufferValue );
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
        this.properties.beforeChar = "";
        this.properties.bufferValue = "";
        this.properties.value = "";
        this.elements.main.classList.add("keyboard--hidden");
        this._cheonjiinInit();
    },

    debugger(){
        if(this.config.debugger){
            for(let key in this.properties)  console.log(key, this.properties[key]);
        }
    }

};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
