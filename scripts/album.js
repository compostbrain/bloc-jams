var setSong = function (songNumber) {
    if (currentSoundFile) {
        currentSoundFile.stop();
    }

    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        // #2
        formats: ['mp3'],
        preload: true
    });

    setVolume(currentVolume);
};

var seek = function (time) {
    if (currentSoundFile) {
        currentSoundFile.setTime(time);
    }
};

var setVolume = function (volume) {
    if (currentSoundFile) {
        currentSoundFile.setVolume(volume);
    }
};
/*
Write a function called filterTimeCode that takes one argument, timeInSeconds. It should:
Use the parseFloat() method to get the seconds in number form.
Store variables for whole seconds and whole minutes (hint: use Math.floor() to round numbers down).
Return the time in the format X:XX
*/
const filterTimeCode = (timeInSeconds) => {
    let seconds = parseFloat(timeInSeconds);
    let mn = Math.floor(seconds % 3600 / 60);
    let sc = Math.floor(seconds % 60);
    return(mn +":"+ sc);
};
var getSongNumberCell = function (number) {
    return ('.song-item-number[data-song-number="' + number + '"]');
};

var createSongRow = function (songNumber, songName, songLength) {
    let template =
        '<tr class="album-view-song-item">' +
        '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>' +
        '  <td class="song-item-title">' + songName + '</td>' +
        '  <td class="song-item-duration">' + songLength + '</td>' +
        '</tr>',
        $row = $(template);


    var clickHandler = function () {
        var $volumeFill = $('.volume .fill');
        var $volumeThumb = $('.volume .thumb');
        $volumeFill.width(currentVolume + '%');
        $volumeThumb.css({
            left: currentVolume + '%'
        });


        var songNumber = parseInt($(this).attr('data-song-number'));
        //Update clickHandler() to set the CSS of the volume seek bar to equal the currentVolume.

        if (currentlyPlayingSongNumber !== null) {
            // Revert to song number for currently playing song because user started playing new song.
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
            $(currentlyPlayingCell).html(currentlyPlayingSongNumber);
        }
        if (currentlyPlayingSongNumber !== songNumber) {
            // Switch from Play -> Pause button to indicate new song is playing.

            setSong(songNumber);
            currentSoundFile.play();

            $(this).html(pauseButtonTemplate);
            updateSeekBarWhileSongPlays();

            currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
            updatePlayerBarSong();
        } else if (currentlyPlayingSongNumber === songNumber) {
            // Switch from Pause -> Play button to pause currently playing song.
            if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $playPause.html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $playPause.html(playerBarPlayButton);
                currentSoundFile.pause();
            }

        }
    };

    var onHover = function (event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));


        if (songNumber !== currentlyPlayingSongNumber) {
            $(songNumberCell).html(playButtonTemplate);
        }
    };

    var offHover = function (event) {
        var songNumberCell = $(this).find('.song-item-number');
        var songNumber = parseInt(songNumberCell.attr('data-song-number'));


        if (songNumber !== currentlyPlayingSongNumber) {
            $(songNumberCell).html(songNumber);
        }
    };

    $row.find('.song-item-number').click(clickHandler);
    // #2
    $row.hover(onHover, offHover);
    // #3
    return $row;
};

var setCurrentAlbum = function (album) {
    currentAlbum = album;

    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
        var $newRow = createSongRow(i + 1, album.songs[i].title, filterTimeCode(album.songs[i].duration));
        $albumSongList.append($newRow);
    }
};

/*
Write a function called setCurrentTimeInPlayerBar() that takes one argument, currentTime, that sets the text of the element with the .current-time class to the current time in the song.
Add the method to updateSeekBarWhileSongPlays() so the current time updates with song playback.
*/
const setCurrentTimeInPlayerBar = (currentTime) => {
    $('.current-time').html(currentTime);
};
var updateSeekBarWhileSongPlays = function () {
    if (currentSoundFile) {
        // #10
        currentSoundFile.bind('timeupdate', function (event) {
            // #11
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(filterTimeCode(currentSoundFile.getTime()));
        });
    }
};
var updateSeekPercentage = function ($seekBar, seekBarFillRatio) {
    var offsetXPercent = seekBarFillRatio * 100;
    // #1
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);

    // #2
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({
        left: percentageString
    });
};

