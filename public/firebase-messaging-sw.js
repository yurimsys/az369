// importScripts("/__/firebase/7.16.0/firebase-app.js");
// importScripts("/__/firebase/7.16.0/firebase-messaging.js");
// importScripts("/__/firebase/init.js");

// const { ClientRequest } = require("http");

// const messaging = firebase.messaging();
    importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-app.js');
    importScripts('https://www.gstatic.com/firebasejs/7.18.0/firebase-messaging.js');

    //메세지 발신자 정보
    const config = {
        apiKey: "AIzaSyDy88Mo-KWvj_WNnlprZr1zKhq21wZ1BPE",
        authDomain: "fir-yr.firebaseapp.com",
        databaseURL: "https://fir-yr.firebaseio.com",
        projectId: "fir-yr",
        storageBucket: "fir-yr.appspot.com",
        messagingSenderId: "599369257577",
        appId: "1:599369257577:web:b57b36079d6ab7c98ec8f8",
        measurementId: "G-KKSCT6H5YJ"
    };

    //파이어베이스 정보 입력
    firebase.initializeApp(config);

    const messaging = firebase.messaging();

    //백그라운드 실행을 위한 함수 크롬 종료시에는 작동을 하지않고 보낸 메세지는 크롬 실행후 5초 후 메세지 수신됨
    messaging.setBackgroundMessageHandler(function(payload){
        console.log('Background payload :',payload);
        //제목에 표시할 값
        const title = payload.data.title;
        //내용에 표시할 값
        const options = {
            body: payload.data.message,
            icon: payload.data.icon,
            click_action : payload.data.click_action,
            //알림 창 클릭후 보내줄 데이터 값
            data: {click_action:payload.data.click_action}
        };
        //받은 데이터 메세지창에 출력
        return self.registration.showNotification(title,options);
    });


    // 알림메세지 수신 후 클릭 이벤트
    self.addEventListener('notificationclick', function(event) {
        event.notification.close();

        console.log('event',event);
        console.log('clients :', clients);

        var promise = new Promise(function(resolve) {
            setTimeout(resolve, 1000);
        }).then(function() {
            //위에서 넘겨받은 데이터값으로 새창 띄우기
            return clients.openWindow(event.notification.data.click_action);
        });
    
        //promise 실행     
        console.log('promise',promise);
        // let qqq = document.getElementById('test1')
        // console.log('qqq',qqq);
        event.waitUntil(promise);

    });


    // data: {click_action:payload.data.click_action}

    // self.addEventListener('push', function(event) {
    //     // event.notification.close();
    //     console.log('event',event);
    //     console.log('client',clients);
    //     console.log('client',event.notification);
    //     //메세지 창
    //     const payload = event.data ? event.data.text() : 'no payload';
    //     const fcm_data = JSON.parse(payload).data
    //     console.log('payload',payload);
    //     event.waitUntil(
    //         self.registration.showNotification('ServiceWorker Cookbook', {
    //             body: fcm_data.message,
    //             icon: fcm_data.icon,
    //             data:{
    //                 url: fcm_data.click_action
    //             }
    //         })
    //     );
        
    //     var promise = new Promise(function(resolve) {
    //         setTimeout(resolve, 1000);
    //     }).then(function() {
    //         // return the promise returned by openWindow, just in case.
    //         // Opening any origin only works in Chrome 43+.
    //         // return clients.openWindow("https://google.com");
    //         // return clients.openWindow(fcm_data.click_action);
    //         return clients.openWindow(event.notification.data.click_action);
    //     });
    
    //     // Now wait for the promise to keep the permission alive.
    //     console.log('primise',promise);
    //     event.waitUntil(promise);
    // });