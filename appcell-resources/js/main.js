var ha = {};

ha.init = function() {
    let tempMyProfile = JSON.parse(sessionStorage.getItem("myProfile")) || {};
    let isDemo = (tempMyProfile.IsDemo || false);

    ha.displaySystemMenuItems();
    ha.dispInformation();
  
    if (isDemo) {
        demo.createProfileHeaderMenu();
        demo.createSideMenu();
        demo.initSettings();
        demo.initMain();
        if (demoSession.insApp) {
            ha.dispInsAppList();
        }
        st.setBizTheme();
    } else {
        //createTitleHeader();
        cm.createProfileHeaderMenu();
        cm.createSideMenu();
        st.initSettings();
        ha.dispInsAppList();
    }
};

ha.displaySystemMenuItems = function() {
    let tempMyProfile = JSON.parse(sessionStorage.getItem("myProfile")) || {};
    let isDemo = (tempMyProfile.IsDemo || false);
    let systemMenuItems = [
      {
          "name": "Community",
          "icon": "003lighticons-03full.png",
          "url": "socialgraph.html"
      }, {
          "name": "AppMarket", // With context properly set, it can be AppMarket_biz
          "icon": "001lighticons-31full.png",
          "url": "applicationmarket.html"
      }, {
            "name": "Message",
          "icon": "001lighticons-02full.png",
          "url": "message.html"
      }
    ];

    /*
     * For older profile.json that might not have CellType key,
     * assign default cell type (Person) to it.
     */
    let cellType = cm.getCellType();

    for (var i in systemMenuItems) {
        var app = systemMenuItems[i];

        var imgTag = $('<img>', {
            src: 'https://demo.personium.io/HomeApplication/__/icons/' + app.icon,
            class: 'p-app-icon'
        });

        var divTag1 = $('<div>', {
            class: 'p-app-icon'
        });
        divTag1.append($(imgTag));

        if (app.name == "Message") {
            var spanTag = $('<span>', {
                class: 'badge',
                id: 'messageCnt'
            });
            divTag1.append($(spanTag));
            cm.getReceivedMessageCntAPI().done(function (res) {
                var results = res.d.results;
                var cnt = 0;
                for (var i in results) {
                    if (!results[i]["_Box.Name"]) {
                        cnt++;
                    }
                }
                
                if (cnt > 0) $("#messageCnt").html(cnt);
            })
        }

        var divTag2 = $('<div>', {
            class: 'p-app-name',
            'data-i18n': app.name,
            'data-i18n-options': JSON.stringify({ context: cellType })
        });

        var aTag = $('<a>', {
            class: 'p-app'
        });
        if (isDemo && _.contains(["Community", "Message"], app.name)) {
            aTag.attr('href', "javascript:void(0)");
        } else {
            aTag.attr('href', app.url);
        }
        aTag.append($(divTag1), $(divTag2));

        $("#dashboard").append($(aTag));
    }
};

ha.dispInsAppList = function() {
    $("#dashboard_ins").empty();
    cm.getBoxList().done(function(data) {
        var insAppRes = data.d.results;
        insAppRes.sort(function(val1, val2) {
            return (val1.Name < val2.Name ? 1 : -1);
        })
        for (var i in insAppRes) {
            // hotfix for not showing HomeApplication/Cell Manager's box inside a data subject's cell
            if (_.contains(cm.boxIgnoreList, insAppRes[i].Name)) {
                continue;
            };

            var schema = insAppRes[i].Schema;
            if (schema && schema.length > 0) {
                ha.dispInsAppListSchema(schema, insAppRes[i].Name);
            }
        }
    });
};

ha.dispInsAppListSchema = function(schema, boxName) {
    cm.getProfile(schema).done(function(profData) {
        var profTrans = "profTrans";
        var dispName = profTrans + ":" + boxName + "_DisplayName";
        cm.i18nAddProfile("en", profTrans, boxName, profData);
        cm.i18nAddProfile("ja", profTrans, boxName, profData);
        var imageSrc = cm.notAppImage;
        if (profData.Image) {
            imageSrc = profData.Image;
        }
        cm.getBoxStatus(boxName).done(function(data) {
            var status = data.status;
            var html = '';
            if (status.indexOf('ready') >= 0) {
                var msgCnt = '';
                cm.getNotCompMessageCnt().done(function(data) {
                    if (data.d.__count > 0) {
                        var count = 0;
                        for (i in data.d.results) {
                           var res = data.d.results[i];
                           if (boxName == res["_Box.Name"]) {
                               count++;
                           }
                        }
                        if (count > 0) {
                           msgCnt = count;
                        }
                    }
                }).fail(function(data) {
                    console.log("fail");
                }).always(function(data) {
                    var html = '<a class="ins-app" onClick="cm.execApp(\'' + schema + '\', \'' + boxName + '\')" target="_blank">'
                             + '<div class="ins-app-icon">'
                             + '<img src = "' + imageSrc + '" class="ins-app-icon">'
                             + '<span class="badge">' + msgCnt + '</span>'
                             + '</div>'
                             + '<div class="ins-app-name" data-i18n="' + dispName + '"></div>'
                             + '</a>';
                    $("#dashboard_ins").append(html).localize();
                });
            }
        });
    });
};

