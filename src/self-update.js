var StringDecoder = require('string_decoder').StringDecoder;
var semver = require('semver');
var request = require('request');

var runIfLatest = function(run) {

    process.stdout.write("****** Checking for Thunderbird updates... ");

    var localVersion = require("./../package.json")["version"];
    var jsonResp;
    request.get("http://registry.npmjs.org/thunderbird/latest", function(err, body) {
        if (err) {
            process.stdout.write("Error!", err);
            process.exit(1);
        }
        else {
            jsonResp = JSON.parse(body.body)
            if (jsonResp && jsonResp["version"]) {
                if (semver.lt(localVersion, jsonResp["version"])) {
                    //update
                } else {
                    process.stdout.write("Up to date. ******\n");
                }
            } else {
                console.log("Warning: unable to connect to npm. Skipping version check.");
                run();
            }
        }

    });
}

module.exports = runIfLatest;
