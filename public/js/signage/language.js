

function language(){
    let $main_home = $('#mainHome')
    let $main_search = $('#mainSearch')
    let $main_event = $('#mainEvent')
    let $main_guide = $('#mainGuide')
    let $foot_toilet = $('#footToilet')
    let $foot_elevator = $('#footElevator') 
    let $foot_escalator = $('#footEscalator')
    let $foot_exit = $('#footExit')
    let $foot_stockroom = $('#footStockroom')
    let $foot_stairs = $('#footStairs')
    let $dust_count = $('#dustCount')
//우측네비 
    //메인
    $main_home.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[0].ME_Kor)
    $main_home.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[0].ME_Eng)
    //검색
    $main_search.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[1].ME_Kor)
    $main_search.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[1].ME_Eng)
    //이벤트
    $main_event.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[2].ME_Kor)
    $main_event.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[2].ME_Eng)
    //이용안내
    $main_guide.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[3].ME_Kor)
    $main_guide.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[3].ME_Eng)
//하단 이용시설
    //화장실
    $foot_toilet.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[4].ME_Kor)
    $foot_toilet.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[4].ME_Eng)
    //엘리베이터
    $foot_elevator.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[5].ME_Kor)
    $foot_elevator.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[5].ME_Eng)
    //에스컬레이터
    $foot_escalator.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[6].ME_Kor)
    $foot_escalator.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[6].ME_Eng)
    //비상구
    $foot_exit.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[7].ME_Kor)
    $foot_exit.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[7].ME_Eng)
    //물품보관소
    $foot_stockroom.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[8].ME_Kor)
    $foot_stockroom.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[8].ME_Eng)
    //계단
    $foot_stairs.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[9].ME_Kor)
    $foot_stairs.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[9].ME_Eng)
    //미세먼지
    $dust_count.attr('data-Kor',JSON.parse(localStorage.getItem('language'))[14].ME_Kor)
    $dust_count.attr('data-Eng',JSON.parse(localStorage.getItem('language'))[14].ME_Eng)
}


language();