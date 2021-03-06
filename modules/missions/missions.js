"use strict";
var Missions = {};

e.Ready.push(function missionsReady(done) {
  $('head').append('<link href="modules/missions/style.css" type="text/css" rel="stylesheet">');
  e.addTemplate('list-missions', 'modules/missions/list-missions.tpl.html');
  $.each(Missions, function (_id, mission) {
    mission._id = _id;
  });
  $.each(Girls, function idGirlMissions(name, girl) {
    if (!girl.Missions) { return; }
    $.each(girl.Missions, function (_id, mission) {
      mission._id = _id;
    });
  });
  done();
});

Mission.checkStart = function checkStart(day, done, preDay) {
  var context = {
    day: day
  };
  var series = [];
  $.each(Missions, function startBaseMissions(_id, mission) {
    if (!mission.conditions || g.missions[_id]) { return; }
    if (mission.preDay != preDay) { return; }
    mission = Mission.create(_id, { day: day });
    if (mission) {
      g.missions[_id] = mission;
      if (!mission.getEnd()) {
        series.push(function (next) { mission.checkDay(next); });
      }
    }
  });
  $.each(Girls, function startGirlMissions(name, girl) {
    if (!girl.Missions) { return; }
    $.each(girl.Missions, function (_id, mission) {
      if (mission.preDay != preDay) { return; }
      context = { day: day, girl: g.girls[name] };
      if (!mission.conditions || g.missions[_id]) { return; }
      mission = Mission.create(_id, context);
      if (mission) {
        g.missions[_id] = mission;
        if (!mission.getEnd()) {
          series.push(function (next) { mission.checkDay(next); });
        }
      }
    });
  });
  e.runSeries(series, done);
};

e.GameNew.push(function missionsNewGame(done) {
  g.missions = {};
  g.missionsDone = {};
  if (g.skipIntro) {
    $.extend(g.missionsDone, Mission.introMissions);
    g.money = 1000;
    g.maxGirls = 5;
    g.maxBuildings = 1;
  }
  delete g.skipIntro;
  Mission.checkStart(-1, done);
});
e.GamePreDay.push(function missionsPreDay(done) {
  var series = [];
  $.each(g.missions, function (_id, mission) {
    if (mission.base().preDay) {
      series.push(function (next) {
        mission.checkDay(next);
      });
    }
  });
  e.runSeries(series, function () {
    Mission.checkStart(g.day, done, true);
  });
});

e.GameNextDay.push(function missionsNextDay(done) {
  var series = [];
  $.each(g.missions, function (_id, mission) {
    if (!mission.base().preDay) {
      series.push(function (next) {
        mission.checkDay(next);
      });
    }
  });
  e.runSeries(series, function () {
    Mission.checkStart(g.day, done);
  });
});

e.GameRender.push(function missionsRenderGame(done) {
  var count = Object.keys(g.missions).length;
  if (!count) {
    done();
    return;
  }
  var button = $('<button>').html('Missions').button();
  if (!g.missions._filter('display').length) {
    button.button('option', 'disabled', true);
  }
  $('#top-right').prepend(button);
  button.click(function openMissionDialog() {
    var view = e.render('list-missions', {
      missions: g.missions
    });
    view.dialog({
      title: 'Missions',
      maxHeight: '100%'
    });
    view.closest('.ui-dialog').addClass('tab-dialog');
  });
  done();
});

e.GirlSetStatus.push(function missionsSetGirlStatus(girl) {
  g.missions._filter('girl', girl.name).forEach(function (mission) {
    if (!mission.conditions || !mission.conditions.girl || !girl.compare(mission.conditions.girl)) {
      delete g.missions[mission._id];
    }
  });
});

e.BuildingSetStatus.push(function MissionsSetBuildingStatus(building) {
  g.missions._filter('building', building.name).forEach(function (mission) {
    if (!mission.conditions || !mission.conditions.building || !building.compare(mission.conditions.building)) {
      delete g.missions[mission._id];
    }
  });
});
