
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
    }
}