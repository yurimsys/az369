

$(document).ready(function(){
    init();
}) 
function init(){
    // 브랜드 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/bsList",
        success: function (res){
            
            let brand_list = res.data.map((data) =>{
                return { id : data.BS_ID, text : data.BS_NameKor}
            });
            // console.log('brsan', brand_list);
            $(".selectBrand").select2(
                {
                    placeholder: '브랜드 선택',
                    data: brand_list,
                    width: 'resolve'
                }
            );
        }
    })
    
    // 광고업종 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/categoryLV1",
        success: function (res){
            let categoryLV1 = res.data.map((data) =>{
                return { id : data.BCR_LV1_BC_ID, text : data.BC_NameKor}
            });

            $('.selectAdCategory').select2(
                {
                    placeholder: '업종 선택',
                    data: categoryLV1,
                    width: 'resolve'
                }
            );
        }
    });
    
    // 광고위치 Data Load
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/adtype",
        success: function (res){           
            let adtype = res.data.map((data) =>{
                return { id : data.ADY_ID, text : data.ADY_Location}
            });

            $('.selectAdType').select2(
                {
                    placeholder: '위치 선택',
                    data: adtype,
                    width: 'resolve'
                }
            );
        }
    });

    // 광고기간 DateBox
    $(".ad_duration_start, .ad_duration_final").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd",
    });

    // 신규모드로 실행
    objectInfo("new");
}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        ad_duration_start_instance = $(".object-info .ad_duration_start").dxDateBox("instance"),
        ad_duration_final_instance = $(".object-info .ad_duration_final").dxDateBox("instance");

    if( mode === "new"){
        if($('#object_detail_group').css('display') == 'none'){
            folding();
        }
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
        dataSource: "/api/ad",
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
        //셀 호버 이벤트
        // onCellHoverChanged : function(e){
        //     setTimeout(2000,console.log('ID :', e.value))
        //     setTimeout(() => {
        //         if(e.columnIndex == 1){
        //             console.log('ID :', e.value);

                    
        //         }
        //     }, 2000);
        //     // console.log('ID :', e);
        // },

        onRowClick : function(e) {
            // console.log('row click', e.data);
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
            if($('#object_detail_group').css('display') == 'none'){
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
            { dataField: "AD_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "BS_NameKor", caption: "브랜드"},
            { dataField: "BC_NameKor", caption: "광고업종"},
            { dataField: "ADY_Location", caption: "광고위치"},
            { dataField: "AD_Title", caption: "광고제목"},
            { dataField: "AD_ContentURL", caption: "URL"},
            { dataField: "AD_DtS", caption: "광고시작일", dataType: "date"},
            { dataField: "AD_DtF", caption: "광고종료일", dataType: "date"},
            { dataField: "AD_BC_ID", visible: false },
            { dataField: "BS_ID", visible: false },
            { dataField: "AD_ADY_ID", visible: false },
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
        adBsId : $(".object-info .selectBrand").val(),
        adAdyId : $(".object-info .selectAdType").val(),
        adBcId : $(".object-info .selectAdCategory").val(),
        adTitle : $(".object-info .inputAdTitle").val(),
        adDtS : $(".object-info .ad_duration_start").dxDateBox("instance").option().value,
        adDtF : $(".object-info .ad_duration_final").dxDateBox("instance").option().value
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);
    console.log('for',form_data);
    let api_url  = '/api/ad';
    // $.ajax({
    //     dataType : 'JSON',
    //     type : "POST",
    //     url : api_url,
    //     data : form_data,
    //     contentType : false,
    //     processData : false,
    //     success : function (res) {
    //         console.log('ajax result');
    //         console.log(res);
    //         objectInfo('new');
    //         $("#mgmt-table").dxDataGrid("instance").refresh();
    //     }
    // })
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
        adDtF : $(".object-info .ad_duration_final").dxDateBox("instance").option().value,
        adUrl : $('#ad_content_url').text().replace(/\/img\/ad\//,'')
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
    $('#object-search-popup').css('left','430px')
    $('#object-search-popup').css('top','300px')
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



