
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
            for(let i=0; i<res.data.length; i++){
                let html = "<option class='goodTest' id="+"lvOne"+res.data[i].BCR_LV1_BC_ID+" value="+res.data[i].BCR_LV1_BC_ID+">"+res.data[i].BC_NameKor+"</option>";
                $('#lv1_category').append(html)
                $('#search_lv1_category').append(html)
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
    // 광고기간 DateBox
    $(".main_open, .main_close, .sub_open, .sub_close, .break_open, .break_close, .search_main_open, .search_main_close, .search_sub_open, .search_sub_close, .search_break_open, .search_break_close").dxDateBox({
        type: "time",
        displayFormat: 'HH:mm',
        dateSerializationFormat : "HH:mm",
    });

    // 신규모드로 실행
    objectInfo("new");
}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        main_open_instance = $(".object-info .main_open").dxDateBox("instance"),
        main_close_instance = $(".object-info .main_close").dxDateBox("instance"),
        sub_open_instance = $(".object-info .sub_open").dxDateBox("instance"),
        sub_close_instance = $(".object-info .sub_close").dxDateBox("instance"),
        break_open_instance = $(".object-info .break_open").dxDateBox("instance"),
        break_close_instance = $(".object-info .break_close").dxDateBox("instance");

    if( mode === "new"){
        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#login_id').val('');
        $('#login_pw').val('');
        $('#ceo_name').val('');
        $('#ceo_phone').val('');
        $("#lv1_category").val('null');
        $("#lv2_category").val('null');
        $('#floor').val('null');
        $('#store_number').val('null');
        $('#brand_ko').val('');
        $('#brand_en').val('');
        $('#brand_contents_ko').val('');
        $('#brand_contents_en').val('');
        $('#brand_phone').val('');
        $('#address').val('');
        $('#detailAddress').val('');
        $('#address_en').val('');
        $('#detail_address_en').val('');
        $('#personal_day_ko').val('');
        $('#personal_day_en').val('');
        $('#img_url').text('');
        $('#tumb_url').text('');
        main_open_instance.reset()
        main_close_instance.reset()
        sub_open_instance.reset() 
        sub_close_instance.reset() 
        break_open_instance.reset() 
        break_close_instance.reset()

        // ad_duration_start_instance.reset();
        // ad_duration_final_instance.reset();

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        // console.log(row_data.login_id);
        $('#login_id').val(row_data.login_id);
        $('#login_pw').val(row_data.login_pw);
        $('#ceo_name').val(row_data.ceo_name);
        $('#ceo_phone').val(row_data.ceo_phone);
        $("#lv1_category").val(row_data.lv1_category).trigger('click');
        $("#lv2_category").val(row_data.lv2_category);
        $('#floor').val(row_data.floor).trigger('click');
        $('#store_number').val(row_data.store_number);
        $('#brand_ko').val(row_data.brand_ko);
        $('#brand_en').val(row_data.brand_en);
        $('#brand_contents_ko').val(row_data.brand_contents_ko);
        $('#brand_contents_en').val(row_data.brand_contents_en);
        $('#brand_phone').val(row_data.brand_phone);
        $('#address').val(row_data.address);
        $('#detailAddress').val(row_data.detailAddress);
        $('#address_en').val(row_data.address_en);
        $('#detail_address_en').val(row_data.detail_address_en);
        $('#personal_day_ko').val(row_data.personal_day_ko);
        $('#personal_day_en').val(row_data.personal_day_en);
        $('#img_url').text(row_data.img_url)
        $('#tumb_url').text(row_data.tumb_url)
        
        main_open_instance.option("value", row_data.main_open);
        main_close_instance.option("value", row_data.main_close); 
        sub_open_instance.option("value", row_data.sub_open); 
        sub_close_instance.option("value", row_data.sub_close);
        break_open_instance.option("value", row_data.break_open); 
        break_close_instance.option("value", row_data.break_close);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
        var chtest = true;
        $('#brand_ko').change(function(){
            chtest = false;
        });

        if(chtest == false){
            alert('변경')
        }
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.BS_ID));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
        },
        onCellClick : function(e){
            console.log('cell click'.e);
        },
        // onCellHoverChanged : function(e){
            
        //     if(e.rowType == 'data'){
                
        //         let testC = e.cellElement.parent()[0]
        //         console.log(testC);
        //         $(testC).addClass('data_hover')
                
        //     }
        //     setTimeout(() => {
        //         if(e.columnIndex == 1){
        //             console.log('ID :', e);

                    
        //         }
        //     }, 2000);
        //     // console.log('ID :', e);
        //     // setTimeout(2000,$(testC).removeClass('data_hover'));
        // },

        onRowHoverChanged : function(e){
            console.log('성공?');
        },

        onRowClick : function(e) {
            // console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");

            let row_data = {};
            row_data.bs_id = e.data.BS_ID
            row_data.login_id = e.data.BS_LoginID;
            row_data.login_pw = e.data.BS_LoginPW;
            row_data.ceo_name = e.data.BS_CEO;
            row_data.ceo_phone = e.data.BS_CEOPhone;
            row_data.lv1_category = e.data.BCR_LV1_BC_ID;
            row_data.lv2_category = e.data.BCR_LV2_BC_ID;
            row_data.floor = e.data.LS_Floor;
            row_data.store_number = e.data.LS_Number;
            row_data.brand_ko = e.data.BS_NameKor;
            row_data.brand_en = e.data.BS_NameEng;
            row_data.brand_contents_ko = e.data.BS_ContentsKor;
            row_data.brand_contents_en = e.data.BS_ContentsEng;
            row_data.brand_phone = e.data.BS_Phone;
            row_data.address = e.data.BS_Addr1Kor;
            row_data.detailAddress = e.data.BS_Addr2Kor;
            row_data.address_en = e.data.BS_Addr1Eng;
            row_data.detail_address_en = e.data.BS_Addr2Eng;
            row_data.main_open = e.data.BS_MainDtS;
            row_data.main_close = e.data.BS_MainDtF;
            row_data.sub_open = e.data.BS_SubDtS;
            row_data.sub_close = e.data.BS_SubDtF;
            row_data.break_open = e.data.BS_BreakDtS;
            row_data.break_close = e.data.BS_BreakDtF;
            row_data.personal_day_ko = e.data.BS_PersonalDayKor;
            row_data.personal_day_en = e.data.BS_PersonalDayEng;
            row_data.img_url = e.data.BS_ImageUrl;
            row_data.tumb_url = e.data.BS_ThumbnailUrl;
            if($('.brand_info').css('display') == 'none'){
                folding();
            }
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
            var worksheet = workbook.addWorksheet('매장관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '매장관리.xlsx');
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
            { dataField: "BS_NameKor", caption: "매장명"},
            { dataField: "BS_NameEng", caption: "매장명 영문"},
            { dataField: "BS_ContentsKor", caption: "매장 소개"},
            { dataField: "BS_ContentsEng", caption: "매장 소개 영문"},
            { dataField: "BS_CEOPhone", caption: "CEO 번호"},
            { dataField: "BS_Phone", caption: "매장번호"},
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
            { dataField: "LS_Floor", visible: false },
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
    // $(".select2").val(null).trigger('change');
    // let ad_duration_start_instance = $(".object-search-popup .ad_duration_start").dxDateBox("instance"),
    // ad_duration_final_instance = $(".object-search-popup .ad_duration_final").dxDateBox("instance");
    // ad_duration_start_instance.reset();
    // ad_duration_final_instance.reset();
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
        bsMainOpen : $(".object-info .main_open").dxDateBox("instance").option().value,
        bsMainClose : $(".object-info .main_close").dxDateBox("instance").option().value,
        bsSubOpen : $(".object-info .sub_open").dxDateBox("instance").option().value,
        bsSubClose : $(".object-info .sub_close").dxDateBox("instance").option().value,
        bsBreakOpen : $(".object-info .break_open").dxDateBox("instance").option().value,
        bsBreakClose : $(".object-info .break_close").dxDateBox("instance").option().value,
        bsPersonalKo : $('#personal_day_ko').val(),
        bsPersonalEn : $('#personal_day_en').val(),
        bsStoreNumber : $('#store_number').val()
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);
  
    console.log('log!!',form_data);
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).bs_id;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/tbs/'+id,
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
        console.log(id_list,'삭제 아이디들');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            data : id_list,
            url : '/api/tbs/',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).bs_id;
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
        bsMainOpen : $(".object-info .main_open").dxDateBox("instance").option().value,
        bsMainClose : $(".object-info .main_close").dxDateBox("instance").option().value,
        bsSubOpen : $(".object-info .sub_open").dxDateBox("instance").option().value,
        bsSubClose : $(".object-info .sub_close").dxDateBox("instance").option().value,
        bsBreakOpen : $(".object-info .break_open").dxDateBox("instance").option().value,
        bsBreakClose : $(".object-info .break_close").dxDateBox("instance").option().value,
        bsPersonalKo : $('#personal_day_ko').val(),
        bsPersonalEn : $('#personal_day_en').val(),
        bsStoreNumber : $('#store_number').val(),
        bsImgUrl : JSON.parse( sessionStorage.getItem('row_data') ).img_url.replace(/\/img/,'').replace(/\//,''),
        bsTumbUrl : JSON.parse( sessionStorage.getItem('row_data') ).tumb_url.replace(/\/img/,'').replace(/\//,'')
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/tbs/'+id;

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
    console.log('e',e.target);
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
    let action_btns_instance = $(".object-search-popup .action-btns"),
    search_main_open_instance = $(".object-search-popup .search_main_open").dxDateBox("instance"),
    search_main_close_instance = $(".object-search-popup .search_main_close").dxDateBox("instance"),
    search_sub_open_instance = $(".object-search-popup .search_sub_open").dxDateBox("instance"),
    search_sub_close_instance = $(".object-search-popup .search_sub_close").dxDateBox("instance"),
    search_break_open_instance = $(".object-search-popup .search_break_open").dxDateBox("instance"),
    search_break_close_instance = $(".object-search-popup .search_break_close").dxDateBox("instance");


    $('#search_login_id').val('');
    $('#search_login_pw').val('');
    $('#search_ceo_name').val('');
    $('#search_ceo_phone').val('');
    $("#search_lv1_category").val('null');
    $("#search_lv2_category").val('null');
    $('#search_floor').val('null');
    $('#search_store_number').val('null');
    $('#search_brand_ko').val('');
    $('#search_brand_contents_ko').val('');
    $('#search_brand_contents_en').val('');
    $('#search_brand_phone').val('');
    $('#search_address').val('');
    $('#search_detailAddress').val('');
    search_main_open_instance.reset();
    search_main_close_instance.reset();
    search_sub_open_instance.reset();
    search_sub_close_instance.reset();
    search_break_open_instance.reset();
    search_break_close_instance.reset(); 

    $('#search_personal_day_ko').val('');
}
// 닫기
function searchPopupClose() {
    $("#object-search-popup").hide();
}0
function searchPopupShow() {
    $('#object-search-popup').css('left','430px')
    $('#object-search-popup').css('top','300px')
    $("#object-search-popup").show();
}

// 검색
function searchPopupAction() {
    
    let condition_data = {
        searchType : $("#object_search_info #searchType").is(":checked"),
        bsLoginId : $("#search_login_id").val(),
        bsCeo : $("#search_ceo_name").val(),
        bsCeoPhone : $('#search_ceo_phone').val(),
        bsBcId : $("#search_lv1_category").val(),
        bsBcId2 : $("#search_lv2_category").val(),
        bsStoreNumber : $('#search_store_number').val(),
        bsFloor : $('#search_floor').val(),
        bsNameKo : $('#search_brand_ko').val(),
        bsContentsKo : $('#search_brand_contents_ko').val(),
        bsPhone : $('#search_brand_phone').val(),
        bsAddr1Ko : $('#search_address').val(), 
        bsAddr2Ko : $('#search_detailAddress').val(),
        bsMainOpen : $(".object-search-popup .search_main_open").dxDateBox("instance").option().value,
        bsMainClose : $(".object-search-popup .search_main_close").dxDateBox("instance").option().value,
        bsSubOpen : $(".object-search-popup .search_sub_open").dxDateBox("instance").option().value,
        bsSubClose : $(".object-search-popup .search_sub_close").dxDateBox("instance").option().value,
        bsBreakOpen : $(".object-search-popup .search_break_open").dxDateBox("instance").option().value,
        bsBreakClose : $(".object-search-popup .search_break_close").dxDateBox("instance").option().value,
        bsPersonalKo : $('#search_personal_day_ko').val(),
        
    };
    console.log(condition_data);
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/brandListOverLap?type=search',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
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
                let html = "<option id="+"lvTwo"+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</option>";
                $('#lv2_category').append(html)

            }
        }
    }
}

