
$(document).ready(function(){

    init();
}) 
function init(){


    // 신규모드로 실행
    // objectInfo("new");
    // 광고기간 DateBox
    $(".search_u_cdt").dxDateBox({
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

        $('#u_id').val('');
        $('#u_login_id').val('');
        $('#u_name').val('');
        $("#u_email").val('');
        $("#u_phone").val('');
        $("#u_brand").val('');
        $('#u_cdt').val('');
        $("#u_admin").val('n');
        $("#postcode").val('');
        $('#address').val('');
        $('#detailAddress').val('');

        sessionStorage.removeItem('row_data');
    } else if( mode === "modify"){
        // console.log('row_data',row_data);
        action_btns_instance.removeClass('action-new');
        action_btns_instance.addClass('action-modify');
        
        action_btns_instance.find('.btn').removeClass('disabled');
        action_btns_instance.find('.btn-save').addClass('disabled');
        console.log(row_data.U_isAdmin);

        $('#u_id').val(row_data.U_ID);
        $('#u_login_id').val(row_data.U_uId);
        $('#u_name').val(row_data.U_Name);
        $("#u_email").val(row_data.U_Email);
        $("#u_phone").val(row_data.U_Phone);
        $("#u_brand").val(row_data.U_Brand);
        $("#u_cdt").val(row_data.U_cDt);
        $("#u_admin").val(row_data.U_isAdmin);
        $("#postcode").val(row_data.U_Zip);
        $('#address').val(row_data.U_Addr1);
        $('#detailAddress').val(row_data.U_Addr2);

        sessionStorage.setItem('row_data', JSON.stringify(row_data) );
    }
}

let tableInit = function (data) {
    $("#mgmt-table").dxDataGrid({
        dataSource: "/api/member",
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
            sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.U_ID));
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
            row_data.U_ID = e.data.U_ID;
            row_data.U_uId = e.data.U_uId;
            row_data.U_Name = e.data.U_Name;
            row_data.U_Email = e.data.U_Email;
            row_data.U_Phone = e.data.U_Phone;
            row_data.U_Brand = e.data.U_Brand;
            row_data.U_Zip = e.data.U_Zip;
            row_data.U_Addr1 = e.data.U_Addr1;
            row_data.U_Addr2 = e.data.U_Addr2;
            row_data.U_cDt = e.data.U_cDt;
            row_data.U_isAdmin = e.data.U_isAdmin;
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
                saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '장차 회원관리.xlsx');
              });
            });
            e.cancel = true;
          },
        columns: [
            //cssClass : 'tooltip'
            { dataField: "U_ID", caption: "ID", width : 70, sortOrder : "desc"},
            { dataField: "U_uId", caption: "아이디"},
            { dataField: "U_Name", caption: "회원이름"},
            { dataField: "U_Email", caption: "이메일"},
            { dataField: "U_Phone", caption: "전화번호"},
            { dataField: "U_Brand", caption: "브랜드"},
            { dataField: "U_Zip", caption: "우편번호"},
            { dataField: "U_Addr1", caption: "도로명 주소"},
            { dataField: "U_Addr2", caption: "상세주소"},
            { dataField: "U_cDt", caption: "가입일"},
            { dataField: "U_isAdmin", caption: "관리자"}
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


tableInit();
//신규 등록 저장
function saveAD(){

    let update_data = {
        u_login_id : $("#u_login_id").val(),
        u_name : $('#u_name').val(),
        u_email : $('#u_email').val(),
        u_phone : $('#u_phone').val(),
        u_brand : $('#u_brand').val(),
        u_admin : $("#u_admin option:selected").attr('value'),
        postcode : $('#postcode').val(),
        address : $('#address').val(),
        detailAddress : $('#detailAddress').val(),
    }

    // console.log('updat22222e :',update_data);
    
    // let form_data = new FormData(document.forms[0]);
    // for ( let i in update_data) form_data.append(i, update_data[i]);
    let api_url  = '/api/member';
    $.ajax({
        dataType : 'JSON',
        type : "POST",
        url : api_url,
        data : update_data,
        success : function (res) {
            console.log('ajax result');
            console.log(res);
            alert('기본 비밀번호는 1234 입니다');
            objectInfo('new');
            $("#mgmt-table").dxDataGrid("instance").refresh();
        }
    })
}
function deleteAD(mode = 'single') {
    if(mode === 'single'){

        let id = JSON.parse( sessionStorage.getItem('row_data') ).U_ID;
        console.log(id,'삭제 아이디');
        $.ajax({
            dataType : 'JSON',
            type : "DELETE",
            url : '/api/member/'+id,
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
            url : '/api/member',
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
    let id = JSON.parse( sessionStorage.getItem('row_data') ).U_ID;
    let update_data = {
        u_login_id : $("#u_login_id").val(),
        u_name : $('#u_name').val(),
        u_email : $('#u_email').val(),
        u_phone : $('#u_phone').val(),
        u_brand : $('#u_brand').val(),
        u_admin : $("#u_admin option:selected").attr('value'),
        postcode : $('#postcode').val(),
        address : $('#address').val(),
        detailAddress : $('#detailAddress').val(),
    }

    let form_data = new FormData(document.forms[0]);
    for ( let i in update_data) form_data.append(i, update_data[i]);

    let api_url  = '/api/member/'+id;

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
    let search_u_cdt_instance = $("#object-search-popup .search_u_cdt").dxDateBox("instance");
    

    $('#search_u_id').val('');
    $('#search_u_login_id').val('');
    $('#search_u_name').val('');
    $("#search_u_email").val('');
    $("#search_u_phone").val('');
    $("#search_u_brand").val('');
    $("#search_u_admin").val('n');
    $("#search_postcode").val('');
    $('#search_address').val('');
    $('#search_detailAddress').val('');
    search_u_cdt_instance.reset();
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
        u_login_id : $("#search_u_login_id").val(),
        u_name : $('#search_u_name').val(),
        u_email : $('#search_u_email').val(),
        u_phone : $('#search_u_phone').val(),
        u_brand : $('#search_u_brand').val(),
        u_admin : $("#search_u_admin option:selected").attr('value'),
        postcode : $('#postcode').val(),
        address : $('#search_address').val(),
        detailAddress : $('#search_detailAddress').val(),
        u_cdt : $("#object-search-popup .search_u_cdt").dxDateBox("instance").option().value
    };
    $.ajax({
        type : "GET",
        dataType : 'JSON',
        url : '/api/member?type=search',
        data : condition_data,
        success : function (res) {
            
            $("#mgmt-table").dxDataGrid({
                dataSource: res.data
            });
        }
    })
}

