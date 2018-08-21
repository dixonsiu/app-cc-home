var am = {};

addLoadScript = function (scriptList) {
    scriptList.push("https://cdnjs.cloudflare.com/ajax/libs/jquery-url-parser/2.3.1/purl.min.js");
    scriptList.push("https://cdn.jsdelivr.net/npm/jdenticon@1.8.0");
    scriptList.push("https://cdnjs.cloudflare.com/ajax/libs/cropper/3.1.4/cropper.min.js");
    return scriptList;
}
addLoadStyleSheet = function (styleList) {
    styleList.push("https://demo-fi.personium.io/HomeApplication/__/appcell-resources/css/cropper/cropper.min.css");
    styleList.push("https://demo-fi.personium.io/HomeApplication/__/appcell-resources/css/cropper/cropper_circle_mask.css");
    return styleList;
}

function init() {
    am.initAppMarket();
};

am.initAppMarket = function () {
    ut.loadStyleSheet();
    ut.loadScript(function () {
        let tempMyProfile = JSON.parse(sessionStorage.getItem("myProfile")) || {};
        let isDemo = (tempMyProfile.IsDemo || false);

        if (isDemo) {
            demoSession = JSON.parse(sessionStorage.getItem("demoSession"));
            demo.addTutorialDialogAppMarket();
            demo.showModal("#modal-applicationlist-start");
        }

        cm.i18nSetBox();

        //cm.createTitleHeader(false, false);
        //cm.createSideMenu();
        //cm.createBackMenu("main.html");
        cm.setTitleMenu("AppMarket");

        /*    if (isDemo) {
                demo.initSettings();
            } else {
                st.initSettings();
            }
        */
        $("#dashboard").append('<div class="panel list-group toggle-panel" id="toggle-panel1"></div>');

        if (isDemo) {
            demo.createApplicationList();
        } else {
            am.createApplicationList();
        }

        // menu-toggle
        $(".appInsMenu").css("display", "none");
        $("#appInsToggle.toggle").on("click", function () {
            $(this).toggleClass("active");
            $(".appInsMenu").slideToggle();
        });
    });
}