//대분류 선택시 중분류 리스트
$('#lv1_category, #search_lv1_category').click(function (event) {
    let searchCatLV2 = JSON.parse(localStorage.getItem('catLV2'))    

    if(event.target.id == 'lv1_category'){
        $('.midCat').remove();
        let catLv1Id = $("#lv1_category option:selected").attr('id').replace(/lvOne/,'')
        for(let i=0; i<searchCatLV2.length; i++){
            if(searchCatLV2[i].BCR_LV1_BC_ID == catLv1Id){
                let resultCatLV2 = new Array();
                let jsonCatLV2 = new Object();
                jsonCatLV2 = searchCatLV2[i]
                resultCatLV2.push(jsonCatLV2)
                for(let j=0; j<resultCatLV2.length; j++){
                    let html = "<option class='midCat' id="+"lvTwo"+resultCatLV2[j].BC_ID+" value="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</option>";
                    $('#lv2_category').append(html)
                }
            }
        }
    }else{
        $('.search_midCat').remove();
        let catLv1Id = $("#search_lv1_category option:selected").attr('id').replace(/lvOne/,'')
        for(let i=0; i<searchCatLV2.length; i++){
            if(searchCatLV2[i].BCR_LV1_BC_ID == catLv1Id){
                
                let resultCatLV2 = new Array();
                let jsonCatLV2 = new Object();
                jsonCatLV2 = searchCatLV2[i]
                resultCatLV2.push(jsonCatLV2)
                for(let j=0; j<resultCatLV2.length; j++){
                    let html = "<option class='search_midCat' id="+"lvTwo"+resultCatLV2[j].BC_ID+" value="+resultCatLV2[j].BC_ID+">"+resultCatLV2[j].BC_NameKor+"</option>";
                    $('#search_lv2_category').append(html)
                }
            }
        }
    }

})

//층수 선택
$('#floor, #search_floor').click(function(event){
    let floorStatus = JSON.parse(localStorage.getItem('floor'))

    if(event.target.id == 'floor'){
        let floor_id = $("#floor option:selected").attr('id')
        $('.storeNumber').remove();
        
        for(let i=0; i<floorStatus.length; i++){
            if(floorStatus[i].LS_Floor == floor_id){
                let html = "<option class='storeNumber' id="+"floor"+floorStatus[i].LS_Number+">"+floorStatus[i].LS_Number+"</option>";
                $('#store_number').append(html)
                $('#search_store_number').append(html)
    
            }
        }
    }else{
        let floor_id = $("#search_floor option:selected").attr('id')
        $('.search_storeNumber').remove();
        
        for(let i=0; i<floorStatus.length; i++){
            if(floorStatus[i].LS_Floor == floor_id){
                let html = "<option class='search_storeNumber' id="+"floor"+floorStatus[i].LS_Number+">"+floorStatus[i].LS_Number+"</option>";
                $('#search_store_number').append(html)
            }
        }
    }



})
