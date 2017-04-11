
var level = 0;
var moves = 0;
var logDiv = null;

var innerDiv;
var spanMoves;
var spanLevel;
var commentsPanel;

const map_ROWS = 10;
const map_COLUMNS = 10;

// maximum number of characters including initial character and clones:
const MAX_CHARS = 10;

var map = new Array(map_ROWS * map_COLUMNS);
var map_links = new Array(map_ROWS * map_COLUMNS);
var start_pos = 0;

const map_EMPTY = 'E';
const map_WALL = 'W';
const map_HOLE = 'H';
const map_TARGET = 'D'; // D for "destination"
const map_TELEPORTER = 'T';
const map_RETROPELET = 'R';
const map_STARTPOS = 'P';

const action_MOVE = 1;
const action_RESTART = 2;
const action_NEXTLEVEL = 3;

const orient_DEFAULT = 'Z'; // for "zero"
const orient_HORIZONTAL = 'H';
const orient_VERTICAL = 'V';
const orient_LEFT = 'L';
const orient_RIGHT = 'R';
const orient_OPPOSITE = 'O'; // 180 degrees

const LEFT = 'L';
const RIGHT = 'R';
const UP = 'U';
const DOWN = 'D';

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_SPACE = 32;
const KEY_R = 82;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;
const KEY_C = 67;


const STATE_PLAYING = 0;
const STATE_FAILED = 1;
const STATE_WIN = 2;


const IMG_EMPTY = 'Graphics/Empty.bmp';
const IMG_WALL = 'Graphics/Wall.bmp';
const IMG_HOLE = 'Graphics/Hole.bmp';
const IMG_TARGET = 'Graphics/Destination.bmp';
const IMG_TELEPORTER = 'Graphics/Teleporter.bmp';
const IMG_RETROPELET_DEFAULT = 'Graphics/Retropelet.bmp';
const IMG_RETROPELET_MIRROR_H = 'Graphics/RetropeletMirrorH.bmp';
const IMG_RETROPELET_MIRROR_V = 'Graphics/RetropeletMirrorV.bmp';
const IMG_RETROPELET_LEFT = 'Graphics/RetropeletLeft.bmp';
const IMG_RETROPELET_RIGHT = 'Graphics/RetropeletRight.bmp';
const IMG_RETROPELET_OPPOSITE = 'Graphics/Retropelet180.bmp';

const IMG_PLAYER_HOLE = 'Graphics/PlayerHole.bmp';
const IMG_CLONE_HOLE = 'Graphics/CloneHole.bmp';

const IMG_PLAYER = 'Graphics/Player.png';
const IMG_CLONE = 'Graphics/Clone.png';

const RELATIVE_OFFSET_TOP = -320;
const RELATIVE_OFFSET_LEFT = 0;

// Player and clone positions and orientation:
var characters = new Array();

var targets = new Array();

var teleporters = new Array();
var retropelets = new Array();
var tp_orientations = new Array();

var curr_state;

var i;
var j;


var levels = new Array("W12E5W5E2DE2W5E5W5E2HE2W5E5W5E5W5E5W5E5W13P74",
                       "W11E3W2E3W2ET1EW2E3W2E3W2ERZ1EW2E3W2E3W2E3W2E3W2E3W2E3W2EDEW2EDEW2E3W2E3W11P71",
                       "W13E3W7EDEW7E3W5EHEHE4W2EDEHE2RL1EW2E2HE5W4ET1EW7E3W14P83",
                       "W11E3W2E3W2EDEW2EDEW2E4WH2EW2EHE6W2E7HW2E2HE5W2ET1EW2ERH1EW2E3W2E3W11P82",
                       "W12EW2E4W3DW2E4W2DE4HRL1EW3EWE5W3EW8E4W6E2T1EW6E4W15P82",
                       "W12E3HE2W3EDEHE2RV1EW2E8W2E6WEW2EHE2HE3W2EWE3HE2W2E2DEHET1EW3E2HE3W12P82"
                       );
//"E11DE6DE3HE5HE23W3E3RH1E13T1E3W2E22P90"
var comments = new Array("arrow keys to move <br /><br /> space bar to restart", "it's not safe to go alone","watch out for the holes","getting complicated","careful now","almost done...");



function Character(id, position, orientation)
{
    this.id = id;
    this.position = position;
    this.orientation = orientation;
}

function Teleporter(id, position, destination, orientation)
{
    this.id = id;
    this.position = position;
    this.destination = destination;
    this.orientation = orientation;
    this.used = false;
}



