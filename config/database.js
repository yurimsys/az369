const database_json = 
{
    "development" : {
        mysql : {
            "host"     : "192.168.0.78",
            "user"     : "root",
            "password" : "qw12qw12(",
            "database" : "yurimsys12",
            "port"     : "3306",
            "dateStrings"     : "date"
        },
        mssql : {
            "user"      : "sa",
            "password"  : "qw12qw12)",
            "server"    : "yurimsys.iptime.org",
            "port"      : 14331,
            "database"  : "YR_SIGNAGE",
            "options"   : {
                "useUTC" : false,
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
            "dateStrings"     : "date"
        }
    }
}

const env = process.env.NODE_ENV || "production";
module.exports = database_json[env];
