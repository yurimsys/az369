const path  = require('path');

module.exports = {
    aligo : {
        auth : {
            key: 'g62mfj51n4pav13bf7u2m5t3p2ioydrk',
            user_id: 'yurimsys11',
            testmode_yn : (process.env.NODE_ENV === "development") ? 'Y' : 'N',
            sender : "07070920811"
        }
    },
    message : {
        phone_auth : `[AZ369] 본인확인 인증번호 [#auth_number#]를 입력해주세요.`
    },
    mail_address : {
        ceo : 'hb.sim@yurim-info.com',
        company : 'post@yurim-info.com',
        dev : 'dev.yurimsys@gmail.com'
    },
    account : {
        mail : {
            id : 'yr.hb.sim@gmail.com',
            pw : 'go121212!!'
        }
    },
    enc_salt : '!@#yurimsys#@!',
    path : {
        //사이니지 광고 이미지
        ad_image : path.join(__dirname, '..', '/public/img/ad'),
        //사이니지 매장 이미지
        bs_image : path.join(__dirname, '..', '/public/img/sign_brand'),
        //공지사항 이미지
        info_image : path.join(__dirname, '..', '/public/img/info')
    }
}