// Initialize the game inside the given containing HTML element:
function initializeGame(container_name)
{
    initializeRender(container_name);
    initializeLevel(0);

    curr_state = STATE_PLAYING;
    document['onkeydown'] = handle_keydown;
}

// Initializes a level by clearing the clones, setting the player position and drawing the new map:
function initializeLevel(level_id)
{
    innerDiv.style.backgroundColor = "white";

    level = level_id;
    moves = 0;

    if (level_id < levels.length)
    map_string = levels[level_id];

    readMap(map_string);
    renderMap();

    // Clear player and clone positions and orientation:
    characters = new Array();
    var player = new Character(0, start_pos, orient_DEFAULT);
    characters.push(player);

    renderPlayer();
    renderPanel();

    commentsPanel.innerHTML = comments[level];
}


// Occurs when the player wins a level:
function winLevel()
{
  debugger;
//  alert('winLevel!');
  commentsPanel.innerHTML = "level complete <br /><br /> any key to continue";
  curr_state = STATE_WIN;
}

// Occurs when the player failed a level (fell into a hole):
function failLevel()
{
  commentsPanel.innerHTML = "watch out for the holes <br /><br /> space bar to restart";
  innerDiv.style.backgroundColor = "#ffcccc";
//  alert('failLevel!');
  curr_state = STATE_FAILED;
}

// Occurs when the player won the last level:
function winGame()
{
  commentsPanel.innerHTML = "congratulations <br /><br /> you have finished all the levels <br /><br /> space bar to restart level 1";
  level = 0;
  // To make the game restart we set it back to failed state:
  curr_state = STATE_FAILED;
}

// Read map from a string and initialize it:
function readMap(map_string)
{
  // Re-initialize targets and teleporters arrays:
  targets = new Array();

  teleporters = new Array();

  var tel;
  var found;
  var count;
  var skip;

  var map_index = 0;
  i = 0;
  while (i < map_string.length)
  {
    switch (map_string[i])
    {
      case map_EMPTY:
      case map_WALL:
      case map_HOLE:
           // In those 3 cases the next letter MIGHT be a count of the number of consecutive elements:
           count = 0;
           j = i + 1;
           while ((j < map_string.length) && !isNaN(map_string[j]))
           {
                 count = count * 10;
                 count += parseInt(map_string[j]);
                 j++;

//logDiv.innerHTML += "count = " + count + "<br />";

           }

           skip = j;
           if (count == 0)
              count = 1;

           for (j = 0; j < count; j++)
           {
               map[map_index] = map_string[i];
               map_index++;
           }

//logDiv.innerHTML += map_string[i];

           i = skip - 1; // cause later it gets i++


           break;

      case map_TARGET:
           // First add the map symbol to the array:
           map[map_index] = map_string[i];
           map_index++;

//logDiv.innerHTML += map_string[i];

           // Add a target to the array:
           targets.push(map_index);
           break;

      case map_TELEPORTER:
           // First add the map symbol to the array:
           map[map_index] = map_string[i];

//logDiv.innerHTML += map_string[i];

           // Reading the next character:
           i++;
           // Get the teleporter id:
           id = map_string[i];
           found = false;
           // Search for the id in the teleporters (maybe the retropelet was encountered already):
           for (j = 0; j < teleporters.length; j++)
               if (teleporters[j].id == id)
               {
                  teleporters[j].position = map_index;
                  map_links[map_index] = teleporters[j];

                  found = true;
//logDiv.innerHTML += "<br /> Teleporter Found " + id + "<br />";
               }

           if (!found)
           {
             tel = new Teleporter(id, map_index, -1, -1);
             teleporters.push(tel);
             map_links[map_index] = tel;
//logDiv.innerHTML += "<br /> New Teleporter " + id + "<br />";
           }

           map_index++;
           break;

      case map_RETROPELET:
           // First add the map symbol to the array:
           map[map_index] = map_string[i];

//logDiv.innerHTML += map_string[i];

           // Reading the next character:
           i++;
           // Get the retropelet orientation:
           orient = map_string[i];
//logDiv.innerHTML += map_string[i];
           // Reading the next character:
           i++;
           // Get the teleporter id:
           id = map_string[i];
//logDiv.innerHTML += map_string[i];

           found = false;
           // Search for the id in the teleporters (maybe the teleporter was encountered already):
           for (j = 0; j < teleporters.length; j++)
               if (teleporters[j].id == id)
               {
                  teleporters[j].destination = map_index;
                  teleporters[j].orientation = orient;
                  map_links[map_index] = teleporters[j];

                  found = true;
//logDiv.innerHTML += "<br /> Teleporter Found " + id + "<br />";
               }

           if (!found)
           {
             tel = new Teleporter(id, -1, map_index, orient);
             teleporters.push(tel);
             map_links[map_index] = tel;

//logDiv.innerHTML += "<br /> New Teleporter " + id + "<br />";
           }

           map_index++;

           break;

       case map_STARTPOS:
            // Set the starting position of the player:
           count = 0;
           j = i + 1;
           while ((j < map_string.length) && !isNaN(map_string[j]))
           {
                 count = count * 10;
                 count += parseInt(map_string[j]);
                 j++;
           }

           start_pos = count;
           i = j - 1; // cause later it gets i++
           break;

    }

    i++;
  }

  if (map_index != map_ROWS * map_COLUMNS)
     alert("Warning - level data is corrupt! " + map_index);

}

