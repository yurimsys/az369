const database_json = 
{
    "development" : 
        {
            "host"     : "localhost",
            "user"     : "root",
            "password" : "qw12qw12(",
            "database" : "yurimsys12",
            "port"     : "3306",
            "dateStrings"     : "date"
        },
    "stage" : 
        {
            "host"     : "nodejs-005.cafe24.com",
            "user"     : "yurimsys12",
            "password" : "qw12qw12(",
            "database" : "yurimsys12",
            "port"     : "3306",
            "dateStrings"     : "date"
        },
    "production" : 
        {
            "host"     : "nodejs-005.cafe24.com",
            "user"     : "yurimsys12",
            "password" : "qw12qw12(",
            "database" : "yurimsys12",
            "port"     : "3306",
            "dateStrings"     : "date"
        }
}

const env = process.env.NODE_ENV || "production";

module.exports = database_json[env];