ha.dispInformation = function() {
    // Currently the followings are dummy information
    let html = '<li>'
             + '<a>'
             + '<div class="list-icon">'
             + '<img src="data:image/png;base64,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">'
             + '</div>'
             + '<div class="list-body">'
             + '<div class="sizeBody" data-i18n="Dummy.MaintenanceTitle"></div>'
             + '<div class="sizeCaption" data-i18n="Dummy.MaintenanceInfo"></div>'
             + '</div>'
             + '</a>'
             + '</li>'
             + '<li>'
             + '<a>'
             + '<div class="list-icon">'
             + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAAA5ZDbSAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QUKBx4z2E9F3wAAIABJREFUeNrsnXeYXNV5/z/n3Hun7ezO9l1t0WrVEAIJZDDdVONOMyZO3EMwOHYcJ3Zs407cYye2Y3AJGBfiEgg2NhhjujFFYBBCEuqrtr3X6ffec35/nNnZnZ1ZaQVSgn/hPs8+0s7O3Jk53/O271uO4DCu1J0XE774zpnff3ORACXRKgb6HFBnaOWvRat2tL8IrSKgJWhevuZeAtCgNWidAjUM6oDWahtaPYVWD6HdHrTnA6rsHbsBiP+4juh7hg7rXRYI7kWEL74r9/9LA2g3ClyG9t+hlXcuKgN+Gvw0WmdBZ0H75uflawGXBGEBlvnXILMD7f8c5f0E7Q36oixd8a5dxB+5GzouJvo3/osHeLbUpn57WQDt1+P7V6G9j6BSUe1OgTeJ9qfQfgJUFvByO/P/OGb6MMVIAMIALYQDIgQyYMDH/4lW2W+gE7ujV2ZTAPGbIPreFwFwgdTedVkNyn0b2rtOe/FqsqNodwTtTYKfymub/BcT/0dBVTlhtKMQKDe/eAl0dgKUNlgtBGsxDTggbRAOIDVkv4lyr7fhQOgq9NR/mPUuf99hApz6zZsIX/JbUn/4O8lk50ko70v4qQt1ZgjtDqLdMfBdA+rLJjYPriirx2o4DavhDGTtKxBWEH/0eVT/E/iDT6DG9y0Y5GmECsA2iO3UimvR/L78GtLx74PyoeIDCwQ49es3EL70d6R/9w5He+OX47tf1e54m073ot0h8NIvA1sCXFlzLIGTPou9/C9LPsXvexT3mc/hdT182CBPa0UhQJvfE2i+iuKG8vczPvV9Yx1jf38IgFO/fj3hS+8hfeebQ1pn3qv99HVkh6t1uhvtjqL9l21rSXArFhM850as1tfOPDw+CJ6LrG2eMcuJblL3vhnV9zRYL9D5Fnnh8lH8h9ZcV/EBhib+HbSCyn+cebpdCO5rCV96D5m73+ood+q92k99UWcGKnSmC+1OwcsO8bwOsH3Mu/Pg6vgYqfv+C3fbM+C52EtWEX7jO5F1rYiyFoIn/zOpu98wv6+iZ/0UquaZx81lAe9HISe+xadiH2J0/JuFt8oDnLzjQsKX3ot66N0yMzlwufYz1+lMf4VOdaK9hHEeXr5KS29sCVbjWfmHkrd9h8R/fx+dShhk5N14+7YT+9yPQVrImrXImrWo4c0zwCkTUQpARCsRZc0IpxydjaPjB1DxqZlIao5615qrNYyM/ztfrvwQybGvQdXH5gAcuex+ANKT/SfhZ7+iM4PVOt315wnu4YYnL/K9RHk7MrYcAG/v86Qf+x24WUQwnH9aZv0DuNv+hHP86WBHsBpOwx/cbD6iBll7PFbLq7Hq1iHKWhDBSrCC4GXQmVF0vBN/4Em8A3ehxvuNU52TbCGR2ueftMeOsS/xi6qP4Y98BWo+kQM4+cvziFz+MMlfv7Yalf2SdseW6Ew32o2/9MFVOUJIzagvGQmBtNHJuFFi8uh+BGGHwSkzH2dsEO26Odd3thqX+CN9OJiwRwRi4IKsW4yz7uNYzRcgIosQgYp538dacinOsVfh7vop7pbr8yEZEoQkqD2+om02ANtrPpGT4OTtZxtw73hNAD/7DvzEhWT6wJ18aYPr5bRfzTHIylXI2Arzb+VKCNeBsNETe8is/0fU2PajJr3aBzW1Fz21HxFuwF5xArKsHN/3ETLnRSmFCAYIrD3T/O7G8Uc2YS85neDZ30dWH5fTvbNd7jRqahxZXmUkGRChakToFIJVq7HqTibz1CfQU70zBJikRXl8euTLXF3zSRLDn5+lxJK3n9OKcjfp7ECVTh9Ae95L1lsWSJxTvoCz4u1gh0EGEJZjWB/pFAr40AZSd78WnR45siZAgYhUYi9+A1bLa7AWvwERrgMg+8yDTH3jI3jd+0BrZEMTFR/5BsHT32Be7k6h+tcjYysQFe0ze7ZjE6kHbsPd9AR6cgKtFEiJVVVD4IzXEb7o3cjy2pk9cOB3ZB7/EGqsA6QJk/wUaI/XKJ8H665DCeMUvCoA/qfw45/Vqf1od9KovJeofQ2e+kWcV3xywUY2dcfp+ANPHZnAXYMIRAm88gs4q64EKwDCBmnNfB6tUIkJ/AM7EAEHa/FqRDAyR/RVXmrV+BDxH32ZzB9/i86kwfdn0YI5Wst2kLFqyt7+IcJvfE/+T+6275Nd/1HjjPkGYD/No2heW/s5UjmAT6tBewd0ZqBMp7tNrPsSdqDK3jOYlxa0wu/bi7dvJ/6BHbj7d+JuWU/5VZ8heMFfGAfn8Q/hbv0eKHd+h2yBPJ+sOpbwG+5GlLcf2j0Y7cU/sAt33w78zp34A93EPn0joqxqRgq7dzN1wyfIPP0IwnYOrb2CIcJvegfRqz+f//6ZR67G3XazcUEy4MZBubwKxeN28tZXCrT3Zu2nyvDGCnfOgjg05gRpcFRpLiHz4KrxYcY/eilux3azOMJ8Fp1K4HXvJZBJIoIRZNWxOWlxZ+7hlGMtOger+TyshtONFyxt1NQB/IH1+N0P4Pc+hM6MM63OZGwlkUvXQzCW/75qqIfM43eTff5P+J27iVzxAXRilMR/3YAaHs5/JoRAhCP4XXuwV52c2wADxG/5VzLrH0CEIgvb3+kUqd/9HFlTT+TyvwMhsVe+C7//MdToTrANda2yvB/NelsrX4J6F34crRIHx1dIsIIIYRunpv5UZPUqZKgRLW10ahA9ts282eQetJ8BP3tkwdYKPb4bUbkCYTtYLctwO7aDnOUqSwt/4AA6Fc8BfFwuSyORkUacdZ/EWX2NWYm5EpqLUZ3V14CXxt3yLbKb/hXtpQi/7ld5cNXkKKlffY/Ef30HnckgLBudSeHufBaruR2UNJ9ptjetFF7XbgOwVmQeu5v0fbcWgysEIhAEaaHdDHhewd/01ATp+39F4MRzsJetwWo6G1l9PGp0p8k0WoDmCq24xka7MbR/Fn4u26FLqDApEYEKrMazsVf8FXbbG8EpPzgQ6VHcvbfj7vwxenSLCbmOVGQ09jxW5QqwHaympYZpL4gnLPz+HnQqCZUgK49B2BGs1tcSOv8WcKKzvPEsOptB+ybFKSwbAiGEEwA7hLPuWuz2S/H7HkVUHZcDd4T49z5F8s7/RJZVGDAAbAe/9wCBNaciQmHmUlVa+fidu4xq7tlL+t6fF28y38NefhzRd38Ma8kq0vf8J4nb/qNQs1o23v4dZB6/G3vZGvNQzYn4nb9DuymEDUhs7XK+jfbPQ6XRfrzYsdIgnDBW8wUETvo0sv7UYoHKpiG3OFg2IhAyuzZUjbP6apzVV+Ntv4nsln9HjW5dGEExvS5SGvWoCi2BGt2C1X4ZwnGwFi83TkmBopH4/Z0mDgZEuJ7AiR/BOfHaWZzwJH5/J+62p/B2bsQb7Abfx6pZhH3sSQTWno7VvBwRiiAqV2FXrsoDkP79z0j+5hZkeeWc97Xw+/YjquoNyTGXilQK78DuXOJhP9ktTyHC5QXaiUCQio/+O7K2CZ2YInj+W0jdeytqbHRGGwiBTqfx9m5HJycQkRiy5gREsAbtdiMs4/MpzWtstHsmKgnKKwa3rJHA2g/jrP2HmfBDK/yhHtToEGqwC7+/EzU5CtpHRKuwGhdjNy9F1jUhqxrMxj72vVhN55FZ/2G8znuK30vlzFS4FhGqQwQrEeE6RKAS7WfR6QF0ehSdHkEnuvGHNxnCwHKwm9uLTYC0UEM96ORU/qHZ4Hp7tpD63S2kfv8L9PgYOMEZFa8V3P0zZE0d4cv+hvBr3obVvGxWAmGYxM++iYyWICQsC793PzIaQ5RFi5005eP37jef4cCOIp5Buy7Bk89FhMJMfPkavO3P4I8MI8sqcmkkNV3iY+410I3fux97+QmIqtUQrIJ493TNAMDpNspdi0oWrpEGGVtK4PR/w26/dGZhunbhPvcYmfX34m55EjUyDJY1s7O0cf9lTT3BU84ncOYbCJx0HrK8ChFbTujC28g89kHc7T8oIM5l1UqsxtOxFp2DrDs5F/gX0k863oUa3ojffS8qNTyDZaweUREDz595jRCoqQRqdKAIg+yGh5i6/lq8ju2IcBkiGisGKhBCp9LEf/AVvK3PEL36OuyV60BrspsfQ42OICLRErZDoSaGUeMjWHWNuJYNShWsq0om8Ic7UROjhX5D7gkiXAbKw+vYhpqcQgRC6GwGYQlENIYoi5kNFIliL12NCBg6VDhlM+pe5BguwSoblV2idWbG8VUgo4sInvYvWDlwdTZN5rG7Sd15M9nn1hsv1HYQ5bHSmjaZJHXvf5N+/PeEzruUyFvej92+GqwQwbOuR6cG8fbcCY6DvewKnNXXYC06++DOc7QVK9qKteRi1OiWWWAEsJuX4u3dAbacRR/a+L370JlUnhP2dj7D5Nc/hD/Yhyg7hA8hJTJaSeZPf0AlPkzsup9g1bfi7doETqBEstfDamzFWXsaoJGNixFOwMS1BQyci9+119j4ove08Lt3I8qqcI5dhxofRlZUI6vqkLFqZF0TVu0i829dE7K6YSaWHtuKTo/ms1u5vR62tc405uNDDSIQxjnu/VhL32IeSk2RvONGkrd+DzU5NmNjD7E4IlwGrkfqrlvwuzqIfuBLOMeclAP5BnS8B2vp5QTWfLDA6fH7D+B37kaND6HTCZAWoqIau2UZ9tLjze2r18wAGQhjNS3B7diKwClQl17PPnQ2jQiG0dkUU9d/EjU0UHpx59tY4TLcbc+R+NGXqLj2PwrU/mzJlRVVRN5yDcGzL0FGY6iRfrAdyKRmDLEA7bmogS6shsVo3yvQ4sKy8fbswOvuIHrVp8DzkTWNiGgU4cwfRmXGR0g8fTN2vAcpQOgZZWZDOmJ0u1FtVtN5xubmPMzkHTeR+Pn1kErOeIsLzpNKRDhK9rn1TF1/LbHP3ITVsAQRbSV47k3I2hPzX97r3EH6vtvwdm7EH+hGTY6iMymTXovGsOpbsI85kfDr34a9bG1B4G81tRc5WkgLv+8AZNJQDpmHbsfduRns4tBIe655nhCIYAiswueIUJj0w3cSfsv7IRAqfr3vYTUtwTnhLCNVgL14JcJ2jGYUs7gDN4s/0EPg1FcjQ2Fj1mY7T75P/OYvU/EPX8NevhY9NUr8xs/jrFhL6DVvK8gRTux5luGNDzG5ZxPBqftpavCQwVn+qgAb7c68fbgO58SP5iUq/dhdpH51I6QSZje+UG4iXIb7/DMkfvBFKq79Plg2snbdzA58/C4S//kNvH07cvbGzsWtAnwPNTqEP9SPu20D7tY/EXnbhwi96pIZgJvbikIlIS383r3GyweSv72lhM3LOWAr1xA69xJUcorMQ7/G7z1Q/H2VJvPwr7AaWorJICHQvgvZGXVstS4v2ihmM2XxujsIX3YNznGvJLvlTwWCIwJB3OefZvLr/4C1qA09MUp2y5NkKmtQY8NE3vr3+feUts3olocZ2foUDS0+ql4iUAXOu5135YTEajgDq+ncnETtInXXT/BHhxBOacnVbhbcjHEkhAA7YD5sCRUuAiHSD99F6LxLCZz+xvxzMut/x+S3Po4aGUDYAWMCil5s5TMz3q4txL9/HVZVHc7xZ4DlYDUuKeFJS/z+LqMFsnH83s4SqtXHXraa2MdvwGpdCVphtx9H4odfMSBbVgGI2S3rKXvXx4s3k5AmqpgYnXksEkOWRVGjg3NssI/f14msqCJ04RVktzxVKMWAsB28nZtxt280WtCyUaPDJH5xPWp8iOh7PwfSpnzJCbS/+iIqeJqy0AS2rfJ7T8wUm+QecKLY7ZfNeJvPPET2ufUIOzAPZZYgeOr5VHziBqpu+C2VX/kZ4Te9HWFJExcXgWQKieI3fzn/d3+gk6lvfRQ9vYnEApIHtoMa6mPqu5/JU4giWoWsri/0WIWArIsa7sHv6y7827QSC4Rw1pyOtWS1kTY7QOjcy7CXrELPJU+EQA314rQfW/z9pESNDhQADGC1LCupNXQygY6PETznEsIXXp6P1wu/p40IBHMUrAAp0ck4yd/8mMmvfRDtZQGoXH48zavqiMV8pFWymii3+e0wVstrZoLwDX8wdq3Uovsusc/eROxTNxJ+zdsIrDuX4Jlvovzvvkr5R7+JjFXN2ETfR7sZdCqJVh4IiT94AIDEj7+MPzRw+OpfSPyuvaTv/0VOWsqwGluKQbFs/K4Ow1KV4tLn48xtuzQn7/vIWC2yuqYo26PTadRYf+Ft2pZTtOoCyKbxezqQFTWU/fUnCZ53MTqdPHQewPcRToDAK16VFzzhTSFVcm5UOQdgASLchChrNPcZ7MbduRHhOCXJ7ug1nyV0zmWIaGUOHGG83VAZofOvIPK2D6G9DKBxjj2Bsr/6O6r+5efU/XI7Vdffi9W4FDXcQ/qBO0p7tFqjPRedzZTWBjnzkLr/9pyNjyIbFhdTllLide1B1jaU3qhuBnfr0/kNB+Bufhxv/w7jB8yReFndANIyxEcJCfeH+gq8bKt1BaJIggU6k8brMe9pLWqn4uM3UHblxxDBoPnOyp9FaCizBp6Lc9w6qr52a4Gz5Q88iZo8MG/m1M4pfay6dbPSXIOo/h5EWUVROGA1NhF+w7tywGrGdz5JzyO3Ur3qdBad/VZAEL7wrwiedC6ydhGirHKWip5FODz9IHp21cOceDJy+dU4q08idc9PST/4GxNPziHu/Z796NQEsqwCq7EVfFXsSXfuRIRjWIta8fZsL/q717GViU+9k+CFl0NyivTDdxp7bVlFGt057hRAYLetxN2xqXATTLNn8QlEpDzvSZfSmzqTwu/ZO/PSaBXRd3+S8OvfSfbRO8lseAS//wD4HrKqEWflWgJnvYHAmrMKgHS334y7+ZsHTYvb+fRZ+ZLcwnk5VSNKhhOBk84x1B6QGe1jwxeuQGsY2/QwdiRM3ckXIyqqsCqq0NkUft8e/J69eD378Hv3mSA/FMBqbC/e3UohYlWU/fW1hC64AoDyY05GjY2SeerBYhXmZvH278Q59hTj3c51fiwLr3sfOpMkfP5lTO3bWWyLhcDr3I33g6/MZMxKetua8OveCmisxcuK7yMl/nAfKjGBpMVI5+JlszaKyPceac/FH+gqZjrrWwlf/gHCl3/g4NVKqTi9D93M5CP/TOOiOKHwoQBGIKxQfpHx3HmzAaKsKi9JiZ4OtHIpqxBUV+7B6rkdTr7YVFH89mamvn0tOuPm6EyJEMJIwsrjTa3RnE2kfQ9n8UrsFWsLHg+e/Saym5/Mqb9ZMaPn4nV1GIDrFxfvyVwsrOPjhC65isSvfoAaHiihrsXBHTzlEzzzQuwVJxnPu/WYws2ktUlwDPaipiZmxc8xZG09yrKxmxdjt63CXnIMVttK7CWrZ24/uc+EPZFFaGEXazWtUL6H9lziXdvouPWrjGx+lEBZGcFgloZFifkiwGmANdpL5RfF2EVd0jHR8dG8JIVqGqmo0ixePEh5tY1TX19AV+IrQxPOUa2Eo4iKuqL3EFKipsZQY4Ow+JhZzspKQ/vNzc54WVR3h3lteSWyth4dTxRKoAK/Zw9W4xLKP/RVJr/0AVOvLBdYaql8rPomyv/+6/n1sVuXg9C5lKJjPF3LRoSDRd+p6ht3IKO180vjZC+ZP3wAhh5FtF2Bqr8Au+GViEA5IFCeS7J3F+M7n2Z4yyNM7NqAtBwC0SCVsQQVsfRBv4qdT6LHO2cAjtWVjmVtG3fr05DNQCBEpGklx7z5PTgDtyMqlmEvf9u0KBqHw/UQdrDIgbLqG7GXrEQrv9COWTb+/l2k77sVq6oeESnH2/c81pJVJflf7bp43XtzdiyGVduMNzkn+W9ZeJ27CZxwNsFTX0f06k+RuOUbJj6VknndT6VAgNW4mNhn/gNZvWhmHaobCZ33JmTTCuzWpdjNy7FalxU8Z8a+FoKr3Awqm8Z302Snxhl78gdYe+6nstJD7fwR6Y0/YmQQJrMNZLJBMuNTKN/kqaVtE446BEMeldVxamuTBEMHd77taUBm52plZR2yuhadTBVVSnj7d5N5+n5C5xmuOnbB19DZTxfU87odW3C3PV0aFK2wlxyHs/aM0jVIlk3qnl+Q3fAIojyG9/wz1NzyJLKsHDXcX+SQ+X1duVi4ElnXhO7YWqippYXfuRutFAIIv+lKrMbFJH76TbzODvTECFoLYz7QaK0RloWsqsNecTzR9362QJ0CyIpqYv/8i/mjmUyKdM8GgmUhZKgSvCReKs7kwASJ/v0kB/aT7NvH5L4tkO6nfaWFxgMLwhXQXA41qQHiUw7pqgC+bwMutp0iFHIpi7qEwtpkEA8RWdnTUqXi+9HZSUSgAlnTiN1+HNlN64v4ZxEME7/x81iV9Tjrzs6xVDPg+oNdpO78Ee6OjaVJEuUTOPEMrPrFBE89n/Rj9xa/hxNEDQ/CUL+R6p69WI3NeF175jg3Ap1JoSaHkbEqrLpFJcMXb//2gscDJ78a57hTSd93K+7m9fhjQyYpISUiFEU2NBN4xdmEzrkkn4LzkpOMbH6YqtVnEqionSWRadzEOF5iEi8xiRsfZazjORJPf5u25VlC9cvRqT4me7rYtiGE5wewHYHlCAIBSbDawrZ0vjhgGrBwBMJlLigXlXtMTncXMhNFHZIXmrXtUH1/xGp7E9aiNpw1p5Ld+FjJBII/2MfE1/+eyCVXYq88EVlWjs6k8Hr3k3nsbrJPPmDqlEuoPau5DWv5CYCm7O0fJrvlKfTUVHESwMpVc3su3oGdWE1LEfJxUys8m6vIZPC79+KsPsVUQWTSuXIG0+wjgiH05HjRaohwOeFLriJ8yVWokV5UfBxhOcjqBkSkMDyMd++g58Fb6LrvFlrPu4TWV64lWBbDT/Qz0TtI/54x0sP9pEd7SQ93obJZKmrAj4/ge0MgIBiARe0SpX2CAQ/H8XEC5icQ0EUO4mwOJp9u5zBqIgvDJNBeHG//nVhtb0IEQgTWvYr0g79EDfQUMU3CdlCDvUx973PYLUsRFVXoVBy/rxOdSpmMTAkbrtNJIpdfkwNfYK86mbIrryVx4xdRiXjpbJWctqFnGNDdLChlgPY99MQI3v7tOKtPwWpuxzn2BKyGxciaBmRVA7K6DqumIU+oaDeBt+vH2EsuQ5Q15QrtmpA1TcX11IP7GN36OH1/vJ3RbU/ihG3cbTeSnvTQUQc/5TI5CKNdlQhLEghqyurACSjC4Sy2I8AyiDgBaGqeykdhs5dHH8UqZXs2/ej3PYpO9iMijThrTid03qUkb/teERk+bSuFZRtCv68TgQDLyhWblQiwshnsVScQOu/ygntF3vjXCMshedt3cTu2IkMRwwvnniMsC2/vVsKvf5uhO70MVl0TVm0jsq4Za1Eb9hLjcQfWvQprURsyVoOM1SDKYqXLbkUAd8v1eJkkbvRkdHQlVrgCrTzciSGS/ftI9O4l0buLiY7n8NJJQlGL2voJFi3yCQRA+y4yCJV1EiecwrI0tuNj2wrL1lhz/TdTu26EUh9dUAu+bvyHtsb3zDAcGSKw5kMETvuq0aiDXUx+8yNkn3oQ7MDCkgElYwEPEYkQu+5mAiedb9z/TBI5Xe2vNe62P5F54h4yT/w+lzbMmvgcjbV4CVXfuAt383pERTUyWomIVhjHKlqBCEfn94bnc4Q6f0fy/neTSSviXivxZDWppE02kSQ7MYKbGEdKk/6Nlmeork1RWZnGCZQGR8wplNf/m70DCvw4pEdnA6wAH2TFEoLn/gCr+QKzEF27mPzWP5Hd+Lhxmg4TZJ3NIMvKKP/gVwld+NY8dbfl+qupXnUSzRdeM/PcVBx/oAs1MYKeHAFlCvlEeSXO0uNfVE66BB1E5vF/ILvpRjwNqSSkkjaZjIPSlgE36BMKe4TDPoGgQoo/k+EG8wKca8G0Ws4jdO7N+fYMf6iHxI++SPq+X5qtuZCFVgqdnMI+Zi3R936W4CtfnX/d3ju+wf5ff5vGVsWy888lcPrXEeGGeepoD76hvP1b0YkJ7PbjEJHYnLTcJF73Lvyuffhdu/G7O3DWnE74kvfmCtt+Tur370YEZgoqVa5jED1dtzbjuTJtOyUv7SlCBwU4t672sssIvuq7iHBjvvAu+6cHSPzs33C3P2dsWY6CzM+M0Art++C5WE2LCV96JaHzLsdqaM2r0N5Hfsau//wiUk+yfHk/sRqBiLZhtV+OvfztWHUnlPzMqYG92GUxnGhNHrzJr7yP7PaNZlPW1JlKj3MvR02OMHX9J3A3rTexreuaAnc3S/C0C4hdd0vOBD1F4henIaZ9O9+AZ9WuxWo613RuVCwDK4RODZiqzv5H8bvuR2Wzpt5NvLQBtktbZvD23IHOxgmedQOyciUiECJ4xusJnPJqvN0byTx5H96O5/AHu9GZBCJSgVXfgrN0Nc5J5+KsXGeyKrOYqv13fZv9d34f5Saob5yiPKZMOdjkXtSWb5F9/jskstXErZNRkWPQ2GTGh5ja/zyZkV7O+vZTee0Qv+k6MusfzBMx3sQIyVu/g1XfirP6FHQ6iT/Ua7znvIHUePu3zarIjCGjUXTaePD26vfgrPkQsrzNVCvKXOkQpibZaj4PZ80H0dkJvJ0/Ibvxy+j01FFvMD8yXnQJkP2u+0n99kJCZ37LlNBKCxGwcFafhnPsqXPcQVHQaDXbVmfG+9nxw2sZ2fwoWvlUVSZpWBQv9IuUi8AlKpM46V7G+0KMj0fIpAP4rqJ80RKsvFOmSN17a2G8IS28/TvxOraYkKmqFmFbc3wGgT80aLoMpYOwwohoGyKSJXjOTVhN5xy0yMDEOA7CjuCsuxar7WIyj/4tftcfD7aSL1GAp+PjeCepe96MvewyAus+aSohpb0gZys1tJ+eh39Gz4O/wI1PIG1BZVWSlsWjBEN63vcMhhT1jUlq65K4Lvgu2FURpNSFC05x6m/6c8nGxYhwFJ1OFQWd3oEd2O1rTO/RqitZL8L2AAAgAElEQVSx2i5CVq6Y5RimcLc/jbtpPX7fXsikkVUN2KvWETzj9cbWC4GsXk3otXeQffJa3K03vbCxSAdb/NkNBS/QvVvYvpNGZXt77iBw3o8JHPP2wqYprWYoRGmkJjPay/abPs7wxgexwxGCYU119QSNi+IEw4f+sEIY7W7ZQBjI7IXsuBkPKCThCy4jdc+tM2VlysdZsQ7n2FeYML2hBREuMw1ocwD2O3djt69BhBtwTvhwARGTfvA2kj//Fl5vp0nb5dWMRt/xQ2Q4QuQv3kfkLz6ICJcjQtUETvlndGYEr+NXLxJkYeZ3BKuQtScgo20gJCrehRr4Ezo7ftjDXRcGsAYRiBA890fYy/9i5uHEJCoxid+5w3QLSIG94gTsZWsIVjdR0baC1J77Ka+apLomTkXMP3iWzgoinGju34oc8xQHP4VOj+Ad+B3O6veClETf90VUYhJ3ywaQErt1KWXv+ij28hPNrRrbTHvJ3KpGDd6+HQTnaGN/sJv4TdeRvv+XCKd0daewTAYrfss3yTzzB2LXfg+reRkisojA2n9AjW1Dje44fJusDXEkK5ZiL70cq+VCsEL5okKEADeOu/2HePt+aUp4xJECONc+GjzreuzlV+SzON6ezSR/+X3Sj/wWPTVpaETlE77oXVR8/LsANC6voXI4RcBK56hlC2Qol39O5pvOsGxk5bHYi1+HtfgNWPWngB3JM2xq6Gm8rt+jeh+G1VflCu0qiH3mx+jUGDo+iYjVoZMp1GA3sroBq3Gx6a7Qxf2wXteuQqdzbID4Dz5P+ve3Ffcc6TmEsBCmrHXbRia+8rfEPnczVl0rctGrsJe/leyGLx6elGkQwQrsJZdgr3gbBGLg50YzF2z+AM7x70OGq8k+/70jKMEKnOOuzrWyGG8y/eB/M3n9teipKVPameu009kMOj7J9HyfcO0irIYWtNKIskXIylWIssWAhx7biZrah85OYDWeReCULyIijSWk2kE2nkGg8QzQXr4XRycn8fZsRU2O4Pfsx+/Zg9e5G/CJXvlpnDVnlm4Q0xpv/66CooH0/beSvu82syHmlCjJcBlIgU4mCgvZLRtv9xaS//lvlH/4W2Yxl1yCt+8O1NDmhUmxBhltwjn2KmTLhUZi5wI7e6MJidV2Efbkfrx99yzIHNiHAldWLcM59qp8SjDzh18x+c1/As9kaooqMuITqKEeM7avcjX22o9i1Z5QsrcYL40aex5Zd3Ihm9W7H52YMLs7EsVqajPFe2IWdd6/j9H3X2Cmw1l23vaLcBh/ZAgHsKrqcK3iVVCjw2g/i7ACeAd2krrrJ2A5hbbac3FWnUjw1FcjQhEyj99jCtFnSTKeR3bTerIbHyGw7hxk7TpkebsBeCHglrfiHP8BrEVnm2kIh3KktAK7DHvJxfh9j6GzU4dU1QcH2Ae7/c2mnTO3qPGbv2KqF0sZUyHQ8Qn8oV5kXWt+HML87x6aAVdr3M2Pk370LtytT5vmLaWR1XU4x55kYvBTXzPj99W0IALhoooRnZhCT5iR91Zzu0kXpktUZB7Yib10Dd6ujXh7dxS2kfo+sr6J8r//Cs7KdaZSMhrF3fZs4X0sC3+gE3fzegLrzskVSxxjUp/KO7hajtThrL4aq+mcmXKpBep0UdaE1XQ23p67D6mD7YPa3oBlwqJcQV7y9u/jjw7OHyIJgZocwx/owZldBOFmyG59Cm/fdvT4iGkoq23EWXkC9ooTAU363p+S+Pm38fbtACeYLzzzx4Zxt20k89QDRN76d0QuuyZXZBDCal2K3z2nxFWDP9Q7A3AgbACeQ6N6Xbuxmpbhbt9QRL1qN0Po7IsQaKa+8yn8nr2o+ETpFGg8bgoRfNeYk+rjEcFqdHJw/kGjTghnxduRzeejvfRhOmTKEDQ1a2Hv3S9CRWvMoK7ytpnYcPNT4LqlpVdrtOehs0n05EyDtte5g9Rvfkj22Ufxe/bmFlsjKyqxlqwi+IpzkLWNJG75Ov7IYL6meCZwsHLtKv3Eb/4y9uIVJiMlJVbrSrzOfYYynSVVaqgPHR83BerBECVnZXR1wMke/mBPce2yUlgNrXg9e0j//r8MuNMhoO/nCtMVIhLBamlD1tSjUwkzRDTSiLDD8ytbKbEWnY215OLcWKcXEN8KCxFuREQq0enxBdRFz6dGylqQuSSA370bnYrP6wCIUJjw699K6Py3IOtb8uDGb/xnsk89ZOJky847Mjrr4m3fiLf7eWSsCn9spHTjWf6TOpBOkbj5SzmALZy2FWQevaeoQMAf7kVNjGK1tJt7Fs3KyA1DkbJ0e46Q+KP9BI9ZkxvMIpCNbVgNLVgNrViNi02cXd2ILCs3PbzhnEOX7DcRwnzYhGtxVv2NGYmh3BcWLmuFCJQjIk3o1IsB2A7l5yTqdMJUUYjSAMu6JqLXXIeImE4GnUmQuuMmA66QYFvFTIbtmHqwsZEFDQHDsnF3b8Xd9SzOinVYrStKtI1K/KE+1OQYTvPSgomvBSq6cw/CCSIqa4uL2B2H7DMPE7nkKmJf+DHCCSHKKpBV9abbLxSeM7lumm1Nk+r4NTo5VNqKCRt7ySXIaCvaT/PCLw12BBGsOqQCkAelKf0MWmVzxHykuCB7ThnPNLgA2Y2PznQjHIzWzHXOzc0h61SyREdg7t4b/gBCYC85prixTFqowW50fCxHeDSXaEPR6KkJdGIMu31VUaG/sB3cXc+T/uNvCLziPJw1p2MvPY7UPT9BRMsLwFVelvTQAQaf+T1bv/u3DG98YN5FF8FK7KVvQavMi2cyZWCGK3ihyQad7IPUEFQsw25ZSr6cQZRwrkb6Sd/7M0KvfbtRz7s24fd1lla7vjd/i4jvEr7oHTjLjyd5+434fZ2FNlIIvJ2bzH+rGpFlZcVd8vFJ1LjxA6yWdtNp72bnOFIu/tgQgeNPNxVxRT26Nokffx1v71bs5WvIPnk/7rZnyT77Ryo/80NErDanMSyGNz5Ix39/Az+TxG7yUZUlQlQhsFouMM31/osHWAiBWEAVy8EleKIDFc/VHYfKsdtXlk72C4GaGCP5yxvxOjaB8vCH+0tLoO8TeOXZWK3txSyTUohoBYHjTyN88XuxWpeb/PKc9/I7t+c86SBWc4lBaMLMyQKwW1cW12eLXKd9526sJccQPON1+UkAs++hM2nSD99J4uavkt30JDqbwX1+A2Mfewte1448wA2nX0rzaWdSEeklUubOo7CEoSBfqN0tsooavYCJsQcFWKXSqPEd+YdCr/4Lww6VKjiSEm/vdhI/+Tr+SN+ss2Dm2OrqamKf/zkVn/iuGdM3N45OJ/MN0VZNg2kon8uPDPSDdhF2AKtlafEmkBb+YBc6OYnVuszY94LPLHLTbkyPbuSi9yBj1SVrqk1/c3bm9Vrj7dvJxKffSfa5PxqTXV5N68lrWLHGo7omW5oiCFYjq47hyIzxFWZ28EGcuUMDnCPXVe8f0BNmOlvw9NfjrDhu/r4eaZF99lHSD9yGrK4tvRG0QkiJs3QtIhIpbqROJkysPSvlV3SfaboxEMJuXVayL1j1daHik2ZWRgmto10Xv2uPcS9eeQHRv/mEYeYWWC2nJsbwnn9yxtYFwzjB4LzuhqxceWRHdnopk10SLwJgLPC6HsIfmPki5R/8F2RlzfxERyqOu3UDanQAEQ4VfilhEu4qOWHKSJesKtHOaZkBZsrDXjRPwkBr0/cbCGK1rCjZNuoPdKHjk8jy2iJKddrW+7378uo4fPFVlH/4X41Tlp96pwt/AGwbWdtI+fs/T+QdH5u53cgWVCo5L7khylo4YggLAe4UOjXwIgHO8dHuzp+gp/bn2KHlRK/+zLwjlYTl4HU8jxroRtY0FqskIfH37zBecNuKYjsipWlAHxtCLmrPJQx0iZTfTrPeze0lenVzAKdMt73VtLhY62hQiTg6NdPuGTr/Ciq/8Rsil1+F1dKOrKpFxqrMELLqeuzWdiJveS813723oMve3flTvN0/nU2VF6+LE+FIXjo9go4Pv0guWoMob8Re/HoIVhcsRPap+0g//NuSh0+o4QH0ohZkrAo12Fu4j4TEO7ADZ82ZOQn2YdYAMyElaswAbDUuRoTmS/ntzHvSIlpe5EmrySnUmOGk7bZjyG58YmZo6rQUaIXf343dPsNDW7XNRK+6juhV1+H3dKBG+0DayNomrIa2Ql8gFWfs2dvJrP845cERrIOF8r535Co93Dh6oqNkQHPYAAdO/CecEz5S9KfAaReSfuiu0vys8mcIhrkjpaSYkb7FK0uo6GkJHsRevtYM9SyV8stNbTVqein+/g4T785Sp17nToL6jVjtxyJrGkysHi5DRKLIyhrsZcfN3N+No1ODEKrNZ86s5uVYzcuLnbzUJMm+vfT+8Ta6H7iFsjKXtqU2FTFv/ogkPcgRKcEUEp0ewR96ZkG1/vbBVLOoaJ0ZWOZlzdiBUBg9OU76/tvnJzCUQtYtMpkdrQq/lpD4B4xnbrWV8CqlRI0M5KWvZMpPKdRgP9rPIEJhrPpmvO3PIWJVpuuhPIYdCCHLKtBuhsAJZyL+JmjaXRoWY9W3FC221/NHshu/ilX/CkT9mfjBxRCsRwYiaK1QmSTZqREyI32Md2xg6Jl7iXfvJhgtIxgWh+wn98d2cETK9rWPmtxjpru/KIDBjHWYrr2SgsQtX8tNatuLt3vrvBNyhOPgLDve9O6WbOc0EixjdchYFTqTLSQqMmnT5Q9YTUvM5PNkIpcPtZEVVVgNLaihfmR1A8GzLzYqdFGbGdJZtwirttkMgXGCWA1tReo1v/CZBPHOHSSfvoXQwKM43Y/i8+9knHZS1moyupFsRpCZGCc5eIBk3z4EGifkUFkXIFY1QW1dgnDk4OGPTnSjp/YhootfeKgkJDozir//rgX7a4dgsnrRqdxx4tLBH+wxLSyWPf9AT9/Ham7DXnUyKpkyztgc++iPj6OnRsAJY7WtxN22ESGE4bqVQqeSeN170G4G+5gTCZ58DgQjWDX1iOoGrOp6ZG0jsqIaEQgRft3bCb/+nQchBRRCK3Syn+ToIMnhIbITQ2TGBkkP9zK5bzOB+FMsWQ4iYBoCw/4+5NQ+1CRkEw7CdYhoh7ImieNoQuE0ZdEsZWUuRWH2PAkZt+M2gid9+qDJiENJr9/7KP7AhgUX9x0c4FTC2KXpJy85BnfX5sIzBIrMtsZZexrOqpPx9m1HlMfQk7lcqlJGoj0Xt2MLzpozsJra8HZvwWpqx6pvQtYuwqpuxDnhDEAQWHsWdtsqQ/bHqosPkMrt7NmXOzVMerSf9HA38Z7dpPr30FA/SsTup3d3ir69Lm58BD85jhQaK2ARrhVoPXOsp8h124fLwfNdfN9DK5PqtCyNZRdGUwtJEKi+R/AHX4usPxkOK8mfCx9HNuHt/NFhmXL7ULllnejJ1ULZ2K3LEXbAHJpV6vluFmfpsUQuudIIfXUDwgnixydBgqyswmpox6pvQQQCCDtA2V/+I+EL/zLXNRhDRGNmVP60aXACWCWGdqtMnET/fqYObCXgZKmIDJPs3UFfxxSJsTRechI3MUVmchidSRBYNkCgCawxQciPEatUBBoUgaCP4yiCIR/H0QVgTf/fssG2C2uT9QtoAdXZKdyt3yEQ+ozp+1poRskKoEe3k930TZMelEcIYGTOdmTGEaFaM3sxNwBtbq+kdjPYLe1E3/8F7BXr8uFJ5HJT5mq3LEdUVJta4nBZniyxlx4HS4+b9yNkJwaQ3jgivoeRA12MHegmNTpAtrwZLzFOdmqMWG2Mlacciy5rZSqxgfj4CAHSBOmmvGLYtIBWCoSlqa6DiqopLEsjpTroHJbZ0cSRIqHU2A6yG/8FZ/U1pirjYNy0tBEyiNf5e9wdP0BPdh12Sa59KMJExbvQmbEZgLVCuy5CSrTSJr6zJKFzL6LsnR81gE1vvPoWwhddaRL9zqFnTacG95Lo3Uuybw+Jnt1Mde7ES07Q2jpIVWyc4T0O/d1BlJ9FLjkZp6aVcFUV4bpGRHQxkerltIeXoLJZAiEb2wKZOoDufxjd97CpMXNMo/b/2qVBT+4zpk8U8gMIO8/hC2njj2zC77gVf/AZc37TC+iBOnTrytR+06YWM3MVI296O+72DaipOLK2FmfFiQROvRB78TFF5TbT8yuLgdzH1IFtjO14Em94By1NfXiTPezfHWFy3JzqpL2s6aKXikx4CO1kKQ9ZiMYQgYBPMPow4ZVvI7jiMizp4QQchJRUNTXl02lmhzZD8zp06t143ffh7f2lGYH8v9UwJkBEGrEWnWUSBjn7qhPdqLFtaHcKnRxCjWwyTm52auZgYY40wBLU+F50qi+/yyLvvHaGEZLSjG2YVXLqJsbp+MUXmercRvPZl1LTWoeV7mB4dwc9m/eTGOxD+x7a91HKI+BkqMoOEA57BFQ5YRkiFHEJhlyCQY9AyCMSUQgJldU+lVWJ3JdNI3p+jKUP4Bz/flNdqdzcOKRZhlJIsKOI8jKcY96NvfTNeLt+irvn14c7FODI4GuFsVtfC3bZjA22gvh9j+LtvAU9Xael/CPCXS+osyG76VuEqtciKpaa8Gie+Vcjz91Px61fI961EytgMfngE5Q1xwkEFOn+IMmeGtAS2/Jwwh7BoEskkiUQ8HAC0LJ4Cs0UtjUz8H2uySicdJfE77wbNfQMzrFXmnHI08fPzP0SuVBPBKtNLXLj6WSe+QJk4/+zPb7BGNaSN82SXgFeAjWxB51JHuEGtvkawEuwWjLWjr3sCqzW12DVnACBGOnRPib3bWZs6+OMbPkjid69SDuAbStq6yZZ1DxFIKQRQDoFibiDbSsCQYVta6S18ImCheFQCRdWg6xebboEatYuwHMS6IldZP70KXRy+H8GZGnjrHg79uprZqRX2ujxXWQ3/RtqZPuRMR2H7PCfR5KZFSlMjEHHrmpcz9g+IS1sWxMKZ6mpm6KmJo09Z+RlQTfkC/jQzsq/RJS3oaYOoEY2o6b25UpYPfIHi2iw6l+BvfKdpmBf2gfdMGp4I5mnPg1u4qiDLAIVhM7/KQQrZrSMFcQ/cDfulm+jj5Q2OWSH/zzOwew3j1ZC69IE6VQQpcFxPCJhl7Jyl+ljG0qkcV+Uc+KPbyWw9DKstjeCDKBTw6j+x/H7HzUOipcCL40/+Cx+z7MEzvgsVvO5B2WXZPUanFV/jbv5hqMMsDnRhkjdLJJDmPHNk3tQqfhB041HzwbPF3vb0LAoAzozfSLPiyIBFgKwGtxC5pH34az5ILJ2HSJUg7XkIuz2i81hWz0P4/c/ZsIQL5Gf2Dq/s6LBCmA1nIqqexR/aNPR866tAPaytxQW3AlpvOfJvS94QtVRA3iuRP6PzIWSoNNjZJ/6PFbLWdhLL0dULDW56mAV9vK3Yi97C2roOXAnzLnBh1RnPiLaimw4DX9w01GLfa26kxGx5YUUpbRQU53oiY6jtrFeopMlim1K3kwAWOB3P4bf/6TpKW4+DxFbgQiZwjlZe0IuBnYXkgUAGUCWL0GEY+jMxJFX1QLsFX81p1zWqGc9tQ+dGDtqSLz0AbbCyFiL8TbdBDozAulELnPl4e39LX7vw1hN52E1nIaoPs5U/KvDSMlpH4JViHA9On2EAdYgq49F1qwpTJ0KgU4NosZ2HFXbb7/UJVeWN+Ac/3dmNkdmwixKogcdP4Ca3Iue7EIlE+iO3+L3PIzV9CrsZX+JqGg/rE57YTn5Np0j/R2cFW8vWVyok/2o0eePKqv20gZYkAO0C7vukvyYOUtrdKo/56DsN7MxhjeiJgZh4EmslgsRYtlhAay1Ai85nTg7MouuQVQsQtadVOzoKRc1tR+dGD2qKLz0Ac4m8bZ+H2GFTGeANgyQCNUgwvXI2leg02ej492ose2IQDmycpWJjQ9DRcvIIkOSDP4JNfQsaqIzNxyFF65Ccw30RZohV1elRjYd9dj7pW+DJehMHHfL9WZGRetrjbOi1czRdsEqRKjGeM1agRU4vLIYrcEpQzaegaxeg15yKSrRhRragN//OGpq6PBnVGpzaun0WZBFAGdGUYPPHPWkx5+HFy1BZyZwN30TnRkz02i89IzamwZbWLlZRy+g5ml62FggighUYJW3YdWciL3sCvTkXpMM6H0EMrlM1KGAUWC1vKbguIMZyc6iJ/agkxNHHYE/D4Dz6noKd9tN6PHdOCf+k5HUglkYL6RbXppWTOXlKE9tdCuAEzWN1uFGZO067GOvRA1twu++D39ww/QwofmPlWt7o2n0nvNFtDuFP/j0/wj//ecD8HQc7Kfxuu9HjW83g0MbT59R2Yd9Pws90YG76z+x296A1XA6Wvuz7qVnCgbtCMIuw2q5AKvpbFPd2P2Qmd812ZOfWZqX3kWnQKShmEnLtZ34g+v/R3LS1icvkdfNJur/PC6Nzk7g9zyMHttmSIpI/eGBLAR66gDZDV9ADW3E73nIjHSKtiHCdQd9HdJGOOXImjXYSy7CajzVpP9S/UxPz3eOfy8ytrw456k91OAzeAceKlk/eKRib501pNmflwQX2bksfu9j+P3rsepegb38rciaE2alCkVpW6s9/J4/kH3+BpieNaV9/P6n8Af/ZMYGr3yPObTjoGlHAdJM1gnUngCZMfzuB/GHN5pWUWkVMWnaS+H3PXbUuOeiT7jgdOFLX6hzvVQtWE3nYNW9wowKtoKYaliFTvSihjbgdd5rCtisg1Cj0thQe/lfIcK1xk4vxIZMjx1WXgmVKNCpPtIPvMv8/WiB/ILywX9mQKNAC3Izox3jdU/PxlxouOMbL8VuuwR76ZsRodpZczFegD3TPn73A2T+9C8I52hqthmAJf+/XdMA2rkaee2b6oncY4dFXFgGR2/Pb0g/9B5TujrRAe5ULiQ7zOXTGu0mkLEGhB05qn6P/v9ORf9PXD5gW9htb8RqfjWivBUx3Va7UFpUBtDpQfyu+/D715u68/TITMh1hCTYjUPWqGip8dXLAB+OaCgQjoPVcgFy0Vlmim64voBdO1R4hhUEN47f/wR+/xPo8e2oqU5z7IvgxdlnBV4cMiMg4jej8BFavwzwCwVaNp6B1XAGsv5kRKhm4eFanmRxUWNb8fufMLVmY9vA9V748T2zALZRJDWU/fnEwC8hW2+ZI+68A4+gxrYTiNTPSPKCNsn0fGiBrF6LrDnBnEAztAF/8GnU0NPmBLjDBDp/iKUGW2sG0Cx9GbEXDrSQ5CpCGucBVxzC89b5OmlR3oZVsRzZeAZq9Hn8/vWovkdMD7W9cISnrYWNZh+apS9L8Iu4JMjqNYhoS+lmMu0hrBBaWAbIg0m48gAPEW7Aam1G1pyIbj4fr+ch/K77jRm1FgCwD1qTkmi2vAzui7PFItqCrF5deqSFsPD7nyDzxD/iH7grd0ZQhEPylNoHP4MIVSMXnYlz3N8SOO3LWA3rwDt4eKVzpeIodlifeD0x4AoBL+3z+F6qlwKrfh320jfn4uI5K2+H8Db9K/7gs6jRzfh9f4DUCLKsyXDeC+k40ArhRJBlLaZcOFKNGt2SG4Vc/HQ/C94UqCx32GgeRoG2Xsb3BXnSgRCyajU4FcUN3UKiJ/fjj27LpTsn0dlJ1FQX3oG7DH+eOzJBazUPvTnLIQNEuB572RWIcD3u5m+js5OFrdoql/U0WdT7pPYY0z5P6CPTzPZ/z/yWNZleqFJEh3TwO+8GPccu+xlTqN91H5nH/p70H9+H33Vf7si9wCFUqQZhG769/eJ86no2GaPSoFw84CFbKxRwC3CGFhy9FNb/r/a3rBmr+jh00SEcAqE84xjp+aVS+2n0yPNkR7YgQtVYTedjt19iRh8K5nmtNoeH2WWFw9C0MfG59Ph/o0nKyg+jtOJ27ZHMeV4vXwuNkAJlyJq1aOkUqz9p4/c+jMqOL1DXg06P4u25nfT97yTzx7/F3/tLkzHIM2R6RvXHu1AjzxXQ4drLSW8G0OK7KKHs3B+mEHxLwSctyYurJPy/JL2hGqyaE0sfoSNtvAO/m+kDPhwCReRmeYzugE03IKtXYdW/Elm9GlHWCtrHO3A3fv9TMyHTtPSmQLk8qrXe0PIdtA1QfS3Z4S9zo1C8XwgqZfBlVb2gK1yPqD7WrOwccNXodjNr+4WqxFl8tBr7f+2dzW8bVRDAf7PrOCURQpSS9CspBQ5ISNw5cOBP4MqBIwfSQPiSSJGitEXAoUpAVWmCkFARRByAAxIHDiAhQSUQV6B8SoZN0obQJrbX8e6+94bDW8dOnDQ1ai7ET7Jsr3ZXK/88M2/mzby57Hsi5tEpJZ+wt0pvBrbmszjUyRnNwgQMwT+v5SekLKph0qZ5SU83Ln3jUdhHuP9BRLZSzz3Y0qcdNrzaAXZDsxbaE/PV+uVuE4NmMqeWS0OzxkUjAcFd47B8Bu6eJHWGD1zKF7mYd+3xjdRzT7/Pod4cuZIQjeexS9+1S/ZuPIrzNtdWwa1JpE5eGbqgMcDR8y7/H+QgB06xrCknXZ0/bc0nbnUhbyfBfXmivdnE11fs+3yZXYarHq6pQBaTOMu4rRV+AYhGPNoA4MAELE34i2rLfO8yxu0a100X8rYqU3r3t0SiGscLXnqvfNN5y7r/KLmmClkV59LgrKuHnxx7N7XRSMDR864JGGDgNFw9CffM4kj4yKWcMjFlU/U36trkjWo46DvYbnvDAqb0Ga5S2lXpXYdbgawMNpG3nQmmht8xtVa4sClJZPBVuPoSDE6Rao1ZTZkwMddNxftXarpsPWCBwr6NvmTYi177Cbvwld9obZdsvxrvCmVlyFaxti5vuYyJ4RlzLRptz/lpOzL4Olx5EQ6do24SLriUE6bKX9mq7+LiUrqZH86gceRtV9jrX2kF88fHuPLvu5PK6PJOOjFkK2DKxDaRSWfCl4dn9O/oaX9Oq/TCNiuLZy/B4gtwZBr7/OGXVxAAAAFnSURBVAP8oEW+VstxTbl3g8lpncLvtZGsoJUSEhYhq2B++xATfe6r+G+Fem5UvORrELae29sy2Jr87Iw8ZTPeOzbrqtFoAE7a4LJTvGrxOTg05T/Pj3FAhMclZDLs4c7gNgh6fWw8KNCszdlLEbAgRIp+62NNVm5Jy7r1YEYO1mXePNoa2ETUZTKN03P1lb7S/XOxRicEdGu43AyOhWfh8HQOeZSihBwUeJKAsaCHfim2gA6bEZbGtoPaKun/Q3+4s19zkz1tXNLYdioPOTvr1bFL8gluKlgrF0WZckZ+HZqxaw1XaDuwHT3Swph/P/xGEzQBtwOPifAEAY8EeYQlCHPA4dbd7bpjC9CNHCrbXMt1BtTKZZQ5VC46ZSldDev3vZ+t+7g7we1YruafgSNvtnwfRcRvmXEH8CjwsAgPIRwHBhD696iF7hTyGsqyKiWQH1G+RfkSmEex1gZueMYv/N6M1LaOfwGHK5/1vRI1bQAAAABJRU5ErkJggg==">'
             + '</div>'
             + '<div class="list-body">'
             + '<div class="sizeBody" data-i18n="Dummy.MaintenanceTitle02"></div>'
             + '<div class="sizeCaption" data-i18n="Dummy.MaintenanceInfo02"></div>'
             + '</div>'
             + '</a>'
             + '</li>';
    $("#information").append(html);
};