// Perform the game loop:
function gameLoop(actioncode, param)
{
  curr_state = STATE_PLAYING;

  if (actioncode == action_MOVE)
  {
    var state = movePlayer(param);

    renderPlayer();
    renderPanel();

    if (state == STATE_FAILED)
        // Player fell into a hole and failed the level:
        failLevel();
    else if (state == STATE_WIN)
        // Player has reached all targets and won the level:
        winLevel();
  }

  else if (actioncode == action_RESTART)
      // Restarting current level:
      initializeLevel(level);

  else if (actioncode == action_NEXTLEVEL)
  {
      if (level + 1 < levels.length)
          // Moving on to next level:
          initializeLevel(level + 1);
      else
          // No more levels - player has won the game:
          winGame();
  }

}


function movePlayer(param)
{
  var hole = false;
  var numOfTargets = 0;

  moves++;

  // Characters may be added during the move:
  var prev_length = characters.length;

  for (i = 0; i < prev_length; i++)
  {
    // Figure out the new direction:
    var new_dir = switchDirection(param, characters[i].orientation);
    // Figure out the new position:
    var new_pos = calcPosition(characters[i].position, new_dir);

    var updatePos = true;
    // Verify the position is legal:

    switch (map[new_pos])
    {
        case map_EMPTY:
        case map_RETROPELET:
             // Nothing special here...
             break;

        case map_WALL:
             // Deny: can't walk into walls - so position doesn't change:
             updatePos = false;
             // If old position is a target then add one to the number of targets:
             if (map[characters[i].position] == map_TARGET)
             {
                 numOfTargets++;
             }
             break;

        case map_HOLE:
             // Death: one of the characters fell into a hole:
             hole = true;
             break;

        case map_TARGET:
             // Character reached a target:
             // FUTURE FIX: add check that two characters are not on the same target:
             numOfTargets++;
             break;

        case map_TELEPORTER:
             // Character entered teleporter:

             // First get the teleporter from the map:
             var tel = map_links[new_pos];
             if (!tel.used)
             {
                 // If the teleporter wasn't used create a clone for the character:
                 var clone = new Character(characters.length, tel.destination, tel.orientation);
                 characters.push(clone);
                 tel.used = true;
             }
             break;
    }

    if (updatePos)
       characters[i].position = new_pos;

  }

  if (hole)
      // One of the characters fell into a hold, so game over:
      return STATE_FAILED;
  else if (numOfTargets == targets.length)
      // All targets were reached - the player won the level:
      return STATE_WIN;
  else
      // Normal play continue:
      return STATE_PLAYING;

}

function calcPosition(position, direction)
{
    var new_pos;

    switch (direction)
    {
      case LEFT:
           if (position % map_COLUMNS != 0)
               new_pos = position - 1;
           else
               new_pos = position;
           break;

      case RIGHT:
           if ((position + 1) % map_COLUMNS != 0)
               new_pos = position + 1;
           else
               new_pos = position;
           break;

      case UP:
           if (position < map_COLUMNS)
               new_pos = position;
           else
               new_pos = position - map_COLUMNS;
           break;

      case DOWN:
           if ((position / map_COLUMNS) < (map_ROWS - 1))
               new_pos = position + map_COLUMNS;
           else
               new_pos = position;
           break;
    }

    return new_pos;
}

