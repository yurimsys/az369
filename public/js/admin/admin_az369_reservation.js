
    $(document).ready(function(){
        init();
            
    }) 
    function init(){

        // 신규모드로 실행
        objectInfo("new");
        $(".search_res_day, .search_py_start, .search_se_start").dxDateBox({
            type: "date",
            dateSerializationFormat : "yyyy-MM-dd",
        });
        
        // $('.select2').css('heigth','30px');
        //상단 검색창 회원목록
        $.ajax({
            url: '/api/user_list',
            method: 'get',
            dataType : 'json',
            success : function(res){

                let user_list = res.data.map((data) =>{
                    return { id : data.U_ID, text : data.U_Name + ' '+ data.U_Phone}
                });
                // console.log('brsan', brand_list);
                $("#u_id").select2(
                    {
                        placeholder: '회원 선택',
                        data: user_list,
                        width: 'calc(77% - 30px)'
                    }
                );
            }
        });





    }

    let objectInfo = function (mode = "modify", row_data) {
        let action_btns_instance = $(".object-info .action-btns")

        if( mode === "new"){
        //운송사 인풋 박스 클릭시!!

            input_html = "<input type='text' id='input_ct_id' class='long_box' placeholder='차량 선택' onclick='openSelect()' readonly>"
            $('#ct_id').select2('destroy');
            $('#ct_id').before(input_html);
            $('#ct_id').remove();
            $('#input_ct_id').val('');

            //좌석번호 인풋박스 초기화
            $('#seat_num').data('type','');
            $('#seat_num').data('ctid','');

            $.ajax({
                method: "get",
                dataType : "JSON",
                url: "/api/vehicle/list?type=default",
                success: function (res){
                    $('#search_ct_id').empty();
                    let default_html = '<option value="null">차량 선택</option>'
                    // $('#ct_id').append(default_html);
                    if(res.data.length > 0){
                        for (let i=0; i<res.data.length; i++){
                            let html = "<option value="+res.data[i].CT_ID+" onclick='test(this)' data-price="+res.data[0].CY_SeatPrice+">"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
                            // $('#ct_id').append(html);
                        }
            
                        let html = "<option value="+res.data[0].B_NAME+">"+res.data[0].B_NAME+"</option>";
                        $('#search_ct_id').append(default_html);
                        $('#search_ct_id').append(html);
                    }
                }
            });


            if($('.brand_info').css('display') == 'none'){
                folding();
            }
            $('#new_test2').css('display','none');
            $('.info_center').css('display','none');
            $('.info_right').css('display','none');
            $('#ct_id').attr('disabled', false);
            $('#u_id').attr('disabled',false);
            $('#seat_num').attr('readonly',true);

            
            action_btns_instance.removeClass('action-modify');
            action_btns_instance.addClass('action-new');
            
            action_btns_instance.find('.btn').removeClass('disabled');
            action_btns_instance.find('.btn-modify, .btn-delete').addClass('disabled');

            $('#cr_id').val('');
            $('#u_id').val('');
            $(".object-info .select2").val(null).trigger('change');
            $('#seat_num').val('');
            $("#user_name").val('');
            $("#user_phone").val('');
            $("#user_brand").val('');
            $("#seat_price").val('');
            $("#user_addr1").val('');
            $("#user_addr2").val('');
            $('#py_start').val('null');
            $('#se_start').val('null');
            $('#cr_cancel').val('null');
            $("#py_scan").val('null');
            $("#se_scan").val('null');
            $('#res_day').val('');
            $('#cr_memo').val('');
            $('#cr_state').val('');
            // init();
            sessionStorage.removeItem('row_data');
            $('.object-info seelct2').on('click',function(){
                console.log('goood?');
            })
            
        } else if( mode === "modify"){        
            
            console.log('log', row_data);
            $('#new_test2').css('display','block');
            $('.info_center').css('display','block');
            $('.info_right').css('display','block');
            $('#u_id').attr('disabled',true);
            action_btns_instance.removeClass('action-new');
            action_btns_instance.addClass('action-modify');
            
            action_btns_instance.find('.btn').removeClass('disabled');
            action_btns_instance.find('.btn-save').addClass('disabled');
            let bus_info = '　'+row_data.B_Name + ' ' + row_data.CT_DepartureTe.slice('0','13')+'시';
            let bus_ct_id = row_data.CR_CT_ID;
            let input_html = "<input type='text' id='input_ct_id' class='long_box' placeholder='차량 선택' onclick='openSelect()' readonly>"
            $('#ct_id').select2('destroy');
            $('#ct_id').before(input_html);
            
            //운송사 정보
            $('#input_ct_id').val(bus_info);
            $('#input_ct_id').data('ctid',bus_ct_id);
            $('#ct_id').remove();

            $('.object-info #u_id').val(row_data.CR_U_ID).trigger('change');
            $('#cr_id').val(row_data.CR_ID);
            $('#seat_num').val(row_data.CR_SeatNum);
            $("#user_name").val(row_data.U_Name);
            $("#user_phone").val(row_data.U_Phone);
            $("#user_brand").val(row_data.U_Brand);
            $("#seat_price").val(row_data.CR_Price);
            $("#user_addr1").val(row_data.U_Addr1);
            $("#user_addr2").val(row_data.U_Addr2);
            $('#py_start').val(row_data.CT_DepartureTe);
            $('#se_start').val(row_data.CT_ReturnTe);
            $('#cr_cancel').val(row_data.CR_Cancel);
            $("#py_scan").val(row_data.CR_ScanPy);
            $("#se_scan").val(row_data.CR_ScanSe);
            $('#res_day').val(row_data.CR_cDt);
            $('#cr_memo').val(row_data.CR_Memo);
            $('#cr_state').val(row_data.CR_PayState);
            
            sessionStorage.setItem('select_ct_id',row_data.CR_SeatNum);
            sessionStorage.setItem('row_data', JSON.stringify(row_data) );

        }
    }

    let tableInit = function (data) {
        $("#mgmt-table").dxDataGrid({
            dataSource: "/api/reservation",
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
                sessionStorage.setItem("row_data_list", e.selectedRowsData.map(data => data.CR_ID));
                let dataGrid = e.component;
                
                let informer = e.element.find(".selectedActionBtns");
                informer.find(".selectRowCount").text( "선택 "+dataGrid.getSelectedRowsData().length+" 개");

                let isSelected = (e.selectedRowsData.length > 0);
                let selectedActionBtns = $(".selectedActionBtns");
                
                selectedActionBtns.css('display', (isSelected) ? "flex" : "none");
                selectedActionBtns.parent().css("border-left", "2px solid #f2f2f2");
            },
            onRowClick : function(e) {

                selected_seats = [];
                e.rowElement.css("border-left", "2px solid #f2f2f2");

                let row_data = {};
                row_data.CR_ID = e.data.CR_ID;
                row_data.CR_CT_ID = e.data.CR_CT_ID;
                row_data.CR_U_ID = e.data.CR_U_ID;
                row_data.B_Name = e.data.B_Name;
                row_data.U_Name = e.data.U_Name;
                row_data.U_uId = e.data.U_uId;
                row_data.U_Phone = e.data.U_Phone;
                row_data.U_Brand = e.data.U_Brand;
                row_data.U_Addr1 = e.data.U_Addr1;
                row_data.U_Addr2 = e.data.U_Addr2;
                row_data.CR_SeatNum = e.data.CR_SeatNum;
                row_data.CR_Price = e.data.CR_Price;
                row_data.CR_Cancel = e.data.CR_Cancel;
                row_data.CR_ScanPy = e.data.CR_ScanPy;
                row_data.CR_ScanSe = e.data.CR_ScanSe;
                row_data.CT_DepartureTe = e.data.CT_DepartureTe;
                row_data.CT_ReturnTe = e.data.CT_ReturnTe;
                row_data.CR_cDt = e.data.CR_cDt;
                row_data.PH_Type = e.data.PH_Type;
                row_data.CR_Memo = e.data.CR_Memo;
                row_data.CR_PayState = e.data.CR_PayState;
                row_data.PH_PG_ID = e.data.PH_PG_ID;
                row_data.PH_ID = e.data.PH_ID;
                row_data.PH_CodeType = e.data.PH_CodeType;
                row_data.CR_PH_ID = e.data.CR_PH_ID;
                
                if($('.brand_info').css('display') == 'none'){
                    folding();
                }
                objectInfo("modify", row_data);
                let type = 'res-user-seat'
                $('#seat_num').data('type',type);
                $('#seat_num').data('ctid',e.data.CR_CT_ID);

            },
            onCellClick : function(e){
                $('#seat_num').empty();
                if (e.columnIndex == 6) {  
                    let type = 'user-seat';
                    // alert(e.data.CR_SeatNum);
                    openBus(e.data.CR_SeatNum,type);
                    //좌석 현황 오픈
                    $('#object-seat-popup').css('left','430px')
                    $('#object-seat-popup').css('top','300px')
                    $("#object-seat-popup").show();
                } 
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
                    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), '장차 예약관리.xlsx');
                });
                });
                e.cancel = true;
            },
            columns: [
                //cssClass : 'tooltip'
                { dataField: "CR_ID", caption: "ID", width : 70, sortOrder : "desc"},
                { dataField: "U_Name", caption: "회원명"},
                { dataField: "U_uId", caption: "회원 아이디"},
                { dataField: "U_Phone", caption: "회원 전화번호"},
                { dataField: "B_Name", caption: "운송사명"},
                { dataField: "CR_SeatNum", caption: "예약 좌석"},
                { dataField: "CT_CarNum", caption: "버스번호"},
                { dataField: "CT_DepartureTe", caption: "평택 출발시간"},
                { dataField: "CT_ReturnTe", caption: "서울 출발시간"},
                { dataField: "CR_Price", caption: "좌석 금액"},
                { dataField: "PH_Type", caption: "결제수단"},
                { dataField: "CR_PayState", caption: "결제여부",
                    cellTemplate : function(element, info){
                        if(info.value == '결제취소'){
                            element.append('<div>'+info.value +'</div>').css('color','red')
                        }else{
                            element.append('<div>'+info.value +'</div>')
                        }
                    }
                },
                { dataField: "CR_Cancel", caption: "취소여부", 
                    cellTemplate : function(element, info){
                        if(info.value == 'Y'){
                            element.append('<div>'+info.value +'</div>').css('color','red')
                        }else{
                            element.append('<div>'+info.value +'</div>')
                        }
                    }
                },
                { dataField: "CR_CancelDt", caption: "취소일자"},
                { dataField: "CR_ScanPy", caption: "평택 스캔확인",
                    cellTemplate : function(element, info){
                        // console.log('infoT',info.value);
                        if(info.value == 'Y'){
                            element.append('<div>'+info.text +'</div>').css('color','blue')
                        }else{
                            element.append('<div>'+info.text +'</div>')
                        }
                    }
                },
                { dataField: "CR_ScanSe", caption: "서울 스캔확인",
                    cellTemplate : function(element, info){
                        if(info.value == 'Y'){
                            element.append('<div>'+info.text +'</div>').css('color','blue')
                        }else{
                            element.append('<div>'+info.text +'</div>')
                        }
                    }
                },
                { dataField: "CR_cDt", caption: "예매일"},
                { dataField: "U_Email", caption: "회원 이메일"},
                { dataField: "U_Brand", caption: "회원 브랜드"},
                { dataField: "U_Zip", caption: "회원 우편번호"},
                { dataField: "U_Addr1", caption: "회원 주소"},
                { dataField: "U_Addr2", caption: "회원 상세주소"},
                { dataField: "CR_Memo", caption: "비고"},
                { dataField: "CR_CT_ID", visible: false },
                { dataField: "CR_U_ID", visible: false },
                { dataField: "CT_ID", visible: false },
                { dataField: "CR_PH_ID", visible: false },
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
        let search_res_day_instance = $(".object-info .search_res_day").dxDateBox("instance"),
        search_py_start_instance = $(".object-info .search_py_start").dxDateBox("instance"),
        search_se_start_instance = $(".object-info .search_se_start").dxDateBox("instance");
        search_res_day_instance.reset();
        search_py_start_instance.reset();
        search_se_start_instance.reset();
    }


    tableInit();

    //주문번호 생성
    function getOrderNumber(){
        //주문 번호
        let order_number;
        $.ajax({
            url : '/api/ordernumber',
            method : 'get',
            dataType : 'json',
            async: false,
            success: function(res){
                order_number = res.data
            }					
        });
        return order_number;
    }


    //신규 등록 저장
    function saveAD(){

        let update_data = {
            ct_id : $('#input_ct_id').data('ctid'),
            u_id : $("#u_id").val(),
            moid : getOrderNumber(),
            seat_num : $('#seat_num').val(),
            seatNums : selected_seats,
            seat_price : $('#input_ct_id').data('price')
        }

        //mid 를 만들어서 보내줘야 함
        // console.log('cons',$('#seat_num').val());
        // let form_data = new FormData(document.forms[0]);
        // for ( let i in update_data) form_data.append(i, update_data[i]);
        // console.log('입력!!',selected_seats);
        let api_url = '/api/reservation';
        $.ajax({
            dataType : 'JSON',
            type : "POST",
            url : api_url,
            data : update_data,
            success : function (res) {
                // console.log('ajax result');
                // console.log(res);
                objectInfo('new');
                $("#mgmt-table").dxDataGrid("instance").refresh();
            }
        })
    }
    function deleteAD(mode = 'single') {
        if(mode === 'single'){

            let id = JSON.parse( sessionStorage.getItem('row_data') ).CR_ID;
            // console.log(id,'삭제 아이디');
            $.ajax({
                dataType : 'JSON',
                type : "DELETE",
                url : '/api/reservation/'+id,
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
            // console.log(id_list,'삭제 아이디들');
            $.ajax({
                dataType : 'JSON',
                type : "DELETE",
                data : id_list,
                url : '/api/reservation',
                success : function (res) {
                    // console.log('ajax result');
                    // console.log(res);
                    objectInfo('new');
                    $("#mgmt-table").dxDataGrid("instance").refresh();
                }
            });
        }
    }

    // //결제취소 JSON 값
    // function cancelInfo(string, codeString, cancelType, ph_pay) {

    //     let cancel_data = {}                        //전체 필수 값 !!!!
    //         cancel_data.mid = 'pgaz369azm',         //이노페이에서 발급한 상점아이디
    //         cancel_data.tid = string,               //거래고유번호
    //         cancel_data.svcCd = `${codeString}`,    //취소 결과 코드 ex) 신용카드 : 01, 계좌이체 : 02, 간편결제 : 16
    //         cancel_data.partialCancelCode = cancelType,    //전체취소 : 0, 부분취소 : 1  (부분취소 사용 가능 가맹점만 사용 가능)
    //         cancel_data.cancelAmt = ph_pay,          //취소 금액
    //         cancel_data.cancelMsg = '환불테스트',   //취소사유
    //         cancel_data.cancelPwd = '123456'        //취소비밀번호
            
    //     console.log('test', cancel_data);
    //     return JSON.stringify(cancel_data);

    // }

    //     //가상계좌 취소 요청값
    //     function vBankCancel(tid, moid, pay, vbank_code, vbank_num){
    //         let vBank_data = {}
    //             vBank_data.mid = 'pgaz369azm'
    //             vBank_data.licenseKey = 'fx/UT4tcb5VWxP24BXiwH0stdJnNxFf6GpdFdvd42Bmwnurd/1QgGPORTIfioiAVy/B0cx6j5spsDwAfGsleuQ=='
    //             vBank_data.tid = tid
    //             vBank_data.moid = moid
    //             vBank_data.amt = pay
    //             vBank_data.vbankBankCode = vbank_code
    //             vBank_data.vbankNum = vbank_num

    //         return JSON.stringify(vBank_data); 
    //     }
        
    //     //가상계좌 취소 요청
    //     function vBank(chk_pg_id, order_num, ph_pay, vbank_code, vbank_num){
    //         $.ajax({
    //             type : "POST",
    //             url : "https://api.innopay.co.kr/api/vbankCancel",
    //             async : true,
    //             data : vBankCancel(chk_pg_id, order_num, ph_pay, vbank_code, vbank_num),
    //             contentType: "application/json; charset=utf-8",
    //             dataType : "json",
    //             success : function(data){
    //                 // console.log(data);
    //             },
    //             error : function(data){
    //                 // console.log(data);   
    //             }
    //         });
    //     }

        

    // //결제 상태 구하기
    // function getCancelType(ph_id){
    //     let cancel_type;
    //     $.ajax({
    //         url : '/api/user/canceltype',
    //         method : 'get',
    //         dataType : 'json',
    //         async : false,
    //         data : {ph_id : ph_id},
    //         success: function(res){
    //             cancel_type = res.data[0].count
    //         }					
    //     });
    //     return cancel_type;
    // }


    //회원 좌석 예약 수정 예약 상태만 수정 함 결제 취소는 결제 관리 페이지에서 진행!!
    function updateAD(){
        let ph_id = JSON.parse( sessionStorage.getItem('row_data') ).CR_PH_ID;
        let id = JSON.parse( sessionStorage.getItem('row_data') ).CR_ID;
        let seat_num_list;
        if(selected_seats == 0){
            seat_num_list = $('#seat_num').val();
        }else{
            seat_num_list = selected_seats;
        }
        let update_data = {
            ct_id : $('#input_ct_id').data('ctid'),
            seatNums : seat_num_list,
            cr_cancel : $("#cr_cancel option:selected").attr('value'),
            py_scan : $("#py_scan option:selected").attr('value'),
            se_scan : $("#se_scan option:selected").attr('value'),
            cr_memo : $('#cr_memo').val(),
            cr_state : $("#cr_state option:selected").attr('value'),
            ph_id    : ph_id
        }

        // 예약 관리 페이지는 장차 좌석의 후불 결제 예약 및 좌석 별 취소 기능을 지원합니다.
        // 예약 관리 페이지에서는 2개 이상의 좌석을 예약시는 부분취소로 들어가며 가상계좌, 계좌이체는 부분취소가 불가능 합니다.
        // 계좌이체는 결제 관리 페이지에서 전체 취소를 통해 취소하세요.
        // 1개의 좌석을 예매한 경우는 취소를 진행하시면 전체취소로 들어갑니다.
        // 

        //전체, 부분 취소 나누기 ( 0 or 1)
        let cancelType;
        updateAPI(update_data,id);
        //결제를 취소할 때 이기 때문에 여기선 사용하지 않음
        // if($("#cr_cancel option:selected").attr('value') == 'Y'){
    
        
        //     //전체 부분 취소 나누는 부분  전체취소면 0 부분취소면 1
        //     if(getCancelType(JSON.parse( sessionStorage.getItem('row_data') ).PH_ID) == 1){
        //         cancelType = 0;
        //     }else{
        //         cancelType = 1;
        //     }
        //     // console.log('취소값! :',getCancelType(JSON.parse( sessionStorage.getItem('row_data') ).PH_ID));
        //     // 무통장 입금인 경우 관리자가 직접 고객의 환불계좌로 입금을 해야함
        //     // alert(cancelType)
        //     console.log('테스트 입니다 :', JSON.parse( sessionStorage.getItem('row_data') ));
        //     //결제상태
        //     let pay_state = JSON.parse( sessionStorage.getItem('row_data') ).CR_PayState;
        //     // 결제모듈
        //     let ph_type = JSON.parse( sessionStorage.getItem('row_data') ).PH_Type;
        //     // tid 거래 고유번호
        //     let t_id = JSON.parse( sessionStorage.getItem('row_data') ).PH_PG_ID;
        //     // moid 주문번호
        //     let moid = JSON.parse( sessionStorage.getItem('row_data') ).PH_OrderNumber;
        //     // 취소 타입
        //     let cancel_cd = JSON.parse( sessionStorage.getItem('row_data') ).PH_CodeType
        //     // 취소 금액
        //     let cancel_pay = JSON.parse( sessionStorage.getItem('row_data') ).CR_Price

        //     //신용카드 일때 전체, 부분 취소 다 가능
        //     if(ph_type == '신용카드'){
        //         innopayCancelAPI(t_id, cancel_cd, cancelType, cancel_pay, update_data, id)
        //     }
        //     //미입금 가상계좌 일때
        //     else if(ph_type == '무통장입금' && pay_state == '결제대기'){
        //         alert('결제 관리 페이지에서 입금대기를 주문취소로 변경해주세요');
        //         // innopayCancelAPI(t_id, cancel_cd, cancelType, cancel_pay, update_data, id)
        //     }else if(ph_type == '무통장입금' && pay_state == '결제완료'){
        //         alert('결제 관리 페이지에서 입금대기를 주문취소로 변경해주세요');
        //     }

        //     // if(ph_type == '무통장입금' && pay_state == '결제대기' && cancelType == 1){
        //     //     alert('무통장 입금의 부분취소는 관리자가 직접 해야합니다.')
        //     // }

        //     // if(JSON.parse( sessionStorage.getItem('row_data') ).PH_Type == '무통장입금' && cancelType == 1){
        //     //     alert('무통장 입금의 대한 부분취소는 환불은 고객에게 직접 환불금액을 이체해야 합니다.');
        //     // }
        //     // // 계좌이체의 경우 이노페이에서 부분취소를 별도로 지원하지 않음 되도록 전체취소를 이용
        //     // else 
            
        //     // if(JSON.parse( sessionStorage.getItem('row_data') ).PH_Type == '계좌이체' && cancelType == 1){
        //     //     alert('계죄이체는 부분취소가 불가능합니다. 전체 취소를 통해 진행해 주세요.');
        //     // }
        //     // // 그 외의 신용카드 및 간편결제 취소
        //     // else{
        //         //미입금 가상계좌 취소
        //         // vBankCancel(tid, moid, pay, vbank_code, vbank_num)
        //         // innopayCancelAPI(t_id, cancel_cd, cancelType, cancel_pay)
            
        // }
        // //취소 경우가 아닌 경우 일반 수정
        // else{
        //     updateAPI(update_data,id);
        // }
    }

    // //이노페이 결제 취소 API
    // function innopayCancelAPI(t_id, cancel_cd, cancelType, cancel_pay, update_data, id){
    //     $.ajax({
    //         type : "POST",
    //         url : "https://api.innopay.co.kr/api/cancelApi",
    //         async : true,
    //         data : cancelInfo(t_id, cancel_cd, cancelType, cancel_pay),
    //         contentType: "application/json; charset=utf-8",
    //         dataType : "json",
    //         success : function(data){
    //             console.log('결과값',data);
    //             if(data.resultCode == '2026'){
    //                 alert("취소 오류 이노페이 고객센터에 문의해 주세요.");
    //             }else{
                    
    //                 updateAPI(update_data,id);
    //             }
                
        
    //         },
    //         error : function(data){
    //             alert("취소 오류 이노페이 고객센터에 문의해 주세요.");
    //         }
    //     });
    // }



    //업데이트 api 취소 및 좌석 변경 포함
    function updateAPI(update_data,id){
        console.log('매개변수 :', update_data);
        console.log('매개변수 :', id);
        let form_data = new FormData(document.forms[0]);
        for ( let i in update_data) form_data.append(i, update_data[i]);

        let api_url  = '/api/reservation/'+id;

        $.ajax({
            dataType : 'JSON',
            type : "PUT",
            url : api_url,
            data : update_data,
            success : function (res) {
                console.log('ajax result');
                console.log(res);
                // alert('결제 취소 완료');
                if(res.data == '304'){
                    alert('변경할 좌석은 한좌석만 선택해 주세요.');
                }
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
        let search_res_day_instance = $("#object-search-popup .search_res_day").dxDateBox("instance"),
        search_py_start_instance = $("#object-search-popup .search_py_start").dxDateBox("instance"),
        search_se_start_instance = $("#object-search-popup .search_se_start").dxDateBox("instance");
        search_res_day_instance.reset();
        search_py_start_instance.reset();
        search_se_start_instance.reset();
        $('#search_user_name').val('');
        $('#search_user_phone').val('');
        $('#search_user_brand').val('');
        $('#search_user_addr1').val('');
        $("#search_user_addr2").val('');
        // $("#object-search-popup .select2").val(null).trigger('change');
        $("#search_ct_id").val('null');
        $('#search_seat_num').val('');
        $('#search_seat_price').val('');
        $('#search_cr_cancel').val('null');
        $('#search_py_scan').val('null');
        $('#search_se_scan').val('null');
        $('#search_cr_memo').val('');
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
            search_user_name : $("#search_user_name").val(),
            search_user_phone : $("#search_user_phone").val(),
            search_user_brand : $('#search_user_brand').val(),
            search_user_addr1 : $("#search_user_addr1").val(),
            search_user_addr2 : $("#search_user_addr2").val(),
            search_ct_id : $("#search_ct_id option:selected").attr('value'),
            search_seat_num : $('#search_seat_num').val(),
            search_seat_price : $('#search_seat_price').val(),
            search_res_day : $("#object-search-popup .search_res_day").dxDateBox("instance").option().value,
            search_py_start : $("#object-search-popup .search_py_start").dxDateBox("instance").option().value,
            search_se_start : $("#object-search-popup .search_se_start").dxDateBox("instance").option().value,
            search_cr_cancel : $("#search_cr_cancel option:selected").attr('value'),
            search_py_scan : $("#search_py_scan option:selected").attr('value'),
            search_se_scan : $("#search_se_scan option:selected").attr('value'),
            search_cr_memo : $('#search_cr_memo').val()
            
        };

        $.ajax({
            type : "GET",
            dataType : 'JSON',
            url : '/api/reservation?type=search',
            data : condition_data,
            success : function (res) {
                
                $("#mgmt-table").dxDataGrid({
                    dataSource: res.data
                });
            }
        })
    }


    //좌석금액 불러오기
    var selected_seats = [];
    var selected_seats_cnt = 0;
    var seatPrice = 0;
    let now_location = 'default';

    function openBus(busSeat,type) {
        console.log('busset',busSeat);
        console.log('type',type);
        $('.seatCharts-container').css('background-color','white');
        var firstSeatLabel = 1;
        let user_id = busSeat;
        let $seat_map;
        let seat_type;
        // console.log('user-id',user_id);
        if(type === 'user-seat'){
            $seat_map = $('.seat-map');
            seat_type = 'user-seat'
        }else{
            $seat_map = $('.res-seat-map');
            seat_type = 'res-seat'
        }
        

        $seat_map.seatCharts({
                map: [
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'ee_ee',
                    'eeeee',
                ],
                seats: {
                    e: {

                        classes: '일반', //your custom CSS class
                        category: '일반'
                    }

                },
                naming: {
                    top: false,
                    getLabel: function (character, row, column) {
                        return firstSeatLabel++;
                    },
                },
                click: function () {
                    // $('#seat_num').text(' ');
                    // flushSeat(user_id,type);
                    if (this.status() == 'available') {

                        selected_seats_cnt = $seat_map.find('selected').length + 1;
                        selected_seats.push(this.settings.label);
                        $('#seat_num').val('　'.concat(selected_seats.join('번, ') + ((selected_seats.length > 0) ? '번' : '')));
                        return 'selected'
                    } 
                    else if (this.status() == 'selected') {

                        selected_seats_cnt = $seat_map.find('selected').length - 1;
                        let idx = selected_seats.indexOf(this.settings.label);
                                selected_seats.splice(idx, 1);

                        $('#seat_num').val('　'.concat(selected_seats.join('번, ') + ((selected_seats.length > 0) ? '번' : '')));


                        // console.log('현재 수',$('#seat_num').val());
                        if($('#seat_num').val() == "　"){
                            let select_ct_id = sessionStorage.getItem('select_ct_id');
                            $('#seat_num').val(select_ct_id);
                        }
                        
                        return 'available';
                    } 
                    //스캔 되지 않은 예매된 좌석
                    else if (this.status() == 'unavailable') {
                        return 'unavailable';
                    } else {

                        return this.style();
                    }
                }
            });

        //현재 예약된 자석
        // scanSeatList();
        flushSeat(user_id,type);
    }

    //예약된 좌석 활성화
    function flushSeat(seat_number,type) {
        if(type === 'user-seat'){
            let $seat = $('.seat-map')
            var sc = $seat.seatCharts();
            sc.find('e.selected').status('available');
            let seat_id_list;
        
            seat_id_list = (getSeatId(seat_number));
            sc.find('unavailable').status('available');
            sc.status(seat_id_list, 'unavailable');
        }else{
            var sc = $('.res-seat-map').seatCharts();
            selected_seats = [];
            selected_seats_cnt = 0;
            
            sc.find('e.selected').status('available');
            // 데이터 가져와서 예약된 좌석 상태 설정.
            // var ct_id = sessionStorage.getItem('ct_id');
            let ct_id = seat_number;
            $.ajax({
                dataType: "json",
                method: "GET",
                url: "/api/useSeat/" + ct_id
            }).done((res) => {
                let seat_id_list = [];
                res.data.map((seat_num) => {
                    seat_id_list.push(getSeatId(seat_num));
                });
                // console.log('seat!!',seat_id_list);
                sc.find('unavailable').status('available');
                sc.status(seat_id_list, 'unavailable');
            });
        }

    }



    // 45인승 기준 seatId 가져오기
    function getSeatId(seat_num) {
        if (seat_num <= 45 && seat_num > 0) {

            let seat_id = "1_1";
            let row = '',
                column = '';

            if (seat_num > 40) {
                row = 11;
                column = seat_num % 10;
            } else {
                if ((seat_num % 4) === 0) {
                    row = Number.parseInt(seat_num / 4);
                    column = 4;
                } else {
                    row = (Number.parseInt(seat_num / 4)) + 1;
                    column = seat_num % 4;
                }

                if (column >= 3) column += 1;
            }
            seat_id = row + "_" + column;
            return seat_id;
        } else {
            return null;
        }
    }
    //좌석현황 모달 닫기
    function seatClose(){
        $("#object-seat-popup").hide();   
    }
    function ResseatClose(){
        $("#object-res-seat-popup").hide();
    }


    //좌석번호 클릭 시 좌석 창 띄우기
    function changeSeat(){
        let type = $('#seat_num').data('type');
        let ct_id = $('#seat_num').data('ctid');
        console.log('선택 값 :', type, ct_id);
        
        if(ct_id == ''){
            alert('차량을 먼저 선택해 주세요');
            return false;
        }
        //모달창 띄우기
        $('#object-res-seat-popup').css('left','50%');
        $('#object-res-seat-popup').css('top','10%');
        $("#object-res-seat-popup").show();
        openBus(ct_id,type);
    }

    //배차 클릭시 모달창 띄우고 셀렉트 박스 제거
    var dummyOption;
    function seatModalOpen(obj){
        var selectedOption = obj.options[obj.selectedIndex];

        console.log('test',selectedOption);
        let res_ct_id = selectedOption.value;
        let res_ct_text = selectedOption.text;
        let res_ct_price = selectedOption.dataset.price;
        let type = 'res-user-seat'

        //셀렉트 박스 초기화
        obj.selectedIndex = 0;

        //셀렉트 박스 제거 후 인풋 박스로 교체
        let input_html = "<input type='text' id='input_ct_id' class='long_box' placeholder='차량 선택' onclick='openSelect()' readonly>"
        $('#ct_id').select2('destroy');
        $('#ct_id').before(input_html);
        $('#input_ct_id').val('　'+res_ct_text);
        $('#input_ct_id').data('ctid',res_ct_id);
        $('#input_ct_id').data('price',res_ct_price);
        $('#ct_id').remove();
        $('#title_info').text('　'+res_ct_text);

        console.log('배차 클릭시 좌석현황',res_ct_id);
        $('#seat_num').data('ctid',res_ct_id);
        $('#seat_num').data('type',type);
        // openBus(res_ct_id,type);
    
    }

    function openSelect(){
        // $('#input_ct_id').remove();
        // alert('셀렉트 박스 추가 해 야 함')

        //시간 설정 변수
        let local_date = new Date();
        let local_year = local_date.getFullYear();
        let local_month = local_date.getMonth()+1 < 10 ? '0'+Number(local_date.getMonth()+1) : Number(local_date.getMonth()+1);
        let local_day = local_date.getDate() < 10 ? '0'+local_date.getDate() : local_date.getDate();
        let local_hour = local_date.getHours() < 10 ? '0'+local_date.getHours() : local_date.getHours();
        let local_minutes = local_date.getMinutes() < 10 ? '0'+local_date.getMinutes() : local_date.getMinutes();
        let local_times = local_year+'-'+local_month+'-'+local_day+' '+local_hour+':'+local_minutes;
        //상세정보 운송사 셀렉트 박스
        let default_html = "<select class='long_box select2' id='ct_id' aria-readonly='true' onchange='seatModalOpen(this)' ><option></option></select>"
        $('#input_ct_id').after(default_html);
        $('#input_ct_id').remove();
        $('#ct_id').empty();
        //검색창 운송사 셀렉트 박스
        let search_default_html = '<option value="null">배차 선택</option>';
        $.ajax({
            method: "get",
            dataType : "JSON",
            async : false,
            url: "/api/vehicle/list",
            success: function (res){
                $('#ct_id').append(search_default_html);
                $("#ct_id").select2(
                    {
                        placeholder: '운송사 선택',
                        width: 'calc(77% - 30px)'
                    }
                );
                $("#search_ct_id").select2(
                    {
                        placeholder: '운송사 선택',
                        // data: brand_list,
                        width: 'resolve'
                    }
                );

                // debugger;
                for (let i=0; i<res.data.length; i++){
                    let html;
                    //이전 예매정보일때
                    console.log('test,',res.data[i].CT_DepartureTe);
                    if((res.data[i].dept < local_times) == false){
                        // debugger;
                        console.log('출발시간 :',res.data[i].CT_DepartureTe);
                        console.log('현재시간 :', local_times);
                        html = "<option value="+res.data[i].CT_ID+" data-price="+res.data[0].CY_SeatPrice+" >"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
                    }else{
                        html = "<option value="+res.data[i].CT_ID+" data-price="+res.data[0].CY_SeatPrice+" disabled = 'disabled'>"+res.data[i].B_NAME+" "+res.data[i].deptTime+"시</option>";
                    }
                    $('#ct_id').append(html);
                }
            }
        });
    }
  

