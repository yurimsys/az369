//let jsonBrand = JSON.parse(localStorage.getItem('brandList'))
let jsonBrand = JSON.parse(localStorage.getItem('brandListOverLap'))
//console.log(jsonBrand.BS_NameKor)
let arr = []
let arr2 = []
// let nameData = new Object();
let nameEng = new Object();
for (let i = 0; i < jsonBrand.length; i++) {
    arr2.push(jsonBrand[i].BS_NameKor, jsonBrand[i].BS_NameEng)
}

for (let j = 0; j < arr2.length; j++) {
    let nameData = new Object();
    nameData.name = arr2[j]
    arr.push(nameData)
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


//검색창 값 입력시 초기화 버튼 생성
// document.getElementById('searchBrandName').addEventListener('input', function (){
//     if($(this).val() !== ''){
//         $('.searchCancel').css('display','block')
//     }else{
//         $('.searchCancel').css('display','none')
//     }
// })

let searchResult = new Array();
// 검색창 값 입력 이벤트 처리
$('#searchBrandName').bind('input', function (e) {
    // $('.keyboard').css('display','block');
    // 검색창 reset 버튼 노출
    if (e.target.value != '') {
        $('.searchCancel').css('display', 'block')
    } else {
        $('.searchCancel').css('display', 'none')
    }

    // 검색 필터
    let allText = e.target.value;
    let korText = Hangul.disassemble(allText).join("");  // ㄺ=>ㄹㄱ
    if (allText === '') {
        $('.searchResult').empty();
        searchBrandList();
        return false;
    }

    searchResult = [];
    // 문자열 검색 || 초성검색
    arr
    .filter(function (item) {
        return item.name.includes(allText) || item.diassembled.includes(korText);
    })
    // 검색결과 ul 아래에 li 로 추가
    .forEach(function (item) {
        let searchJson = new Object();
        searchJson.name = item.name
        searchResult.push(searchJson)
    });
    $('.searchResult').empty();

    let html = "";
    for (let i = 0; i < jsonBrand.length; i++) {
        let lanType1 = $('#eng').hasClass('choose') ? jsonBrand[i].BS_NameKor : jsonBrand[i].BS_NameEng;
        let lanType2 = $('#eng').hasClass('choose') ? jsonBrand[i].BC_NameKor : jsonBrand[i].BC_NameEng; 
        let searchResult_length = searchResult.length;
        
        for (let j = 0; j < searchResult_length; j++) {
            if (jsonBrand[i].BS_NameKor === searchResult[j].name || jsonBrand[i].BS_NameEng === searchResult[j].name) {
                html += "<div class='brandList' id=" + jsonBrand[i].BS_ID + " onclick='brandClick(this)' data-lv1CategoryId=" + jsonBrand[i].BCR_LV1_BC_ID + "><div class='categoryImg_wrap'><div class='categoryImg'><img src=" + jsonBrand[i].BS_ThumbnailUrl + "></div></div>";
                html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
                html += "<ul><li><div class='searchBrand'>" + lanType1 + "</div>";
                html += "<h4 class='searchLocation'>" + jsonBrand[i].LS_Floor + ".<span class='searchLocation'>" + lanType2 + "</span></h4><div class='searchTime'>영업시간 " + jsonBrand[i].BS_MainDtS.substring(0, 5) + " ~ " + jsonBrand[i].BS_MainDtF.substring(0, 5) + "</div></li></ul></div>";
            }
        }
    }
    $('.searchResult').append(html);
});



//검색 버튼
// function search(){
//     let allText = document.getElementById('searchBrandName').value;
//     if(allText === ''){
//         searchBrandList();
//         return false;
//     }
//     // let search = (find_string !== '') ? find_string : document.getElementById('searchBrandName').value;
//     let korText = Hangul.disassemble(allText).join("");  // ㄺ=>ㄹㄱ
//     searchResult = [];
//     arr
//     // 문자열 검색 || 초성검색
//     .filter(function (item) {
//         return item.name.includes(allText) || item.diassembled.includes(korText);
//     })
//     .forEach(function (item) {
//         let searchJson = new Object();
//         searchJson.name = item.name
//         searchResult.push(searchJson)
//         console.log(searchResult);
//     });
//     $('.searchResult').empty();
//     for(let i=0; i<jsonBrand.length; i++){

//         let lanType1 = $('#kor').hasClass('choose') ? jsonBrand[i].BS_NameKor : jsonBrand[i].BS_NameEng
//         let lanType2 = $('#kor').hasClass('choose') ? jsonBrand[i].BC_NameKor : jsonBrand[i].BC_NameEng

//         for(let j=0; j<searchResult.length; j++){
//             if( jsonBrand[i].BS_NameKor === searchResult[j].name || jsonBrand[i].BS_NameEng === searchResult[j].name){
//                 let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+jsonBrand[i].BCR_LV1_BC_ID+"><div class='categoryImg_wrap'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div></div>";
//                     html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
//                     html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
//                     html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+lanType2+"</span></h4><div class='searchTime'>영업시간 "+jsonBrand[i].BS_MainDtS.substring(0,5)+" ~ "+jsonBrand[i].BS_MainDtF.substring(0,5)+"</div></li></ul>";
//                 $('.searchResult').append(html)
//             }
//         }
//     }
// }

//검색 필터
// document.getElementById('searchBrandName').addEventListener('keyup', function () {
//     let allText =  document.getElementById('searchBrandName').value;
//     let korText = Hangul.disassemble(allText).join("");  // ㄺ=>ㄹㄱ
//     if(allText === ''){
//         $('.searchResult').empty();
//         searchBrandList();
//         return false;
//     }

//     searchResult = [];
//     arr
//     // 문자열 검색 || 초성검색
//     .filter(function (item) {
//         console.log(item);
//         return item.name.includes(allText) || item.diassembled.includes(korText);
//     })
//     // 검색결과 ul 아래에 li 로 추가
//     .forEach(function (item) {
//         let searchJson = new Object();
//         searchJson.name = item.name
//         searchResult.push(searchJson)
//     });
//     $('.searchResult').empty();
//     for(let i=0; i<jsonBrand.length; i++){
//         let lanType1 = $('#kor').hasClass('choose') ? jsonBrand[i].BS_NameKor : jsonBrand[i].BS_NameEng
//         let lanType2 = $('#kor').hasClass('choose') ? jsonBrand[i].BC_NameKor : jsonBrand[i].BC_NameEng

//         for(let j=0; j<searchResult.length; j++){
//             if( jsonBrand[i].BS_NameKor === searchResult[j].name || jsonBrand[i].BS_NameEng === searchResult[j].name){
//                 let html = "<div class='brandList' id="+jsonBrand[i].BS_ID+" onclick='brandClick(this)' data-lv1CategoryId="+jsonBrand[i].BCR_LV1_BC_ID+"><div class='categoryImg_wrap'><div class='categoryImg'><img src="+jsonBrand[i].BS_ThumbnailUrl+"></div></div>";
//                     html += '<input type="checkbox" name="searchCategoryList" class="searchCheck">'
//                     html += "<ul><li><div class='searchBrand'>"+lanType1+"</div>";
//                     html += "<h4 class='searchLocation'>"+jsonBrand[i].LS_Floor+".<span class='searchLocation'>"+lanType2+"</span></h4><div class='searchTime'>영업시간 "+jsonBrand[i].BS_MainDtS.substring(0,5)+" ~ "+jsonBrand[i].BS_MainDtF.substring(0,5)+"</div></li></ul>";
//                 $('.searchResult').append(html)
//             }
//         }
//     }
// });

//검색창 초기화
function searchCancel() {
    searchBrandList();
    $('.searchCancel').css('display', 'none')
    $('#searchBrandName').val('')
    Keyboard._cheonjiinInit();
    console.log('실행');
}