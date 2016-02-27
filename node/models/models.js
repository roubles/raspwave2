var fs = require('fs');

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var fqn = dir + '/' + files[i];
        var name = files[i];
        if (fs.statSync(fqn).isDirectory()){
            getFiles(fqn, files_);
        } else {
            if (endsWith(name, ".js")) {
                name = name.slice(0, -3)
                console.log('Found model: ' + name)
                files_.push(name);
            }
        }
    }
    return files_;
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var models = getFiles("./models")
console.log(models)
//module.exports = models
module.exports = ['robot']
