

function language(){
//우측네비 
    //메인
    $('#mainHome').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[0].ME_Kor)
    $('#mainHome').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[0].ME_Eng)
    //검색
    $('#mainSearch').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[1].ME_Kor)
    $('#mainSearch').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[1].ME_Eng)
    //이벤트
    $('#mainEvent').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[2].ME_Kor)
    $('#mainEvent').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[2].ME_Eng)
    //이용안내
    $('#mainGuide').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[3].ME_Kor)
    $('#mainGuide').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[3].ME_Eng)
//하단 이용시설
    //화장실
    $('#footToilet').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[4].ME_Kor)
    $('#footToilet').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[4].ME_Eng)
    //엘리베이터
    $('#footElevator').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[5].ME_Kor)
    $('#footElevator').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[5].ME_Eng)
    //에스컬레이터
    $('#footEscalator').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[6].ME_Kor)
    $('#footEscalator').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[6].ME_Eng)
    //비상구
    $('#footExit').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[7].ME_Kor)
    $('#footExit').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[7].ME_Eng)
    //물품보관소
    $('#footStockroom').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[8].ME_Kor)
    $('#footStockroom').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[8].ME_Eng)
    //계단
    $('#footStairs').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[9].ME_Kor)
    $('#footStairs').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[9].ME_Eng)
    //미세먼지
    $('#dustCount').attr('data-Kor',JSON.parse(localStorage.getItem('language'))[14].ME_Kor)
    $('#dustCount').attr('data-Eng',JSON.parse(localStorage.getItem('language'))[14].ME_Eng)
}


language();