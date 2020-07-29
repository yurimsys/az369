
$(document).ready(function(){





    
    init();
}) 
function init(){
    $.ajax({
        method: "get",
        dataType : "JSON",
        url: "/api/business_list",
        success: function (res){


            for (let i=0; i<res.data.length; i++){
                let html = "<option value="+res.data[i].CY_ID+">"+res.data[i].B_Name+"</option>";

                $('#business_list').append(html);
                $('#search_business_list').append(html);
            }
        }
    });

    // 신규모드로 실행
    // objectInfo("new");
        // 광고기간 DateBox
        $(".py_start, .se_start, .search_py_start, .search_se_start").dxDateBox({
            type: "datetime",
            displayFormat: 'yyyy-MM-dd HH:mm',
            dateSerializationFormat : "yyyy-MM-dd HH:mm",
        });
}


let objectInfo = function (mode = "modify", row_data) {
    let action_btns_instance = $(".object-info .action-btns"),
        py_start_instance = $(".object-info .py_start").dxDateBox("instance"),
        se_start_instance = $(".object-info .se_start").dxDateBox("instance");

    if( mode === "new"){
        if($('.brand_info').css('display') == 'none'){
            folding();
        }
        
        action_btns_instance.removeClass('action-modify');
        action_btns_instance.addClass('action-new');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

        $('#business_list').val('null');
        $('#car_number').val('');
        $('#driver_name').val('');
        $('#driver_phone').val('');
        // $("#py_start").val('');
        // $("#se_start").val('');
        $('#py_start_check').val('N');
        $('#se_start_check').val('N');

        py_start_instance.reset();
        se_start_instance.reset();

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        // console.log(row_data.login_id);
        $('#business_list').val(row_data.CY_ID);
        $('#car_number').val(row_data.CarNum);
        $('#driver_name').val(row_data.CT_DriverName);
        $('#driver_phone').val(row_data.CT_DriverPhone);
        // $("#py_start").val(row_data.CT_DepartureTe);
        // $("#se_start").val(row_data.CT_ReturnTe);
        $('#py_start_check').val(row_data.CT_PyStart);
        $('#se_start_check').val(row_data.CT_SeStart);

        py_start_instance.option("value", row_data.CT_DepartureTe);
        se_start_instance.option("value", row_data.CT_ReturnTe);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/vehicle",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.CT_ID));
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
            console.log('row click', e.data);
            // selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            e.rowElement.css("border-left", "2px solid #f2f2f2");

            let row_data = {};
            row_data.CT_ID = e.data.CT_ID;
            row_data.CY_ID = e.data.CY_ID;
            row_data.B_Name = e.data.B_Name;
            row_data.CarNum = e.data.CT_CarNum;
            row_data.CT_DriverName = e.data.CT_DriverName;
            row_data.CT_DriverPhone = e.data.CT_DriverPhone;
            row_data.CT_DepartureTe = e.data.CT_DepartureTe;
            row_data.CT_ReturnTe = e.data.CT_ReturnTe;
            row_data.CT_PyStart = e.data.CT_PyStart;
            row_data.CT_SeStart = e.data.CT_SeStart;
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
            var worksheet = workbook.addWorksheet('배차관리');
            
            DevExpress.excelExporter.exportDataGrid({
              component: e.component,
              worksheet: worksheet,
              autoFilterEnabled: true
            }).then(function() {
              workbook.xlsx.writeBuffer().then(function(buffer) {
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '배차관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "CT_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "B_Name", caption: "운송사명"},
            { dataField: "CT_CarNum", caption: "차량번호"},
            { dataField: "CY_Ty", caption: "버스타입"},
            { dataField: "CT_DriverName", caption: "기사명"},
            { dataField: "CT_DriverPhone", caption: "기사번호"},
            { dataField: "CY_SeatPrice", caption: "좌석가격"},
            { dataField: "CT_DepartureTe", caption: "평택 출발시간"},
            { dataField: "CT_ReturnTe", caption: "서울 출발시간"},
            { dataField: "CT_PyStart", caption: "평택 출발확인"},
            { dataField: "CT_SeStart", caption: "서울 출발확인"}
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
    let search_py_start_instance = $(".object-info .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $(".object-info .search_se_start").dxDateBox("instance");
    search_py_start_instance.reset();
    search_se_start_instance.reset();
}


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        cy_id : $("#business_list option:selected").attr('value'),
        car_num : $("#car_number").val(),
        driver_name : $('#driver_name').val(),
        driver_phone : $('#driver_phone').val(),
        py_start : $(".object-info .py_start").dxDateBox("instance").option().value,
        se_start : $(".object-info .se_start").dxDateBox("instance").option().value,
        py_start_check : $("#py_start_check option:selected").attr('value'),
        se_start_check : $("#se_start_check option:selected").attr('value')
    }

    // console.log('updat22222e :',update_data);
    
    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);
    let api_url  = '/api/vehicle';
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

        let id = JSON.parse( sessionStorage.getItem('row_data') ).CT_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/vehicle/'+id,
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
            url : '/api/vehicle',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).CT_ID;
    let update_data = {
        cy_id : $("#business_list option:selected").attr('value'),
        car_num : $("#car_number").val(),
        driver_name : $('#driver_name').val(),
        driver_phone : $('#driver_phone').val(),
        py_start : $(".object-info .py_start").dxDateBox("instance").option().value,
        se_start : $(".object-info .se_start").dxDateBox("instance").option().value,
        py_start_check : $("#py_start_check option:selected").attr('value'),
        se_start_check : $("#se_start_check option:selected").attr('value')
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/vehicle/'+id;

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
    let search_py_start_instance = $("#object-search-popup .search_py_start").dxDateBox("instance"),
    search_se_start_instance = $("#object-search-popup .search_se_start").dxDateBox("instance");
    search_py_start_instance.reset();
    search_se_start_instance.reset();

    $('#search_business_list').val('null');
    $('#search_car_number').val('');
    $('#search_driver_name').val('');
    $('#search_driver_phone').val('');
    // $("#search_py_start").val('');
    // $("#search_se_start").val('');
    $('#search_py_start_check').val('null');
    $('#search_se_start_check').val('null');
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
        cy_id : $("#search_business_list option:selected").attr('value'),
        car_num : $("#search_car_number").val(),
        driver_name : $('#search_driver_name').val(),
        driver_phone : $('#search_driver_phone').val(),
        py_start : $("#object-search-popup .search_py_start").dxDateBox("instance").option().value,
        se_start : $("#object-search-popup .search_se_start").dxDateBox("instance").option().value,
        py_start_check : $("#search_py_start_check option:selected").attr('value'),
        se_start_check : $("#search_se_start_check option:selected").attr('value'),
    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/vehicle?type=search',
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
