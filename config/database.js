const database_json = 
{
    "development" : {
        //기존 DB 로컬 정보
        // mysql : {
        //     "host"     : "192.168.0.78",
        //     "user"     : "root",
        //     "password" : "qw12qw12(",
        //     "database" : "yurimsys12",
        //     "port"     : "3306",
        //     "dateStrings"     : "date"
        // },        
        mysql : {
            "host"     : "192.168.0.132",
            "user"     : "root",
            "password" : "qw12qw12(",
            "database" : "az369_dev",
            "port"     : "3306",
            "dateStrings"     : "date",
            "multipleStatements" : "true"
        },
        mssql : {
            "user"      : "sa",
            "password"  : "qw12qw12)",
            "server"    : "yurimsys.iptime.org",
            "port"      : 14331,
            "database"  : "YR_SIGNAGE",
            "timezone"  : 'utc',
            "options"   : {
                "encrypt" : false
            }
        }
    },  
    "production" : {
        mysql : {
            "host"     : "nodejs-005.cafe24.com",
            "user"     : "yurimsys12",
            "password" : "qw12qw12(",
            "database" : "yurimsys12",
            "port"     : "3306",
            "dateStrings"     : "date",
            "multipleStatements" : "true"
        },
        mssql : {
            "user"      : "sa",
            "password"  : "qw12qw12)",
            "server"    : "yurimsys.iptime.org",
            "port"      : 14331,
            "database"  : "YR_SIGNAGE",
            "timezone"  : 'utc',
            "options"   : {
                "encrypt" : false
            }
        }
    }
}

const env = process.env.NODE_ENV || "production";
module.exports = database_json[env];