am.createApplicationList = function() {
    var html = '<div class="panel-body" id="app-panel"><section class="dashboard-block" id="installed-app"><h2 data-i18n="Installed"></h2><div id="insAppList1"></div></section><section class="dashboard-block" id="all-app"><h2 data-i18n="ApplicationList"></h2><div id="appList1"></div></section></div>';
    $("#dashboard").append(html);
    // install application list
    personium.getBoxList(cm.getMyCellUrl(), cm.getAccessToken()).done(function(data) {
        var insAppRes = data.d.results;
        insAppRes.sort(function(val1, val2) {
            return (val1.Name < val2.Name ? 1 : -1);
        })
        am.insAppList = new Array();
        am.insAppBoxList = new Array();
        for (var i in insAppRes) {            
            var schema = insAppRes[i].Schema;
            if (schema && schema.length > 0) {
                am.insAppList.push(schema);
                // hotfix for not showing HomeApplication/Cell Manager's box inside a data subject's cell
                if (!_.contains(cm.boxIgnoreList, insAppRes[i].Schema)) {
                    am.insAppBoxList.push(insAppRes[i].Name);
                };
            }
        }
        am.dispInsAppListSetting();

        // application list
        personium.getApplicationList().done(function(data) {
            am.dispApplicationList(data);
        }).fail(function(data) {
            alert(data);
        });
    });
};
am.dispInsAppListSetting = function() {
    $("#insAppList1").empty();
    am.nowInstalledID = null;
    for (var i in am.insAppList) {
        am.dispInsAppListSchemaSetting(am.insAppList[i], am.insAppBoxList[i], i);
    }
};
am.dispInsAppListSchemaSetting = function(schema, boxName, no) {
    var profTrans = "profTrans";
    var dispName = profTrans + ":" + boxName + "_DisplayName";
    var imgName = profTrans + ":" + boxName + "_Image";
    personium.getBoxStatus(cm.getMyCellUrl(), cm.getAccessToken(), boxName).done(function (data) {
        var status = data.status;
        var html = '';
        if (status.indexOf('ready') >= 0) {
            // ready
            html = '<a href="#" id="insAppNo_' + no + '" class="ins-app-icon" onClick="am.dispViewInsApp(\'' + schema + '\', \'' + boxName + '\')"><img data-i18n="[src]' + imgName + '" src="" class="ins-app-icon"></a><div id="appid_' + no + '" class="ins-app-name" data-i18n="' + dispName + '"></div>';
        } else if (status.indexOf('progress') >= 0) {
            // progress
            html = '<a href="#" id="insAppNo_' + no + '" class="ins-app-icon"><img data-i18n="[src]' + imgName + '" src="" class="ins-app-icon"></a><div id="appid_' + no + '" class="ins-app-name" data-i18n="' + dispName + '"></div><div id="nowInstallParent_' + no + '" class="progress progress-striped active"><div name="nowInstall" id="nowInstall_' + no + '" class="progress-bar progress-bar-success" style="width: ' + data.progress + ';"></div></div>';
            if (am.nowInstalledID === null) {
                am.nowInstalledID = setInterval(am.checkBoxInstall, 1000);
            }
        } else {
            // failed
            html = '<a href="#" class="ins-app-icon"><img data-i18n="[src]' + imgName + '" src="" class="ins-app-icon"></a><div><span id="appid_' + no + '" class="ins-app-name" data-i18n-"' + dispName + '"></span>(<font color="red"> ! </font>)</div>';
        }

        $("#insAppList1").append('<a class="ins-app" id="ins-app_' + no + '"></a>');
        var insAppId = 'ins-app_' + no;
        $('#' + insAppId).append(html).localize();
    });
};
am.checkBoxInstall = function () {
    var elements = document.getElementsByName("nowInstall");
    if (_.isEmpty(elements)) {
        clearInterval(am.nowInstalledID);
    } else {
        _.each(elements, function(ele, i, list) {
            let no = ele.id.split('_')[1];
            am.updateProgress(no, ele.id);
        });
    }
};
am.updateProgress = function (no, id) {
    cm.getBoxStatus(am.insAppBoxList[no]).done(function (data) {
        var status = data.status;
        if (status.indexOf('ready') >= 0) {
            $("#nowInstallParent_" + no).remove();
            $("#insAppNo_" + no).on('click', function () { am.dispViewInsApp(am.insAppList[no], am.insAppBoxList[no]) });
            if (typeof (ha) != "undefined") {
                ha.dispInsAppList();
            }
        } else if (status.indexOf('progress') >= 0) {
            $('#' + id).css("width", data.progress);
        } else {
            $('#nowInstallParent_' + no).remove();
            $('#appid_' + no).append('(<font color="red"> ! </font>)');
        }
        var elements = document.getElementsByName("nowInstall");
        if (elements.length = 0) {
            clearInterval(am.nowInstalledID);
        }
    });
};
am.dispApplicationList = function(json) {
    $("#appList1").empty();
    var results = json.d.results;
    results.sort(function(val1, val2) {
      return (val1.SchemaUrl < val2.SchemaUrl ? 1 : -1);
    })
    for (var i in results) {
      var schema = results[i].SchemaUrl;
      if (am.insAppList.indexOf(schema) < 0) {
          am.dispApplicationListSchema(results[i],i);
      }
    }
};
am.dispApplicationListSchema = function(schemaJson, no) {
    var schema = schemaJson.SchemaUrl;
    personium.getProfile(schema).done(function(profData) {
        var profTrans = "profTrans";
        var dispName = profTrans + ":" + schemaJson.BoxName + "_DisplayName";
        var imgName = profTrans + ":" + schemaJson.BoxName + "_Image";
        cm.i18nAddProfile("en", profTrans, schemaJson.BoxName, profData, schema, "profile", null);
        cm.i18nAddProfile("ja", profTrans, schemaJson.BoxName, profData, schema, "profile", null);
        var description = profTrans + ":" + schemaJson.BoxName + "_Description";
        $("#appList1").append('<a class="p-app" id="p-app_' + no + '"></a>');
        var pAppId = 'p-app_' + no;
        var html = '<a href="#" class="ins-app-icon" onClick="am.dispViewApp(\'' + schema + '\',\'' + dispName + '\',\'' + imgName + '\',\'' + description + '\',\'' + schemaJson.BarUrl + '\',\'' + schemaJson.BoxName + '\',true)"><img data-i18n="[src]' + imgName + '" src="" class="ins-app-icon"></a><div class="ins-app-name" data-i18n="' + dispName + '"></div>';
        $('#' + pAppId).append(html).localize();
   });
};
am.dispViewApp = function (schema, dispName, imgName, description, barUrl, barBoxName, insFlag) {
    $("#toggle-panel1").empty();
    cm.setBackahead();
    var html = '<div class="panel-body">';
    html += '<div class="app-info"><div class="app-icon"><img data-i18n="[src]' + imgName + '" src=""></div><div class="app-data"><div data-i18n="' + dispName + '"></div><div data-i18n="Provider"></div></div></div><section class="detail-section"><h2 data-i18n="Overview"></h2><div class="overview" data-i18n="' + description + '"></div>';
    if (insFlag) {
        html += '<div class="app-install"><button class="round-btn"href="#" onClick="am.confBarInstall(\'' + schema + '\',\'' + barUrl + '\',\'' + barBoxName + '\', \'' + dispName + '\');return(false);" data-i18n="Install"></button></div></section>';
    } else {
        html += '<div class="app-install"><button class="round-btn"href="#" onClick="return(false);" data-i18n="Uninstall"></button></div></section>';
    }

    let id = personium.createSubContent(html);
    cm.setTitleMenu("Details");
};
am.dispViewInsApp = function (schema, boxName) {
    //$("#toggle-panel1").empty();
    var profTrans = "profTrans";
    var dispName = profTrans + ":" + boxName + "_DisplayName";
    var imgName = profTrans + ":" + boxName + "_Image";
    var description = profTrans + ":" + boxName + "_Description";
    cm.setBackahead();
    var html = '<div class="panel-body">';
    html += '<div class="app-info"><div class="app-icon"><img data-i18n="[src]' + imgName + '" src=""></div><div class="app-data"><div data-i18n="' + dispName + '"></div><div data-i18n="Provider"></div></div></div><section class="detail-section"><h2 data-i18n="Overview"></h2><div class="overview" data-i18n="' + description + '"></div>';
    html += '<div class="app-install"><button class="round-btn"href="#" onClick="am.confUninstallApp(\'' + boxName + '\');return(false);" data-i18n="Uninstall"></button></div></section>';

    let id = personium.createSubContent(html);

    cm.setTitleMenu("Details");
};

