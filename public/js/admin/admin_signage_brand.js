
$(document).ready(function(){
    // //중복제거 브랜드 리스트
    // $.ajax({
    //     url: '/api/brandListOverLap',
    //     method: 'get',
    //     dataType: 'json',
    //     async : false,
    //     success: function(res){
    //         localStorage.setItem('brandList',JSON.stringify(res.data))
    //     }
    // })
    //대분류 카테고리
    $.ajax({
        url: '/api/categoryLV1',
        method: 'get',
        dataType: 'json',
        success: function(res){
            console.log('gooood');
            for(let i=0; i<res.data.length; i++){
                let html = "<option class='goodTest' id="+"lvOne"+res.data[i].BCR_LV1_BC_ID+">"+res.data[i].BC_NameKor+"</option>";
                $('#lv1_category').append(html)
            }
        }
    })
    //중분류
    $.ajax({
        url: '/api/categoryLV2',
        method: 'get',
        dataType: 'json',
        success: function(res){
            //카테고리 저장
            localStorage.setItem('catLV2',JSON.stringify(res.data))
        }
    })
    //층수
    $.ajax({
        url: '/api/floor',
        method: 'get',
        dataType: 'json',
        success: function(res){
            //카테고리 저장
            localStorage.setItem('floor',JSON.stringify(res.data))
        }
    })
    
    init();
}) 
function init(){

    // 신규모드로 실행
    objectInfo("new");
}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        ad_duration_start_instance = $(".object-info .ad_duration_start").dxDateBox("instance"),
        ad_duration_final_instance = $(".object-info .ad_duration_final").dxDateBox("instance");

    if( mode === "new"){
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');
        // todo : object reset
        $('.object-info #ad_id').text("");
        $('.object-info .ad_content_url').text("");
        $(".object-info .inputAdFiles").val('');
        $(".object-info .inputAdTitle").val('');
        $(".object-info .select2").val(null).trigger('change');
        ad_duration_start_instance.reset();
        ad_duration_final_instance.reset();

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        
        $('.object-info #ad_id').text(row_data.ad_id);
        $('.object-info .selectBrand').val(row_data.selectBrand).trigger('change');
        $('.object-info .ad_content_url').text(row_data.ad_content_url);
        $('.object-info .selectAdCategory').val(row_data.selectAdCategory).trigger('change');
        $('.object-info .selectAdType').val(row_data.selectAdType).trigger('change');
        $('.object-info .inputAdTitle').val(row_data.inputAdTitle);
        ad_duration_start_instance.option("value", row_data.ad_duration_start);
        ad_duration_final_instance.option("value", row_data.ad_duration_final);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/brandListOverLap",
        showBorders: true,
        renderAsync: true,
        allowColumnReordering: true,
        allowColumnResizing : true,
        columnResizingMode : "widget",
        cacheEnabled : true,
        columnAutoWidth : true,
        selection : {
            mode : "multiple",
            showCheckBoxesMode : "always" 
        },
        horverStateEnabled : true,
        pager: {
            showPageSizeSelector: true,
            allowedPageSizes: [5, 10, 20, 50, 100],
            showInfo: true
        },
        filterRow: {
            visible: true,
            applyFilter: "auto"
        },
        searchPanel: {
            visible: true,
            width: 240,
            placeholder: "Search..."
        },
        onSelectionChanged : function(e) {
            console.log('selection changed', e);
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.AD_ID));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            console.log('셀렉트');
        },
        onCellClick : function(e){
            console.log('cell click'.e);
        },
        // onCellHoverChanged : function(e){
        //     // setTimeout(2000,console.log('ID :', e.value))
        //     setTimeout(() => {
        //         if(e.columnIndex == 1){
        //             console.log('ID :', e.value);

                    
        //         }
        //     }, 2000);
        //     // console.log('ID :', e);
        // },

        onRowClick : function(e) {
            console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");
            // debugger;
            let row_data = {};
            row_data.ad_id = e.data.AD_ID;
            row_data.selectBrand = e.data.BS_ID;
            row_data.ad_content_url = e.data.AD_ContentURL;
            row_data.selectAdCategory = e.data.AD_BC_ID;
            row_data.selectAdType = e.data.AD_ADY_ID;
            row_data.inputAdTitle = e.data.AD_Title;
            row_data.ad_duration_start = e.data.AD_DtS;
            row_data.ad_duration_final = e.data.AD_DtF;

            objectInfo("modify", row_data);
        },
        headerFilter: {
            visible: true
        },
        export: {
            enabled: true,
            allowExportSelectedData: true
          },
          onExporting: function(e) {
            var workbook = new ExcelJS.Workbook();
            var worksheet = workbook.addWorksheet('광고관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '광고관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "BS_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "BS_LoginID", caption: "아이디"},
            { dataField: "BS_LoginPW", caption: "비밀번호"},
            { dataField: "BS_CEO", caption: "대표자명"},
            { dataField: "BS_NameKor", caption: "브랜드명"},
            { dataField: "BS_NameEng", caption: "브랜드명 영문"},
            { dataField: "BS_ContentsKor", caption: "매장 소개"},
            { dataField: "BS_ContentsEng", caption: "매장 소개 영문"},
            { dataField: "LS_Number", caption: "호실"},
            { dataField: "BC_NameKor", caption: "카테고리"},
            { dataField: "BS_Addr1Kor", caption: "도로명 주소"},
            { dataField: "BS_Addr2Kor", caption: "상세 주소"},
            { dataField: "BS_Addr1Eng", caption: "도로명 주소 영문"},
            { dataField: "BS_Addr2Eng", caption: "상세주소 영문"},
            { dataField: "BS_MainDtS", caption: "평일 영업시간 오픈"},
            { dataField: "BS_MainDtF", caption: "평일 영업시간 마감"},
            { dataField: "BS_SubDtS", caption: "주말 영업시간 오픈"},
            { dataField: "BS_SubDtF", caption: "주말 영업시간 마감"},
            { dataField: "BS_BreakDtS", caption: "휴식시간 시작"},
            { dataField: "BS_BreakDtF", caption: "휴식시간 종료"},
            { dataField: "BS_PersonalDayKor", caption: "휴일"},
            { dataField: "BS_PersonalDayEng", caption: "휴일 영문"},
            { dataField: "BS_ImageUrl", caption: "메인 이미지"},
            { dataField: "BS_ThumbnailUrl", caption: "썸네일"},
            { dataField: "BCR_ID", visible: false },
            { dataField: "BCR_LV1_BC_ID", visible: false },
            { dataField: "BCR_LV2_BC_ID", visible: false },
            { dataField: "BS_BC_ID", visible: false },
        ],
        // onSelectionChanged: function (selectedItems) {
        //     debugger;
        //     var data = selectedItems.selectedRowsData[0];
        //     console.log(selectedItems.selectedRowsData[0]);
        //     console.log('321321321321');
        //     console.log(selectedItems.selectedRowsData[5]);
            
        // },
        onContentReady: function(e) {
            let informer = e.element.find(".informer");
            informer.find(".totalCount").text(e.component.totalCount()+" 개");
        },
        onToolbarPreparing: function(e) {
            var dataGrid = e.component;
            e.toolbarOptions.items.unshift({
                location: "before",
                template: function(){
                    return $("<div/>")
                        .addClass("informer")
                        .append(
                            $("<span />")
                            .css("color", "#767676")
                            .text("검색 결과 "),
                           $("<strong />")
                             .addClass("totalCount")
                             .text("")
                        );
                }
            }, {
                location: "before",
                template: function(){
                    return $("<div/>")
                        .addClass("selectedActionBtns")
                        .append(
                            $("<div />")
                            .addClass("selectRowCount")
                            .text(""),
                            $("<div />")
                            .addClass("btn btn-delete py-0")
                            .text("삭제")
                            .attr("onClick", "deleteAD('multi')")
                        );
                }
            }, {
                location: "after",
                template: function(){
                    return $("<div/>")
                        .append(
                            $("<strong />")
                            .addClass("btn searchPopupBtn")
                            .text("상세검색")
                            .attr("onClick", "searchPopupShow()")
                        );
                }
            })
        }

    });
}


