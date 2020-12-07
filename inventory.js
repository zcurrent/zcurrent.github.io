class Item {
    constructor(name, img, stock, attack, defense) {
        this.name = name;
        this.img = img;
        this.stock = stock;
        this.attack = attack;
        this.defense = defense;
        this.description = "Attack: " + this.attack + "\nDefense: " + this.defense;
    }

}

class Inventory {
    constructor() {
        this.inventory = JSON.parse(sessionStorage.getItem("inventory"));
        this.equip = sessionStorage.getItem("equip");
        this.attack = sessionStorage.getItem("attack");
        this.defense = sessionStorage.getItem("defense");
    }

    add(item) {
        if (!inventory.has(item))
            inventory.add(item);
        else
            inventory.getElementById(item).stock++;
    }
    remove(name) {
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].name == name) {
                this.inventory.splice(i, 1);
                this.inventory.push(this.lastCard());
                return;
            }
        }
    }
    sell(name) {
        if (name == "Empty")
            return
        for (var i = 0; i < this.inventory.length; i++) {
            if (this.inventory[i].name == name) {
                this.inventory[i].stock--;
                if (this.inventory[i].stock < 1) {
                    this.remove(name);
                    this.buildArr();
                    this.inventory.pop();
                    return;
                }
                this.buildArr();
                return;
            }

        }
    }
    getByName(name) {
        this.inventory.find(element => element.name == name);
    }
    storeInfo() {
        sessionStorage.setItem("inventory", JSON.stringify(this.inventory));
        sessionStorage.setItem("equip", this.equip);
        sessionStorage.setItem("attack", this.attack);
        sessionStorage.setItem("defense", this.defense);
    }
    buildArr() {
        var index = 1;
        this.inventory.forEach(item => {
            var IDindex = "card" + index;
            const container = document.getElementById(IDindex);
            const card = document.createElement('div');
            card.classList = 'card';
            var buttonID = "sell" + index;
            var equipID = "equip" + index;
            var id = item.name.split(' ')[0] + item.attack + item.defense;
            const content = `
      <div class="card" id=${id}>
        <img src=${item.img} alt="Avatar" style="width:100%"></img>
        <h3>${item.name}</h3 >
        <p>Stock: ${item.stock}<br>${item.description}</p >
            <div class="btn-group">
                <a class="button1" id=${buttonID} style="background-color:#f14e4e">Sell</a>
                <a class="button1" id=${equipID} style="background-color:#f14e4e">Equip</a>
            </div>
      </div >
    </div >
            `;
            container.innerHTML = content;
            document.getElementById(buttonID).addEventListener("click", function func() {
                var r = buttonID.substring(4);
                var item = stash.inventory[r - 1];
                if (item.stock <= 1) {
                    stash.equip = "None";
                    stash.attack = 0;
                    stash.defense = 0;
                }
                stash.sell(item.name);

            });
            document.getElementById(equipID).addEventListener("click", function func() {
                var r = buttonID.substring(4);
                var item = stash.inventory[r - 1];
                var oldItem = stash.equip.split(' ')[0] + stash.attack + stash.defense;
                var oldCard = document.getElementById(oldItem);
                if (oldCard != null) {
                    var buttons = oldCard.getElementsByTagName("a");
                    if (buttons.length > 1) {
                        buttons[1].innerText = "Equip";
                    }
                    console.log(oldCard);
                }
                stash.equip = item.name;
                stash.attack = item.attack;
                stash.defense = item.defense;
                var id = item.name.split(' ')[0] + item.attack + item.defense;
                var newCard = document.getElementById(id);
                if (newCard != null) {
                    var buttons = newCard.getElementsByTagName("a");
                    if (buttons.length > 1) {
                        buttons[1].innerHTML = String.fromCodePoint(0x1F590);
                    }
                    console.log(newCard);
                }
            });
            index++;
        });
        var id = this.equip.split(' ')[0] + this.attack + this.defense;
        var newCard = document.getElementById(id);
        if (newCard != null) {
            var buttons = newCard.getElementsByTagName("a");
            if (buttons.length > 1) {
                buttons[1].innerHTML = String.fromCodePoint(0x1F590);
            }
            console.log(newCard);
        }
    }
    lastCard() {
        var it = new Item();
        it.img = "Images/Items/back.jpg";
        it.name = "Empty";
        it.stock = 0;
        it.description = "Description";
        return it;
    }
}


function goBack() {
    stash.storeInfo();
    location.href = 'dungeon.html';
}

const stash = new Inventory();
stash.buildArr();