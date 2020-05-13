//let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
//console.log(jsonBrand.BS_NameKor)
    let arr = []
    let arr2 = []
    // let nameData = new Object();
    let nameEng = new Object();
    for(let i=0; i<jsonBrand.length; i++){
        //arr2.push(jsonBrand[i].BS_NameKor,jsonBrand[i].BS_NameEng)
        arr2.push(jsonBrand[i].BS_NameKor,jsonBrand[i].BS_NameEng)
    }

    for(let j=0; j<arr2.length; j++){
        let nameData = new Object();
        nameData.name = arr2[j]
        //console.log(arr2[j])
        arr.push(nameData)
        //console.log('배열뱌열',arr)    
    } 
        // object 에 초성필드 추가 {name:"홍길동", diassembled:"ㅎㄱㄷ"}
        arr.forEach(function (item) {
            let dis = Hangul.disassemble(item.name, true);
            let cho = dis.reduce(function (prev, elem) {
                elem = elem[0] ? elem[0] : elem;
                return prev + elem;
            }, "");
            item.diassembled = cho;
        });
        
        
        let searchResult = new Array();
        function search(){
            let search = document.getElementById('searchBrandName').value;
            // let search = (find_string !== '') ? find_string : document.getElementById('searchBrandName').value;
            let search1 = Hangul.disassemble(search).join("");  // ㄺ=>ㄹㄱ
            searchResult = [];
            arr
            // 문자열 검색 || 초성검색
            .filter(function (item) {
                return item.name.includes(search) || item.diassembled.includes(search1);
            })
            .forEach(function (item) {
                let searchJson = new Object();
                searchJson.name = item.name
                searchResult.push(searchJson)
                //console.log(searchResult,'dd')
            });
             $('.searchResult').empty();
             for(let i=0; i<jsonBrand.length; i++){
                
                if($('#kor').hasClass('choose')){
                    for(let j=0; j<searchResult.length; j++){
                        if( jsonBrand[i].BS_NameKor === searchResult[j].name || jsonBrand[i].BS_NameEng === searchResult[j].name){
                            console.log(jsonBrand[i].BS_NameKor)
                            let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                                html += "<ul><li><div class='searchBrand'>"+jsonBrand[i].BS_NameKor+"</div>";
                                html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+jsonBrand[i].BC_NameKor+"</span></h4><div class='searchTime'>영업시간 "+openTime+" ~ "+endTime+"</div></li></ul>";
                                html += "<hr class='searchLine'></div>"
                            $('.searchResult').append(html)
                        }
                    }
                }
                else if($('#eng').hasClass('choose')){
                    for(let j=0; j<searchResult.length; j++){
                        if( jsonBrand[i].BS_NameEng === searchResult[j].name || jsonBrand[i].BS_NameEng === searchResult[j].name){
                            let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div>";
                                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                                html += "<ul><li><div class='searchBrand'>"+jsonBrand[i].BS_NameEng+"</div>";
                                html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+jsonBrand[i].BC_NameEng+"</span></h4><div class='searchTime'>OpenTime "+openTime+" ~ "+endTime+"</div></li></ul>";
                                html += "<hr class='searchLine'></div>"
                            $('.searchResult').append(html)
                        }
                    }
                }
            }
        }