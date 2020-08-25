

$(document).ready(function(){
    init();
}) 
function init(){

    // 광고기간 DateBox
    $(".info_start, .info_end, .search_info_start, .search_info_end").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd",
    });

    // 신규모드로 실행
    objectInfo("new");

}

let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        info_start_instance = $(".object-info .info_start").dxDateBox("instance"),
        info_end_instance = $(".object-info .info_end").dxDateBox("instance");

    if( mode === "new"){
        if($('#object_detail_group').css('display') == 'none'){
            folding();
        }
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');
        // todo : object reset
        $('.object-info #info_id').text("");
        $('.object-info #info_title').val("");
        $(".object-info #info_url").text('');
        $('.object-info #info_redirect').val("");
        $(".object-info .select2").val('Y').trigger('change');
        info_start_instance.reset();
        info_end_instance.reset();
        
        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');

        $('.object-info #info_id').text(row_data.IF_ID);
        $('.object-info #info_title').val(row_data.IF_Title);
        $(".object-info #info_url").text(row_data.IF_Url);
        $('.object-info #info_redirect').val(row_data.IF_Redirect);
        $(".object-info .select2").val(row_data.IF_State).trigger('change');
        info_start_instance.option("value", row_data.IF_Start);
        info_end_instance.option("value", row_data.IF_End);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/info",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.IF_ID));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            console.log('셀렉트');
        },

        onRowClick : function(e) {
            // console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");
            // debugger;
            let row_data = {};
            row_data.IF_ID = e.data.IF_ID;
            row_data.IF_Title = e.data.IF_Title;
            row_data.IF_Url = e.data.IF_Url;
            row_data.IF_Redirect = e.data.IF_Redirect;
            row_data.IF_Start = e.data.IF_Start;
            row_data.IF_End = e.data.IF_End;
            row_data.IF_State = e.data.IF_State;
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
            var worksheet = workbook.addWorksheet('공지사항 관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '공지사항 관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "IF_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "IF_Title", caption: "제목"},
            { dataField: "IF_Url", caption: "이미지 URL"},
            { dataField: "IF_Redirect", caption: "연결 URL"},
            { dataField: "IF_Start", caption: "시작시간"},
            { dataField: "IF_End", caption: "종료시간"},
            { dataField: "IF_State", caption: "사용여부"},
        ],

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
        info_title : $(".object-info .info_title").val(),
        info_redirect : $(".object-info .info_redirect").val(),
        info_start : $(".object-info .info_start").dxDateBox("instance").option().value,
        info_end : $(".object-info .info_end").dxDateBox("instance").option().value,
        info_state : $(".object-info .info_state").val()
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);
    let api_url  = '/api/info';
    console.log('form',form_data);
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).IF_ID;
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/info/'+id,
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
            url : '/api/info/',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).IF_ID;
    let update_data = {
        info_title : $(".object-info .info_title").val(),
        info_redirect : $(".object-info .info_redirect").val(),
        info_start : $(".object-info .info_start").dxDateBox("instance").option().value,
        info_end : $(".object-info .info_end").dxDateBox("instance").option().value,
        info_state : $(".object-info .info_state").val()
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/info/'+id;

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
    $("#object-search-popup .select2").val('Y').trigger('change');
    let search_info_start_instance = $("#object-search-popup .search_info_start").dxDateBox("instance"),
    search_info_end_instance = $("#object-search-popup .search_info_end").dxDateBox("instance");
    search_info_start_instance.reset();
    search_info_end_instance.reset();
    $("#object_search_info .search_info_title").val('')
    $("#object_search_info .search_info_url").val('')
    $("#object_search_info .search_info_redirect").val('');
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
        info_title : $("#object_search_info .search_info_title").val(),
        info_url : $("#object_search_info .search_info_url").val(),
        info_redirect : $("#object_search_info .search_info_redirect").val(),
        info_start : $("#object_search_info .search_info_start").dxDateBox("instance").option().value,
        info_end : $("#object_search_info .search_info_end").dxDateBox("instance").option().value,
        info_state : $("#object-search-popup .search_info_state").val()
    };

    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/info?type=search',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}

