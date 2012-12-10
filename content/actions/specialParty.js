define(['messages/messages'], function(Message) {
  return {
    _id: 'attendParty',
    label: 'Escort for <%= g.missions.specialParty.people[0].name %>',
    description: 'Once every month, the city throws a gala party for whatever rich and powerful visitors are present at the time. It is traditional for those who can afford it to have an escort accompany them in the evening - and lacking anyone to accompany him, <%= g.missions.specialParty.people[0].name %> has approached you to provide one.',
    conditions: function(time) {
      if (time != 'evening') { return false; }
      var m = g.missions.specialParty;
      if (!m || g.day != m.end.day) { return false; }
      var attending = this.name;
      for (var name in g.girls) {
        if (g.girls[name].actions.evening == 'attendParty') {
          attending = name;
          break;
        }
      }
      return attending == this.name;
    },
    mins: {
      obedience: 40,
      happiness: 40,
      endurance: 40
    },
    extraData: {
      delta: {
        happiness: 25,
        endurance: -40,
        charisma: 5
      },
      money: [10, 5, 2, 1],
      libido: [8, 5],
      experience: [10, 4],
      message: [
        "<%= girl.name %> arrived at <%= client.name %>'s in early, wearing her finest clothing. She was met in the common room by a servant - the master wasn't ready quite yet, having stayed up a little too late last night. The servant apologized for the commonness of the surroundings - at home, <%= client.name %> had a fine mansion, but not planning on staying in this city long, had decided to make do by renting a set of rooms. <%= girl.name %> nodded and smiled - in her eyes, the inn was quite a fine one, nothing to be apologizing over at all.<br><br><%= client.name %> finally arrived and took her hand.",
       "The main street is crowded to the brim with party-goers, lit from above by strings of paper lanterns and by a seemingly endless stream of candles floating on tiny rafts down the river, each one carrying the sorrows or regrets of someone in the city out to sea. Initially the party is merely loud and exciting - <%= client.name %> and <%= girl.name %> wander the streets, and <%= client.name %> buys an endless stream of whatever nick-nacks or delicacies catches either one of their interests.<br><br>As the evening goes on and drink begins to set in, clothing begins to dwindle - first a set of young men missing their shirts, then a dancing circle of women in nothing but their underwear. Now when did <%= girl.name %> loose her shirt? She can't quite remember - probably when someone spilled a beer. <%= client.name %> remains a perfect gentleman even as she looses steadily more clothing to \"accidents\" - and finally, he's happily parading her around the streets totally naked.",
       "She can hardly object at this point when he finally decides to conclude the evening in style, with a private room back at his inn. If she's ever been in a more luxurious setting, she can't remember it. He's apparently brought his own king-sized bed, an endless array of pillows, and all sorts of interesting toys to entertain her with - <%= girl.name %>'s eyes go wide at the size of one of the dildos. He's going to fit <em>that</em> inside of her?<br><br>As a matter of fact he does, for a warmup that leaves her panting on all fours and begging him to fuck her properly. It's just the start though - she's his for the whole evening. After countless passionate rounds, the light of dawn finally peeks over the eastern horizon. He thanks her for her company, hands her a very large sack of coins, and leaves her to make her way back to her room in an exhausted but pleased and satisfied haze."
      ],
      image: ['<%= client.image %>', 'content/missions/festival.jpg', '<%= girl.image(client.sex[0]) %>']
    },
    func: function(config, time) {
      var client = g.missions.specialParty.people[0];
      var mission = g.missions.specialParty;
      var reward = $.extend({}, config.delta);
      var money = this.get(client.wants[0]) * config.money[0];
      money += this.get(client.wants[1]) * config.money[1];
      money += this.get(client.wants[2]) * config.money[2];
      money += this.get(client.wants[3]) * config.money[3];
      reward.money = money;
      console.log(reward);

      reward[client.sex[0] + ' libido'] = config.libido[0];
      reward[client.sex[1] + ' libido'] = config.libido[1];
      reward[client.sex[0] + ' experience'] = config.experience[0];
      reward[client.sex[1] + ' experience'] = config.experience[1];

      var endDelta = this.startDelta();
      this.apply(reward);
      var context = {
        girl: this,
        client: mission.people[0],
        mission: mission
      };
      for (var i in config.message) {
        var message = new Message({
          type: mission.name,
          text: ejs.render(config.message[i], context),
          image: ejs.render(config.image[i], context),
          time: time,
          delta: i + 1 == config.message.length ? endDelta() : {}
        });
        if (i == config.message.length - 1) {
          message.delta = endDelta();
        }
        message.save(this.name);
      }
    }
  };
});