// 상세 검색창 설정
$(document).ready(()=>{
    let search_popup_element = $('.object-search-popup');
    search_popup_element.draggable({ handle: ".object-search-header" });
    let rect = document.querySelector("#mgmt-table").getBoundingClientRect();
    search_popup_element.css("left", "30px");
    search_popup_element.css("top", rect.top+'px');
});

// 검색창 초기화
function resetSearch() {
    $(".select2").val(null).trigger('change');
    let ad_duration_start_instance = $(".object-search-popup .ad_duration_start").dxDateBox("instance"),
    ad_duration_final_instance = $(".object-search-popup .ad_duration_final").dxDateBox("instance");
    ad_duration_start_instance.reset();
    ad_duration_final_instance.reset();
}


tableInit();
function saveAD(){

    let update_data = {
        bsBcId : $("#lv1_category option:selected").attr('id').replace(/lvOne/,''),
        bsBcId2 : $("#lv2_category option:selected").attr('id').replace(/lvTwo/,''),
        bsLoginId : $("#login_id").val(),
        bsLoginPw : $('#login_pw').val(),
        bsCeo : $("#ceo_name").val(),
        bsNameKo : $('#brand_ko').val(),
        bsNameEn : $('#brand_en').val(),
        bsContentsKo : $('#brand_contents_ko').val(),
        bsContentsEn : $('#brand_contents_en').val(),
        bsPhone : $('#brand_phone').val(),
        bsCeoPhone : $('#ceo_phone').val(),
        bsAddr1Ko : $('#address').val(), 
        bsAddr2Ko : $('#detailAddress').val(),
        bsAddr1En : $('#address_en').val(), 
        bsAddr2En : $('#detail_address_en').val(), 
        bsMainOpen : $('#main_open').val(),
        bsMainClose : $('#main_close').val(),
        bsSubOpen : $('#sub_open').val(),
        bsSubClose : $('#sub_close').val(),
        bsBreakOpen : $('#break_open').val(),
        bsBreakClose : $('#break_close').val(),
        bsPersonalKo : $('#personal_day_ko').val(),
        bsPersonalEn : $('#personal_day_en').val(),
        bsStoreNumber : $('#store_number').val()
    }



    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/tbs';
    $.ajax({
        dataType : 'JSON',
        type : "POST",
        url : api_url,
        data : form_data,
        contentType : false,
        processData : false,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            objectInfo('new');
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
}
function deleteAD(mode = 'single') {
    if(mode === 'single'){

        let id = JSON.parse( sessionStorage.getItem('row_data') ).ad_id;
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/ad/'+id,
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        });
    } else if(mode === "multi"){
        let id_list = {
            row_ids : sessionStorage.getItem('row_data_list')
        }
        
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            data : id_list,
            url : '/api/ad/',
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        });
    }
}
function updateAD(){
    let id = JSON.parse( sessionStorage.getItem('row_data') ).ad_id;
    let update_data = {
        adBsId : $(".object-info .selectBrand").val(),
        adAdyId : $(".object-info .selectAdType").val(),
        adBcId : $(".object-info .selectAdCategory").val(),
        adTitle : $(".object-info .inputAdTitle").val(),
        adDtS : $(".object-info .ad_duration_start").dxDateBox("instance").option().value,
        adDtF : $(".object-info .ad_duration_final").dxDateBox("instance").option().value
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/ad/'+id;

    $.ajax({
        dataType : 'JSON',
        type : "PUT",
        url : api_url,
        data : form_data,
        contentType : false,
        processData : false,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
}
function clickActionBtn(e){
    if( $(e.target).hasClass('disabled') ) return false;

    if(e.target.getAttribute('name') == "modify"){
        updateAD();
    } else if(e.target.getAttribute('name') == "save"){
        saveAD();
    }
}

$(".action-btns .btn").click(clickActionBtn);

// 상세 검색 버튼 기능
// 초기화
function searchPopupReset(){
    $("#object-search-popup .select2").val(null).trigger('change');
    let ad_duration_start_instance = $("#object-search-popup .ad_duration_start").dxDateBox("instance"),
    ad_duration_final_instance = $("#object-search-popup .ad_duration_final").dxDateBox("instance");
    ad_duration_start_instance.reset();
    ad_duration_final_instance.reset();
    $("#object-search-popup .inputAdTitle").val('');
}
// 닫기
function searchPopupClose() {
    $("#object-search-popup").hide();
}
function searchPopupShow() {
    $("#object-search-popup").show();
}
// 검색
function searchPopupAction() {
    let condition_data = {
        searchType : $("#object_search_info #searchType").is(":checked"),
        adBsId : $("#object_search_info .selectBrand").val(),
        adAdyId : $("#object_search_info .selectAdType").val(),
        adBcId : $("#object_search_info .selectAdCategory").val(),
        adTitle : $("#object_search_info .inputAdTitle").val(),
        adDtS : $("#object_search_info .ad_duration_start").dxDateBox("instance").option().value,
        adDtF : $("#object_search_info .ad_duration_final").dxDateBox("instance").option().value
    };

    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/ad',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}

//상세정보 토글

function folding(){
    console.log($('#folding').text());
    if($('#folding').text() == 'ㅡ'){
        $('#folding').text('+')
    }else{
        $('#folding').text('ㅡ')
    }
    $('#object_detail_group').slideToggle('fast')
}

//대분류 카테고리
function LV1Cat(e){     
    lv1Cat = e.id.replace(/lvOne/,'')
    let catLv1Id = e.id.replace(/lvOne/,'')
    let searchCatLV2 = JSON.parse(localStorage.getItem('catLV2'))    
    // $('#LV2Cat').empty()
    console.log('click');
    for(let i=0; i<searchCatLV2.length; i++){
        // console.log(searchCatLV2)
        if(searchCatLV2[i].BCR_LV1_BC_ID == catLv1Id){
            let resultCatLV2 = new Array();
            let jsonCatLV2 = new Object();
            jsonCatLV2 = searchCatLV2[i]
            resultCatLV2.push(jsonCatLV2)
            for(let j=0; j<resultCatLV2.length; j++){
                // let html = "<div onclick='LV2Cat(this)' id="+"lvTwo"+resultCatLV2[j].BC_ID+">";
                //     html += "<input type='radio' id="+"lv2"+resultCatLV2[j].BC_ID+" name='catLv2' value="+resultCatLV2[j].BC_ID+">"
                //     html += "<label for="+"lv2"+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</label>"
                //     html += "</div>"
                // $('#LV2Cat').append(html);

                let html = "<option id="+"lvTwo"+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</option>";
                $('#lv2_category').append(html)

            }
        }
    }
}

//대분류 선택시 중분류 리스트
$('#lv1_category').click(function () {
    let searchCatLV2 = JSON.parse(localStorage.getItem('catLV2'))    
    $('.midCat').remove();
    let catLv1Id = $("#lv1_category option:selected").attr('id').replace(/lvOne/,'')
    for(let i=0; i<searchCatLV2.length; i++){
        // console.log(searchCatLV2)
        if(searchCatLV2[i].BCR_LV1_BC_ID == catLv1Id){
            let resultCatLV2 = new Array();
            let jsonCatLV2 = new Object();
            jsonCatLV2 = searchCatLV2[i]
            resultCatLV2.push(jsonCatLV2)
            for(let j=0; j<resultCatLV2.length; j++){
                let html = "<option class='midCat' id="+"lvTwo"+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</option>";
                $('#lv2_category').append(html)
            }
        }
    }
})

//층수 선택
$('#floor').click(function(){
    let floor_id = $("#floor option:selected").attr('id')
    $('.storeNumber').remove();
    let floorStatus = JSON.parse(localStorage.getItem('floor'))
    console.log(floor_id,'아이디');
    for(let i=0; i<floorStatus.length; i++){
        if(floorStatus[i].LS_Floor == floor_id){
            let html = "<option class='storeNumber' id="+"floor"+floorStatus[i].LS_Number+">"+floorStatus[i].LS_Number+"</option>";
            $('#store_number').append(html)

        }
    }
})

// function selectFloor(e){
//     $('#storeNum').empty();
//     let floorStatus = JSON.parse(localStorage.getItem('floor'))
//     console.log($(e).children('input').attr('id'))
//     for(let i=0; i<floorStatus.length; i++){
//         console.log(floorStatus[i].LS_Floor);
//         if(floorStatus[i].LS_Floor == $(e).children('input').attr('id')){
//             let html = "<div onclick='selectStoreNumber(this)'>";
//                 html += "<input type='radio' id="+floorStatus[i].LS_Number+" name='storeNumber' value="+floorStatus[i].LS_Number+">"
//                 html += "<label for="+floorStatus[i].LS_Number+">"+floorStatus[i].LS_Number+"</label>"
//                 html += "</div>"
//             $('#storeNum').append(html)
//         }
//     }
// }