function switchDirection(old_dir, orient)
{
    var new_dir;
    // Figure out the new direction:
    switch (orient)
    {
        case orient_DEFAULT:
             // No change in orientation:
             new_dir = old_dir;
             break;

        case orient_HORIZONTAL:
             // Switch right and left:
             if (old_dir == LEFT)
                 new_dir = RIGHT;
             else if (old_dir == RIGHT)
                 new_dir = LEFT;
             else
                 new_dir = old_dir;
             break;

        case orient_VERTICAL:
             // Switch up and down:
             if (old_dir == UP)
                 new_dir = DOWN;
             else if (old_dir == DOWN)
                 new_dir = UP;
             else
                 new_dir = old_dir;
             break;

        case orient_LEFT:
             // Switch everything:
             switch (old_dir)
             {
                 case UP:
                      new_dir = LEFT;
                      break;
                 case LEFT:
                      new_dir = DOWN;
                      break;
                 case DOWN:
                      new_dir = RIGHT;
                      break;
                 case RIGHT:
                      new_dir = UP;
                      break;
             }
             break;

        case orient_RIGHT:
             // Switch everything:
             switch (old_dir)
             {
                 case UP:
                      new_dir = RIGHT;
                      break;
                 case RIGHT:
                      new_dir = DOWN;
                      break;
                 case DOWN:
                      new_dir = LEFT;
                      break;
                 case LEFT:
                      new_dir = UP;
                      break;
             }
             break;

        case orient_OPPOSITE:
             // Switch everything:
             switch (old_dir)
             {
                 case UP:
                      new_dir = DOWN;
                      break;
                 case RIGHT:
                      new_dir = LEFT;
                      break;
                 case DOWN:
                      new_dir = UP;
                      break;
                 case LEFT:
                      new_dir = RIGHT;
                      break;
             }
             break;
    }

    return new_dir;
}

// Initializes the render inside the given HTML container:
function initializeRender(container_name)
{
    var container = document.getElementById(container_name);
    if (container != null)
    {
        innerDiv = document.createElement('DIV');
        container.appendChild(innerDiv);
        innerDiv.style.position = "absolute";
//        container.style.position = "absolute";
        // Get the container to the horizontal middle of the screen:
        var screenWidth = document.body.clientWidth;
        var mapWidth = 32 * map_COLUMNS;
        var container_left = (screenWidth - mapWidth) / 2;

//        container.style.left = container_left + "px";
        innerDiv.style.left = container_left + "px";





        // LOG:
        logDiv = document.createElement('DIV');
        logDiv.setAttribute("id", "divLog");
        logDiv.setAttribute("style", "position: absolute; top: 400px;");

//        container.appendChild(logDiv);

logDiv.innerHTML = "Started Log.<br />";

        var cellNumber = 0;
          for (j = 0; j < map_ROWS; j++)
          {
              var div = document.createElement('DIV');

              for (i = 0; i < map_COLUMNS; i++)
              {
                  var img = document.createElement('IMG');
                  img.setAttribute('height', '32px');
                  img.setAttribute('width', '32px');
                  img.setAttribute('id', 'cell' + cellNumber);

                  div.appendChild(img);

                  cellNumber++;
              }
              innerDiv.appendChild(div);

//logDiv.innerHTML += "Appended cell" + cellNumber + ".<br />";

          }

          // Initialize a maximum of 10 clones - cause I said so that's why
          // They will be hidden until used
          for (j = 0; j < MAX_CHARS; j++)
          {
              var img = document.createElement('IMG');
              img.setAttribute('height', '32px');
              img.setAttribute('width', '32px');
              img.setAttribute('id', 'char' + j);
              img.style.position = 'absolute';
              img.style.visibility = 'hidden';

              if (j == 0)
              {
                img.setAttribute('src', IMG_PLAYER);
              }
              else
              {
                img.setAttribute('src', IMG_CLONE);
              }

              innerDiv.appendChild(img);
          }
          
          // Add a score panel:
          var scorePanel = document.createElement('DIV');
          scorePanel.id = "scorePanel";
          
          spanMoves = document.createElement('SPAN');
          spanMoves.id = "spanMoves";
          spanMoves.innerHTML = moves + " Moves";
          spanMoves.style.float = "left";
          spanMoves.style.textAlign = "left";
//          spanMoves.style.border = "1px solid black";
          spanMoves.style.marginTop = "10px";
          spanMoves.style.paddingRight = "30px";


          spanLevel = document.createElement('SPAN');
          spanLevel.id = "spanLevel";
          spanLevel.innerHTML = "Level " + (level + 1);
          spanLevel.style.float = "right";
          spanLevel.style.textAlign = "right";
//          spanLevel.style.border = "1px solid black";
          spanLevel.style.marginTop = "10px";
          spanLevel.style.paddingLeft = "30px";

          commentsPanel = document.createElement('DIV');
          commentsPanel.id = "commentsPanel";
          commentsPanel.style.paddingTop = "400px";
//          commentsPanel.style.border = "1px solid black";



          scorePanel.appendChild(spanMoves);
          scorePanel.appendChild(spanLevel);
          innerDiv.appendChild(scorePanel);

          container.appendChild(commentsPanel);

    }
}

