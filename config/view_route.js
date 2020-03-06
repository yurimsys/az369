
const path = require('path');

module.exports = (req,res,next) => {
    let base_path  = "";
    let path_list =req.path.split("/");
    if(req.path.split("/").length > 2) base_path = path_list[1];
    if( base_path == 'admin'){
        req.app.set('views', path.join( path.dirname(__dirname), 'views', 'admin'));
    } else {
        req.app.set('views', path.join( path.dirname(__dirname), 'views'));
    }

    next();
}