// Copyright 2020 Raising the Floor - International
//
// Licensed under the New BSD license. You may not use this file except in
// compliance with this License.
//
// You may obtain a copy of the License at
// https://github.com/GPII/universal/blob/master/LICENSE.txt
//
// The R&D leading to these results received funding from the:
// * Rehabilitation Services Administration, US Dept. of Education under
//   grant H421A150006 (APCP)
// * National Institute on Disability, Independent Living, and
//   Rehabilitation Research (NIDILRR)
// * Administration for Independent Living & Dept. of Education under grants
//   H133E080022 (RERC-IT) and H133E130028/90RE5003-01-00 (UIITA-RERC)
// * European Union's Seventh Framework Programme (FP7/2007-2013) grant
//   agreement nos. 289016 (Cloud4all) and 610510 (Prosperity4All)
// * William and Flora Hewlett Foundation
// * Ontario Ministry of Research and Innovation
// * Canadian Foundation for Innovation
// * Adobe Foundation
// * Consumer Electronics Association Foundation

var yaml = require('yaml');
var fs = require('fs');
var input = process.argv[2];

if (!input){
    process.stderr.write("Usage: node tojson.js <registry>.yaml\n");
    process.exit(-1);
}

var HandlerTypes = {
    client: "org.raisingthefloor.morphic.client"
};

function addInfoToClientHandlers(solutions){
    for (var solutionIndex = 0, l = solutions.length; solutionIndex < l; ++solutionIndex){
        var solution = solutions[solutionIndex];
        for (var settingIndex = 0, l = solution.settings.length; settingIndex < l; ++settingIndex){
            var setting = solution.settings[settingIndex];
            if (setting.handler.type == HandlerTypes.client){
                setting.handler.solution = solution.id;
                setting.handler.preference = setting.name;
            }
        }
    }
}

fs.readFile(input, 'utf-8', function(err, contents){
    if (err){
        console.error(err);
        return;
    }
    var root = yaml.parse(contents);
    addInfoToClientHandlers(root.solutions);
    process.stdout.write(JSON.stringify(root.solutions, null, 2));
    process.stdout.write("\n");
});