// Render the current map:
function renderMap()
{
    var cell;
    for (i = 0; i < map.length; i++)
    {
        cell = document.getElementById('cell' + i);

        if (cell != null)
        {
            switch (map[i])
            {
                case map_EMPTY:
                     cell.setAttribute('src', IMG_EMPTY);
                     break;

                case map_WALL:
                     cell.setAttribute('src', IMG_WALL);
                     break;

                case map_HOLE:
                     cell.setAttribute('src', IMG_HOLE);
                     break;

                case map_TARGET:
                     cell.setAttribute('src', IMG_TARGET);
                     break;

                case map_TELEPORTER:
                     cell.setAttribute('src', IMG_TELEPORTER);
                     break;

                case map_RETROPELET:
                     // Get the orientation for this retropelet:
                     var tel = map_links[i];
                     switch (tel.orientation)
                     {
                         case orient_DEFAULT:
                              cell.setAttribute('src', IMG_RETROPELET_DEFAULT);
                              break;

                         case orient_HORIZONTAL:
                              cell.setAttribute('src', IMG_RETROPELET_MIRROR_H);
                              break;

                         case orient_VERTICAL:
                              cell.setAttribute('src', IMG_RETROPELET_MIRROR_V);
                              break;

                         case orient_LEFT:
                              cell.setAttribute('src', IMG_RETROPELET_LEFT);
                              break;

                         case orient_RIGHT:
                              cell.setAttribute('src', IMG_RETROPELET_RIGHT);
                              break;

                         case orient_OPPOSITE:
                              cell.setAttribute('src', IMG_RETROPELET_OPPOSITE);
                              break;

                     }
                     break;

            }
        }
    }

}


// Render the player character and clones on the map:
function renderPlayer()
{
    var img;
    var img_top;
    var img_left;
    var pos;
    var block_top;
    var block_left;

    for (i = 0; i < MAX_CHARS; i++)
    {
        img = document.getElementById('char' + i);
        if (img != null)
        {
            if (i < characters.length)
            {
                // Calculate top:
                pos = characters[i].position;

                if (map[pos] != map_HOLE)
                {
                    block_left = pos % map_COLUMNS;
                    block_top = (pos - block_left) / map_COLUMNS;
                    img_left = (block_left * 32) + 'px';
                    img_top = (block_top * 32) + 'px';

                    img.style.top = img_top;
                    img.style.left = img_left;
                    img.style.visibility = 'visible';
                }
                else
                {
                    // Hide player image and integrate with hole image:
                    img.style.visibility = 'hidden';

                    cell = document.getElementById('cell' + pos);
                    if (cell != null)
                    {
                        if (i == 0)
                            cell.setAttribute('src', IMG_PLAYER_HOLE);
                        else
                            cell.setAttribute('src', IMG_CLONE_HOLE);
                    }
                }
            }
            else
            {
                // Hide character image since it is not active:
                img.style.visibility = 'hidden';
            }
        }
    }
}

// Updates the score panel:
function renderPanel()
{
    spanMoves.innerHTML = moves + " Moves";
    spanLevel.innerHTML = "Level " + (level + 1);
}

function handle_keydown(e)
{
    var evt = e || window.event;

    if (evt.keyCode == KEY_C)
       displayCredits();
    else
    {

      if (curr_state == STATE_WIN)
      {
          // Send a command to move to the next level:
          gameLoop(action_NEXTLEVEL, 0);
      }
      else if ((evt.keyCode == KEY_R) || (evt.keyCode == KEY_SPACE))
      {
          // Send the command to restart the level:
          gameLoop(action_RESTART, 0);
      }
      else if (curr_state == STATE_PLAYING)
      {
          // Send the command to move according to key press:
          switch (evt.keyCode)
          {
              case KEY_LEFT:
              case KEY_A:
                   // Move left:
                   gameLoop(action_MOVE, LEFT);
                   break;

              case KEY_RIGHT:
              case KEY_D:
                   // Move right:
                   gameLoop(action_MOVE, RIGHT);
                   break;

              case KEY_UP:
              case KEY_W:
                   // Move up:
                   gameLoop(action_MOVE, UP);
                   break;

              case KEY_DOWN:
              case KEY_S:
                   // Move down:
                   gameLoop(action_MOVE, DOWN);
                   break;
          }
        }
    }
}

// Display the credits for the game:
function displayCredits()
{
//    alert('Created by Yanir Kleiman for Ludum Dare 2011');
}



