var StringDecoder = require('string_decoder').StringDecoder;
var semver = require('semver');
var request = require('request');
var npm = require('npm');

var runIfLatest = function(run) {

    process.stdout.write("****** Checking for Thunderbird updates... ");

    var localVersion = require("./../package.json")["version"];
    var jsonResp;
    request.get("http://registry.npmjs.org/thunderbird/latest", function(err, body) {
        if (err) {
            process.stdout.write("Error fetching version!", err);
            process.exit(1);
        }
        else {
            jsonResp = JSON.parse(body.body)
            if (jsonResp && jsonResp["version"]) {
                if (semver.lt(localVersion, jsonResp["version"])) {
                    process.stdout.write("Updating! ******\n");
                    npm.load({}, function(er) {
                        if (er) {
                            console.log("Error loading npm!", er);
                        }
                        npm.commands.update(["-g", "thunderbird"], function(err) {
                            if (err) {
                                console.log("Error updating!", err);
                            }
                            console.log(">>>>>> Update finished, re-run the new version! <<<<<<");
                            process.exit(1);
                        })
                    });
                } else {
                    process.stdout.write("Up to date. ******\n");
                    run();
                }
            } else {
                console.log("Warning: unable to connect to npm. Skipping version check.");
                run();
            }
        }

    });
}

module.exports = runIfLatest;