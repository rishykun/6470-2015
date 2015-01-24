describe("main", function() {
  //var Server =  require('../js/main.js');
  var scope, controller;
  //Tests

  /*
  Authentication:
  1. Test that signing up 
      - Creates ???
  2. Test that two people cannot sign up with the same username
  3. Test that


  */
  beforeEach(function(){
    module('main');
  });

  describe('MainController',function(){
    beforeEach(inject(function($rootScope,$controller){
    scope = $rootScope.$new();
    controller = $controller('MainController',{
      '$scope':scope
      });
    }));

    it('sets the name', function(){
      expect(scope.name).toBe("Main");
    });
  });



  //var angular = require('../../public/angular-1.3.8/angular.js');
  //var Main = require('../../public/js/main.js');
  //var main = new Main();
  /*it("random test",function(){
    //console.log(main.getCurrentState());
    expect(true).toEqual(true);
  });*/
  /*var Player = require('../src/Player.js');
  var Song = require('../src/Song.js');
  var player;
  var song;

  beforeEach(function() {
    player = new Player();
    song = new Song();
  });

  it("should be able to play a Song", function() {
    player.play(song);
    expect(player.currentlyPlayingSong).toEqual(song);

    //demonstrates use of custom matcher
    expect(player).toBePlaying(song);
  });

  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrowError("song is already playing");
    });
  });*/
});

// --- Runner -------------------------
/*(function () {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    var currentWindowOnload = window.onload;

    window.onload = function () {
        if (currentWindowOnload) {
            currentWindowOnload();
        }
        execJasmine();
    };

    function execJasmine() {
        jasmineEnv.execute();
    }

})();*/