var setupSeekBars = function () {
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function (event) {
        // #3
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();
        // #4
        var seekBarFillRatio = offsetX / barWidth;
        if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
        } else {
            setVolume(seekBarFillRatio * 100);
        }

        // #5
        updateSeekPercentage($(this), seekBarFillRatio);

    });

    $seekBars.find('.thumb').mousedown(function (event) {
        // #8
        var $seekBar = $(this).parent();

        // #9
        $(document).bind('mousemove.thumb', function (event) {
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;

            if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
            } else {
                setVolume(seekBarFillRatio);
            }

            updateSeekPercentage($seekBar, seekBarFillRatio);
        });

        // #10
        $(document).bind('mouseup.thumb', function () {
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });

};

var trackIndex = function (album, song) {
    return album.songs.indexOf(song);
};
var nextSong = function () {
    //Know what the previous song is. This includes the situation in which the next song is the first song, following the final song in the album (that is, it should "wrap" around).
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex++;
    if (currentSongIndex >= currentAlbum.songs.length) {
        currentSongIndex = 0;
    }
    let lastSongNumber = currentlyPlayingSongNumber;

    //Use the trackIndex() helper function to get the index of the current song and then increment the value of the index.
    //Set a new current song to currentSongFromAlbum.
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    //Update the player bar to show the new song.
    updatePlayerBarSong();
    //Update the HTML of the previous song's .song-item-number element with a number.
    //Update the HTML of the new song's .song-item-number element with a pause button.
    var $nextSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $nextSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
}
var previousSong = function () {
    //Know what the previous song is. This includes the situation in which the next song is the first song, following the final song in the album (that is, it should "wrap" around).
    var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = currentAlbum.songs.length - 1;
    }
    let lastSongNumber = currentlyPlayingSongNumber;

    //Use the trackIndex() helper function to get the index of the current song and then increment the value of the index.
    //Set a new current song to currentSongFromAlbum.
    setSong(currentSongIndex + 1);
    currentSoundFile.play();
    updateSeekBarWhileSongPlays();
    currentSongFromAlbum = currentAlbum.songs[currentSongIndex];
    //Update the player bar to show the new song.
    updatePlayerBarSong();
    $playPause.html(playerBarPauseButton);
    //Update the HTML of the previous song's .song-item-number element with a number.
    //Update the HTML of the new song's .song-item-number element with a pause button.
    var $previousSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
    var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');

    $previousSongNumberCell.html(pauseButtonTemplate);
    $lastSongNumberCell.html(lastSongNumber);
}

var togglePlayFromPlayerBar = function () { //Write a function so that users can play and pause a song from the bar, as shown in the demo above. The function should be named togglePlayFromPlayerBar(), take no arguments, and have the following behavior:
    //If a song is paused and the play button is clicked in the player bar, it will
    //Change the song number cell from a play button to a pause button
    //Change the HTML of the player bar's play button to a pause button
    //Play the song
    if (currentSoundFile == null) {
        setSong(1);
        $playPause.html(playerBarPlayButton);
        var $currentSongNumberCell = $('.song-item-number[data-song-number="' + currentlyPlayingSongNumber + '"]');
        $currentSongNumberCell.html(pauseButtonTemplate);
        currentSoundFile.play();

    } else if (currentSoundFile.isPaused()) {
        $(this).html(pauseButtonTemplate);
        $playPause.html(playerBarPauseButton);
        currentSoundFile.play();
    } else {
        $(this).html(playButtonTemplate);
        $playPause.html(playerBarPlayButton);
        currentSoundFile.pause();
    }
    //If the song is playing (so a current sound file exist), and the pause button is clicked
    //Change the song number cell from a pause button to a play button
    //hange the HTML of the player bar's pause button to a play button
    //Pause the song


};
/*
Write a function called setTotalTimeInPlayerBar() that takes one argument, totalTime, that sets the text of the element with the .total-time class to the length of the song.
Add the method to updatePlayerBarSong() so the total time is set when a song first plays.
*/
const setTotalTimeInPlayerBar = (totalTime) => {
    $('.total-time').html(totalTime);
};
var updatePlayerBarSong = function () {

    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $playPause.html(playerBarPauseButton);
    setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.duration));
};


var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';
// Store state of playing songs
var currentAlbum = null;

var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;


var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPause = $('.main-controls .play-pause');

$(document).ready(function () {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPause.click(togglePlayFromPlayerBar);
});
//Create a variable to hold the $('.main-controls .play-pause') selector and add a click() event to it in the $(document).ready() block with togglePlayFromPlayerBar() as an event handler.
