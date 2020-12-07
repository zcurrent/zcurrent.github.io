window.onload = buildGrid;
var dungeonRooms = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];
var x = 2;
var y = 2;
var r = 0;
var c = 0;
var index = 0;
function checkRoom() {

    var text = "";
    if (dungeonRooms[r][c] != '0') {

        text = "Room " + dungeonRooms[r][c];
    }
    return text;
}
function buildRoom() {
    var spotIndex = "square" + index;
    fIndex = "Flag" + index;
    var imgSrc = "Images/Map/unmark.png";
    if (r == y && c == x) {
        imgSrc = "Images/Map/here.png";
    }
    var text = checkRoom(dungeonRooms, r, c);
    var spot = `
                            <div class="grid-item" id=${spotIndex}>${text}
                            </div>
                    `;
    if (dungeonRooms[r][c] != '0') {
        spot = `
                            <div class="grid-item" id=${spotIndex}>${text}
                                <img src=${imgSrc} alt="Avatar" style="width:20%" id=${fIndex} >
                                <input class="checkmark" type="checkbox" name=${fIndex} value="Flagged" id=${fIndex}/>
                                </img>
                            </div>
                    `;
    }
    return spot;

}
function buildGrid() {
    const container = document.getElementById('gridMap');
    var rows = 5;
    var columns = 5;
    dungeonRooms = JSON.parse(sessionStorage.getItem('dungeonRooms'));
    x = Number(sessionStorage.getItem('currentRoomX'));
    y = Number(sessionStorage.getItem('currentRoomY'));

    while (index < (rows * columns)) {
        container.innerHTML += buildRoom(index);
        index++;
        if (c < 4)
            c++;
        else {
            c = 0;
            r++;
        }
    }
    loadFlags()
};