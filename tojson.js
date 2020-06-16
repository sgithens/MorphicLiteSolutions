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
    for (var solutionIndex = 0, solutionCount = solutions.length; solutionIndex < solutionCount; ++solutionIndex){
        var solution = solutions[solutionIndex];
        for (var settingIndex = 0, settingCount = solution.settings.length; settingIndex < settingCount; ++settingIndex){
            var setting = solution.settings[settingIndex];
            if (setting.handler.type == HandlerTypes.client){
                setting.handler.solution = solution.id;
                setting.handler.preference = setting.name;
            }
        }
    }
}

function verifySolutions(solutions){
    var ids = new Set();
    for (var i = 0, l = solutions.length; i < l; ++i){
        var solution = solutions[i];
        if (!solution.id){
            throw new Error("Missing solution id for solution index " + i);
        }
        if (ids.has(solution.id)){
            throw new Error("Duplicate solution id " + solution.id);
        }
        ids.add(solution.id);
        verifySolution(solution);
    }
}

function verifySolution(solution){
    if (!solution.settings){
        throw new Error("Missing settings for solution " + solution.id);
    }
    var names = new Set();
    for (var i = 0, l = solution.settings.length; i < l; ++i){
        var setting = solution.settings[i];
        if (!setting.name){
            throw new Error("Missing setting name for " + solution.id + " setting index " + i);
        }
        if (names.has(setting.name)){
            throw new Error("Duplicate setting name " + solution.id + "." + setting.name);
        }
        names.add(setting.name);
        verifySetting(solution, setting);
    }
}

function verifySetting(solution, setting){
    var key = solution.id + "." + setting.name;
    if (!allowedSettingTypes.has(setting.type)){
        throw new Error("Invalid type (" + setting.type + ") for " + key);
    }
    if (setting.default === undefined){
        throw new Error("Missing default for " + key);
    }
    if (!setting.handler){
        throw new Error("Missing setting handler for " + key);
    }
    verifyHandler(solution, setting, setting.handler);
}

var allowedSettingTypes = new Set([
    "string",
    "integer",
    "double",
    "boolean",
    "files"
]);

function verifyHandler(solution, setting, handler){
    var key = solution.id + "." + setting.name;
    var verifier = handlerVerifiers[handler.type];
    if (!verifier){
        throw new Error("Invalid handler type (" + handler.type + ") for " + key);
    }
    verifier(solution, setting, handler);
}

var handlerVerifiers = {
    "org.raisingthefloor.morphic.client": function(solution, setting, handler){
    },
    "com.microsoft.windows.registry": function(solution, setting, handler){
        var key = solution.id + "." + setting.name;
        if (!handler.key_name){
            throw new Error("Missing registry key name for " + key);
        }
        if (!handler.value_name){
            throw new Error("Missing registry value name for " + key);
        }
        if (!handler.value_type){
            throw new Error("Missing registry value type for " + key);
        }
        var allowedSettingTypes = registryValueTypeMap[handler.value_type];
        if (allowedSettingTypes === undefined){
            throw new Error("Invalid registry value type (" + handler.value_type + ") for " + key);
        }
        if (!allowedSettingTypes.has(setting.type)){
            throw new Error("Incompatible setting and registry types for " + key);
        }
    },
    "com.microsoft.windows.system": function(solution, setting, handler){
        var key = solution.id + "." + setting.name;
        if (!handler.setting_id){
            throw new Error("Missing system setting id for " + key);
        }
        if (!handler.value_type){
            throw new Error("Missing system setting value type for " + key);
        }
        var allowedSettingTypes = systemValueTypeMap[handler.value_type];
        if (allowedSettingTypes === undefined){
            throw new Error("Invalid system setting value type (" + handler.value_type + ") for " + key);
        }
        if (!allowedSettingTypes.has(setting.type)){
            throw new Error("Incompatible setting and system types for " + key);
        }
        if (setting.type == "integer" && handler.value_type == "string"){
            if (!handler.integer_map){
                throw new Error("Integer map is required for " + key);
            }
        }
    },
    "com.microsoft.windows.ini": function(solution, setting, handler){
        var key = solution.id + "." + setting.name;
        if (!handler.filename){
            throw new Error("Missing ini filename name for " + key);
        }
        if (!handler.section){
            throw new Error("Missing ini section for " + key);
        }
        if (!handler.key){
            throw new Error("Missing ini key name for " + key);
        }
    },
    "com.microsoft.windows.files": function(solution, setting, handler){
        var key = solution.id + "." + setting.name;
        if (!handler.root){
            throw new Error("Missing root folder for " + key);
        }
        if (!handler.files){
            throw new Error("Missing files list for " + key);
        }
        if (setting.type != "files"){
            throw new Error("Files handler can only be used on settings of type 'files', at " + key);
        }
    }
};

var registryValueTypeMap = {
    "string": new Set(["string"]),
    "expandString": new Set(["string"]),
    "dword": new Set(["integer", "boolean"]),
    "qword": new Set(["integer"])
};

var systemValueTypeMap = {
    "string": new Set(["string", "integer"]),
    "boolean": new Set(["boolean"]),
    "integer": new Set(["integer"]),
    "idPrefixedEnum": new Set(["integer"])
};

fs.readFile(input, 'utf-8', function(err, contents){
    if (err){
        console.error(err);
        return;
    }
    var root = yaml.parse(contents);
    verifySolutions(root.solutions);
    addInfoToClientHandlers(root.solutions);
    process.stdout.write(JSON.stringify(root.solutions, null, 2));
    process.stdout.write("\n");
});