am.confBarInstall = function (schema, barUrl, barBoxName, dispName) {
    am.barSchemaUrl = schema;
    am.barFileUrl = barUrl;
    am.barBoxName = barBoxName;
    $("#dvTextConfirmation").html(i18next.t("confirmInstallation"));
    //$("#modal-confirmation-title").html(dispName);
    $("#modal-confirmation-title").attr("data-i18n", dispName).localize();
    $('#b-ins-bar-ok').show();
    $('#b-unins-box-ok').hide();
    $('#modal-confirmation').modal('show');
};
am.execBarInstall = function () {
    var barFilePath = am.barSchemaUrl + am.barFileUrl;
    var oReq = new XMLHttpRequest();
    oReq.open("GET", barFilePath);
    oReq.responseType = "arraybuffer";
    oReq.setRequestHeader("Content-Type", "application/zip");
    oReq.onload = function (e) {
        var arrayBuffer = oReq.response;
        var view = new Uint8Array(arrayBuffer);
        var blob = new Blob([view], { "type": "application/zip" });
        $.ajax({
            type: "MKCOL",
            url: cm.user.cellUrl + am.barBoxName + '/',
            data: blob,
            processData: false,
            headers: {
                'Authorization': 'Bearer ' + cm.user.access_token,
                'Content-type': 'application/zip'
            }
        }).done(function (data) {
            personium.getBoxList(cm.getMyCellUrl(), cm.getAccessToken()).done(function (data) {
                var insAppRes = data.d.results;
                insAppRes.sort(function (val1, val2) {
                    return (val1.Name < val2.Name ? 1 : -1);
                })
                am.insAppList = new Array();
                am.insAppBoxList = new Array();
                for (var i in insAppRes) {
                    var schema = insAppRes[i].Schema;
                    if (schema && schema.length > 0) {
                        am.insAppList.push(schema);
                        // hotfix for not showing HomeApplication/Cell Manager's box inside a data subject's cell
                        if (!_.contains(cm.boxIgnoreList, insAppRes[i].Schema)) {
                            am.insAppBoxList.push(insAppRes[i].Name);
                        };
                    }
                }
                am.dispInsAppListSetting();

                // application list
                personium.getApplicationList().done(function (data) {
                    am.dispApplicationList(data);
                    $("#modal-confirmation").modal("hide");
                    cm.moveBackahead();
                }).fail(function (data) {
                    alert(data);
                });
            });
        }).fail(function (data) {
            var res = JSON.parse(data.responseText);
            alert("An error has occurred.\n" + res.message.value);
        });
    }
    oReq.send();
};

