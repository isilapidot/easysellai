const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

fs.readFile('content.js', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
        return;
    }
    var obfuscationResult = JavaScriptObfuscator.obfuscate(data);
    fs.writeFile('content_copy.js', obfuscationResult.getObfuscatedCode(), function(err) {
        if(err) {
            console.error(err);
        } else {
            console.log("The file was saved!");
        }
    }); 
});
