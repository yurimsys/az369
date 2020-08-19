
$(document).ready(function(){

    init();
}) 
function init(){
    // 광고기간 DateBox
    $(".video_cdt, .search_video_cdt").dxDateBox({
        type: "datetime",
        displayFormat: 'yyyy-MM-dd HH:mm',
        dateSerializationFormat : "yyyy-MM-dd HH:mm",
    });
}


let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
    video_cdt_instance = $(".object-info .video_cdt").dxDateBox("instance");

    if( mode === "new"){
        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#video_id').val('');
        $('#video_url').val('');
        $('#video_channel').val('');
        $('#video_title').val('');
        $('#video_contents').val('');
        $('#video_recommend').val('N');
        video_cdt_instance.reset();

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');

        $('#video_id').val(row_data.YL_id);
        $('#video_url').val(row_data.YL_url);
        $('#video_channel').val(row_data.YL_ch_name);
        $('#video_title').val(row_data.YL_title)
        $('#video_contents').val(row_data.YL_description);
        $('#video_recommend').val(row_data.YL_d_order);

        video_cdt_instance.option("value", row_data.YL_dDt);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/video",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.YL_id));
            let dataGrid = e.component;
            
            let informer = e.element.find(".selectedActionBtns");
            informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

            let isSelected = (e.selectedRowsData.length > 0);
            let selectedActionBtns = $(".selectedActionBtns");
            
            selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
            selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
        },
        onRowClick : function(e) {
            // console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");

            let row_data = {};
            row_data.YL_id = e.data.YL_id;
            row_data.YL_url = e.data.YL_url;
            row_data.YL_title = e.data.YL_title;
            row_data.YL_description = e.data.YL_description;
            row_data.YL_ch_name = e.data.YL_ch_name;
            row_data.YL_d_order = e.data.YL_d_order;
            row_data.YL_dDt = e.data.YL_dDt;
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
            var worksheet = workbook.addWorksheet('유튜브 관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '유튜브 관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "YL_id", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "YL_url", caption: "URL"},
            { dataField: "YL_title", caption: "영상 제목"},
            { dataField: "contents", caption: "영상 소개글"},
            { dataField: "YL_ch_name", caption: "채널명"},
            { dataField: "YL_d_order", caption: "추천영상"},
            { dataField: "YL_dDt", caption: "등록일"},
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
    let search_video_cdt_instance = $(".object-info .search_video_cdt").dxDateBox("instance")
    search_video_cdt_instance.reset();
}

tableInit();

//신규 등록 저장
function saveAD(){
    let update_data = {
        video_id : $("#video_id").val(),
        video_url : $('#video_url').val(),
        video_channel : $('#video_channel').val(),
        video_cdt : $(".object-info .video_cdt").dxDateBox("instance").option().value,
        video_title : $('#video_title').val(),
        video_contents : $('#video_contents').val(),
        video_recommend : $("#video_recommend option:selected").attr('value')
    }

    let api_url  = '/api/video';
    $.ajax({
        dataType : 'JSON',
        type : "POST",
        url : api_url,
        data : update_data,
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).YL_id;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/video/'+id,
            success : function (res) {
                // console.log('ajax result');
                // console.log(res);
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
            url : '/api/video',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).YL_id;
    let update_data = {
        video_id : $("#video_id").val(),
        video_url : $('#video_url').val(),
        video_channel : $('#video_channel').val(),
        video_cdt : $(".object-info .video_cdt").dxDateBox("instance").option().value,
        video_title : $('#video_title').val(),
        video_contents : $('#video_contents').val(),
        video_recommend : $("#video_recommend option:selected").attr('value')
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/video/'+id;

    $.ajax({
        dataType : 'JSON',
        type : "PUT",
        url : api_url,
        data : update_data,
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
    let search_video_cdt_instance = $("#object-search-popup .search_video_cdt").dxDateBox("instance");

    $('#search_video_id').val('');
    $('#search_video_url').val('');
    $('#search_video_channel').val('');
    $('#search_video_title').val('');
    $('#search_video_contents').val('');
    $('#search_video_recommend').val('null');
    search_video_cdt_instance.reset();
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
        video_url : $('#search_video_url').val(),
        video_channel : $('#search_video_channel').val(),
        video_cdt : $(".object-search-popup .search_video_cdt").dxDateBox("instance").option().value,
        video_title : $('#search_video_title').val(),
        video_contents : $('#search_video_contents').val(),
        video_recommend : $("#search_video_recommend option:selected").attr('value')


    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/video?type=search',
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
    $('#object_detail_group').slideToggle('fast')
    
    
}
