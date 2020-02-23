// set Environment
if(process.argv.length > 2){
    let env = process.argv[2];
    if(env == "dev"){
        process.env.NODE_ENV = "development";
    } else if(env == "stage"){
        process.env.NODE_ENV = "stage";
    }
} else{
    process.env.NODE_ENV = "production";
}