am.confUninstallApp = function (boxName) {
    am.barBoxName = boxName;
    $("#dvTextConfirmation").html(i18next.t("confirmUninstallation"));
    //$("#modal-confirmation-title").html(dispName);
    $("#modal-confirmation-title").attr("data-i18n", "profTrans:" + boxName + "_DisplayName").localize();
    $('#b-unins-box-ok').show();
    $('#b-ins-bar-ok').hide();
    $('#modal-confirmation').modal('show');
};
am.execUninstallBox = function () {
    personium.recursiveDeleteBoxAPI(cm.getMyCellUrl(), cm.getAccessToken(), am.barBoxName).done(function () {
        personium.getBoxList(cm.getMyCellUrl(), cm.getAccessToken()).done(function (data) {
            var insAppRes = data.d.results;
            insAppRes.sort(function (val1, val2) {
                return (val1.Name < val2.Name ? 1 : -1);
            })
            am.insAppList = new Array();
            am.insAppBoxList = new Array();
            for (var i in insAppRes) {
                var schema = insAppRes[i].Schema;
                if (schema && schema.length > 0) {
                    am.insAppList.push(schema);
                    // hotfix for not showing HomeApplication/Cell Manager's box inside a data subject's cell
                    if (!_.contains(cm.boxIgnoreList, insAppRes[i].Schema)) {
                        am.insAppBoxList.push(insAppRes[i].Name);
                    };
                }
            }
            am.dispInsAppListSetting();

            // application list
            personium.getApplicationList().done(function (data) {
                am.dispApplicationList(data);
                $("#modal-confirmation").modal("hide");
                cm.moveBackahead();
            }).fail(function (data) {
                var res = JSON.parse(data.responseText);
                alert("An error has occurred.\n" + res.message.value);
            });
        }).fail(function (data) {
            var res = JSON.parse(data.responseText);
            alert("An error has occurred.\n" + res.message.value);
        });
    }).fail(function (data) {
        var res = JSON.parse(data.responseText);
        alert("An error has occurred.\n" + res.message.value);
    });
}