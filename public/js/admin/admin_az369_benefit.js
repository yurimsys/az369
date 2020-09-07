
$(document).ready(function(){

    init();
    objectInfo("new");
}) 
function init(){
    // 광고기간 DateBox
    $(".search_benefit_day").dxDateBox({
        type: "datetime",
        displayFormat: 'yyyy-MM-dd HH:mm',
        dateSerializationFormat : "yyyy-MM-dd HH:mm",
    });
}


let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns")
    if( mode === "new"){
        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#benefit_id').val('');
        $('#benefit_name').val('');
        $('#benefit_phone').val('');
        $('#benefit_brand').val('');
        $('#benefit_addr1').val('');
        $('#benefit_addr2').val('');
        $('#benefit_check').val('null');
        $('#benefit_day').val('');
        $('#benefit_content').val('');

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');


        $('#benefit_id').val(row_data.SI_ID);
        $('#benefit_name').val(row_data.SI_Name);
        $('#benefit_phone').val(row_data.SI_Phone);
        $('#benefit_brand').val(row_data.SI_Brand);
        $('#benefit_addr1').val(row_data.SI_Addr1);
        $('#benefit_addr2').val(row_data.SI_Addr2);
        $('#benefit_check').val(row_data.SI_Read);
        $('#benefit_day').val(row_data.SI_cDt);
        $('#benefit_content').val(row_data.SI_Content);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/benefit",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.SI_ID));
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
            row_data.SI_ID = e.data.SI_ID;
            row_data.SI_Name = e.data.SI_Name;
            row_data.SI_Phone = e.data.SI_Phone;
            row_data.SI_Brand = e.data.SI_Brand;
            row_data.SI_Addr1 = e.data.SI_Addr1;
            row_data.SI_Addr2 = e.data.SI_Addr2;
            row_data.SI_Content = e.data.SI_Content;
            row_data.SI_cDt = e.data.SI_cDt;
            row_data.SI_Read = e.data.SI_Read;
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
            var worksheet = workbook.addWorksheet('입점신청 관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '입점신청 관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "SI_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "SI_Name", caption: "고객명"},
            { dataField: "SI_Phone", caption: "고객번호"},
            { dataField: "SI_Brand", caption: "브랜드명"},
            { dataField: "SI_Addr1", caption: "고객주소"},
            { dataField: "SI_Addr2", caption: "상세주소"},
            { dataField: "contents", caption: "문의내용"},
            { dataField: "SI_Read", caption: "확인여부"},
            { dataField: "SI_cDt", caption: "문의날짜"},
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
    // $(".select2").val(null).trigger('change');
    let search_video_cdt_instance = $(".object-info .search_video_cdt").dxDateBox("instance")
    search_video_cdt_instance.reset();
}

tableInit();

//신규 등록 저장
function saveAD(){
    //사용하지 않음
    // let update_data = {
    //     video_id : $("#video_id").val(),
    //     video_url : $('#video_url').val(),
    //     video_channel : $('#video_channel').val(),
    //     video_cdt : $(".object-info .video_cdt").dxDateBox("instance").option().value,
    //     video_title : $('#video_title').val(),
    //     video_contents : $('#video_contents').val(),
    //     video_recommend : $("#video_recommend option:selected").attr('value')
    // }

    // let api_url  = '/api/video';
    // $.ajax({
    //     dataType : 'JSON',
    //     type : "POST",
    //     url : api_url,
    //     data : update_data,
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).SI_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/benefit/'+id,
            success : function (res) {
                // console.log('ajax result');
                // console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
                benefitRead();
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
            url : '/api/benefit',
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
                benefitRead();
            }
        });
    }
}
function updateAD(){
    let id = JSON.parse( sessionStorage.getItem('row_data') ).SI_ID;
    let update_data = {
        benefit_check : $("#benefit_check option:selected").attr('value')
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/benefit/'+id;
    console.log('idid',update_data);
    $.ajax({
        dataType : 'JSON',
        type : "PUT",
        url : api_url,
        data : update_data,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            $("#mgmt-table").dxDataGrid("instance").refresh();
            benefitRead();
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
    let search_benefit_day_instance = $("#object-search-popup .search_benefit_day").dxDateBox("instance");

    $('#search_benefit_name').val('');
    $('#search_benefit_phone').val('');
    $('#search_benefit_brand').val('');
    $('#search_benefit_addr1').val('');
    $('#search_benefit_addr2').val('');
    $('#search_benefit_content').val('');
    $('#search_benefit_check').val('null');
    search_benefit_day_instance.reset();
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
        benefit_name : $('#search_benefit_name').val(),
        benefit_phone : $('#search_benefit_phone').val(),
        benefit_brand : $('#search_benefit_brand').val(),
        benefit_addr1 : $('#search_benefit_addr1').val(),
        benefit_addr2 : $('#search_benefit_addr2').val(),
        benefit_content : $('#search_benefit_content').val(),
        benefit_day : $(".object-search-popup .search_benefit_day").dxDateBox("instance").option().value,
        benefit_check : $("#search_benefit_check option:selected").attr('value')

    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/benefit?type=search',
        data : condition_data,
        success : function (res) {
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}
