
$(document).ready(function(){

    init();
}) 
function init(){
    // 신규모드로 실행
    // objectInfo("new");
    // 광고기간 DateBox
    $(".search_cdt").dxDateBox({
        type: "date",
        dateSerializationFormat : "yyyy-MM-dd"
    });
}


let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns");

    if( mode === "new"){
        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#business_id').val('');
        $('#business_name').val('');
        $('#business_phone').val('');
        $('#business_fax').val('');
        $('#business_email').val('');
        $('#postcode').val('');
        $('#address').val('');
        $('#detailAddress').val('');

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        console.log('row_data', row_data);
        $('#business_id').val(row_data.B_ID);
        $('#business_name').val(row_data.B_Name);
        $('#business_phone').val(row_data.B_Tel);
        $('#business_fax').val(row_data.B_Fax);
        $('#business_email').val(row_data.B_Email);
        $('#postcode').val(row_data.B_Zip);
        $('#address').val(row_data.B_Addr1);
        $('#detailAddress').val(row_data.B_Addr2);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/business",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.B_ID));
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
            row_data.B_ID = e.data.B_ID;
            row_data.B_Name = e.data.B_Name;
            row_data.B_Tel = e.data.B_Tel;
            row_data.B_Fax = e.data.B_Fax;
            row_data.B_Email = e.data.B_Email;
            row_data.B_Zip = e.data.B_Zip;
            row_data.B_Addr1 = e.data.B_Addr1;
            row_data.B_Addr2 = e.data.B_Addr2;
            row_data.B_cDt = e.data.B_cDt;
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
            var worksheet = workbook.addWorksheet('운송사관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '운송사 관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "B_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "B_Name", caption: "운송사명"},
            { dataField: "B_Tel", caption: "전화번호"},
            { dataField: "B_Fax", caption: "팩스번호"},
            { dataField: "B_Email", caption: "이메일"},
            { dataField: "B_Zip", caption: "우편번호"},
            { dataField: "B_Addr1", caption: "도로명주소"},
            { dataField: "B_Addr2", caption: "상세주소"},
            { dataField: "B_cDt", caption: "등록일"},
            { dataField: "B_uDt", caption: "수정일"}
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
    let search_py_start_instance = $(".object-info .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $(".object-info .search_se_start").dxDateBox("instance");
    search_py_start_instance.reset();
    search_se_start_instance.reset();
}


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        b_name : $("#business_name").val(),
        b_phone : $('#business_phone').val(),
        b_fax : $('#business_fax').val(),
        b_email : $('#business_email').val(),
        b_zip : $('#postcode').val(),
        b_addr1 : $('#address').val(),
        b_addr2 : $('#detailAddress').val(),
    }

    let api_url  = '/api/business';
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).B_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/business/'+id,
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
            url : '/api/business',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).B_ID;
    let update_data = {
        b_name : $("#business_name").val(),
        b_phone : $('#business_phone').val(),
        b_fax : $('#business_fax').val(),
        b_email : $('#business_email').val(),
        b_zip : $('#postcode').val(),
        b_addr1 : $('#address').val(),
        b_addr2 : $('#detailAddress').val(),
    }

    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/business/'+id;

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
    let search_detailAddress_instance = $("#object-search-popup .search_cdt").dxDateBox("instance")
    search_detailAddress_instance.reset();

    $("#search_business_name").val(),
    $('#search_business_phone').val(),
    $('#search_business_fax').val(),
    $('#search_business_email').val(),
    $('#search_postcode').val(),
    $('#search_address').val(),
    $('#search_detailAddress').val()
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
        b_name : $("#search_business_name").val(),
        b_phone : $('#search_business_phone').val(),
        b_fax : $('#search_business_fax').val(),
        b_email : $('#search_business_email').val(),
        b_zip : $('#search_postcode').val(),
        b_addr1 : $('#search_address').val(),
        b_addr2 : $('#search_detailAddress').val(),
        b_cdt : $("#object-search-popup .search_cdt").dxDateBox("instance").option().value
    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/business?type=search',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}

