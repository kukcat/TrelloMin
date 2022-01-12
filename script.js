
//==================== vars and events 

let addButton = document.querySelector(".add_btn")
let cardPlacement = document.querySelector(".card_wrapper")
let resetBtn = document.querySelector(".reset_btn");

let boardArr = []
let boardItemArr = []
let colorArr = ['#ff0000', '#00ff00', '#0000ff']
let BoardId = 0;
let itemId = 0;

resetBtn.addEventListener('click', () => reset())
addButton.addEventListener('click', () => addModalBoard())

//=============================== creating

let createBoard = (id,name,color) =>{

    if(name == ''){
        return
    }

    const board = {
        'id': id,
        'name': name,
        'color': color,
        'cardCounter': 0,
    }

    addBoard(board);
    boardArr.push(board);
    addToLocalStorage();
    BoardId++;

    if (document.querySelector('.modal_window') != null){
        exitModal();
    }
}


let createBoardItem = (boardId) =>{

    let itemInfo = document.forms.createBoardItem.elements;

    const boardItem = {
        'boardId':  boardId,
        'position': boardArr[boardId].cardCounter,
        'itemId': itemId,
        'titile': itemInfo.title.value,
        'text': itemInfo.text.value,
        'expiredDate': itemInfo.expiredDate.value,
        'tag': tag
    }

   // addBoardItem(boardItem);
    boardItemArr.push(boardItem);
    addToLocalStorage();
    boardArr[boardId].cardCounter++
    itemId++

}



//=============================== drawing
let addBoard = (element) =>{

    let newCardItem = document.createElement('li');
    newCardItem.classList.add('card');
    newCardItem.setAttribute('board-index-number', element.id);

    cardPlacement.append(newCardItem);
    newCardItem.style.backgroundColor = element.color + "B3";
    newCardItem.innerHTML=`
        <div class="card_header">
            <input type="text" class="card_header_name" value="${element.name}">
            <div class="card_settings">...</div>
        </div>
        <div class="card_body">
            <ul class="card_body_list">
                
            </ul>
        </div>
        <div class="card_footer">
            <p class="add_board_item">Добавить карточку</p>
        </div>
    `
    newCardItem.childNodes[1].childNodes[1].addEventListener('change', ()=>changeBoardName(newCardItem.childNodes[1].childNodes[1]))
    newCardItem.childNodes[1].childNodes[3].addEventListener('click', () => addModalBoardSettings(element.id))
    newCardItem.childNodes[5].childNodes[1].addEventListener('click', () => addBoardItemModal(element.id))

}

let addBoardItemModal = (boardId) =>{
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    modalWindow.innerHTML = `
    <form name="createBoardItem">
    <div class="window">
    <p class="modal_title">Добавление карточки в "${boardArr[boardId].name}" доску</p>
    <label class="input_board_card_name" for="title">Название карточки</label>
    <input type="text" name="" id="title">

    <label for="">Описание задачи: </label>
    <input type="text" name="" id="text">

    <label for="">Тег: </label>
    <div class="tag_wrapper">
        <div class="tag_item">
            <label class="tag_label" for="tag1"></label>
            <input type="checkbox" name="tag" id="tag1" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag2" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag3" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag4" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag5" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag6" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag7" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag8" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag9" class="tag_input">
        </div>
        <div class="tag_item">
            <label class="tag_label"></label>
            <input type="checkbox" name="tag" id="tag10" class="tag_input">
        </div> 
    </div>

    <label for="">Дата окончания</label>
    <input type="date" id="expiredDate" name="trip-start"
    value="">
    <div class="btn_item_wrapper">
        <div class="add_item_btn">Добавить карточку</div>
        <div class="cancel_item_btn">Выйти</div>
    </div>
</div>
</form>
    `
    
    console.log()
    modalWindow.childNodes[1].childNodes[1].childNodes[19].childNodes[1].addEventListener('click', () => createBoardItem(boardId));

    modalWindow.childNodes[1].childNodes[1].childNodes[19].childNodes[3].addEventListener('click', () => exitModal())

}

let addModalBoardSettings = (boardId) =>{
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    modalWindow.innerHTML = `
        <div class="window">
            <p class="modal_title">Настройки доски "${boardArr[boardId].name}"</p>
            <label class="input_board_color_label" for="input_board_color">Выберите новый цвет доски:</label>
            <input type="color" value="${boardArr[boardId].color}" class="input_board_color" id="input_board_color">

            <div class="btn_wrapper">
                <div class="add_item_btn">Изменить цвет</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
            <div class="delete_item_btn">Удалить доску</div>

        </div>
    `

    modalWindow.childNodes[1].childNodes[7].childNodes[1].addEventListener('click', () => changeBoardColor(boardId, modalWindow.childNodes[1].childNodes[5].value))
    modalWindow.childNodes[1].childNodes[7].childNodes[3].addEventListener('click', () => exitModal())
    modalWindow.childNodes[1].childNodes[9].addEventListener('click', () => deleteBoard(boardId))
}

let addModalBoard = () =>{
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    modalWindow.innerHTML = `
        <div class="window">
            <p class="modal_title">Создание новой доски</p>
            <label class="input_board_name_label" for="input_board_name">Введите название доски:</label>
            <textarea class="input_board_name" name="" id="input_board_name" cols="30" rows="2"></textarea>
            <label class="input_board_color_label" for="input_board_color">Выберите цвет доски:</label>
            <input type="color" value="#cccccc" class="input_board_color" id="input_board_color">

            <div class="btn_wrapper">
                <div class="add_item_btn">Создать</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>

        </div>
    `
    
    document.querySelector('.add_item_btn').addEventListener('click', () => createBoard(BoardId,document.querySelector(".input_board_name").value,document.querySelector(".input_board_color").value))
    document.querySelector('.cancel_item_btn').addEventListener('click', () => exitModal())

}

//=======================================
let changeBoardName = (element) =>{
    
    let idBoard = element.closest('.card').getAttribute('board-index-number');
    boardArr[idBoard].name = element.value;
    addToLocalStorage();

}

let changeBoardColor = (boardId, color) =>{
    boardArr[boardId].color = color;
    addToLocalStorage();
    reCreate();
    exitModal();
}

let deleteBoard = (boardId) =>{
    boardArr.splice(boardId,1);
    addToLocalStorage();
    reCreate();
    exitModal();
}

let exitModal = () =>{
    document.querySelector('.modal_window').remove();
}

let addBoardItem = (element) =>{
}

let reset = () =>{
    localStorage.removeItem('boardArr');
    boardArr = [];
    reCreate();
}

let reCreate = () =>{
    cardPlacement.innerHTML = ''
    boardArr.forEach(element => {
        addBoard(element);
    });
}

let boardReCreate = (boardId) =>{

}

let addToLocalStorage = () =>{
    localStorage.setItem('boardArr', JSON.stringify(boardArr));
}

if (localStorage.getItem("boardArr") != null) {
    boardArr = JSON.parse(localStorage.getItem('boardArr'));
    BoardId = boardArr[boardArr.length-1].id+1;
    //itemId = boardItemArr[boardItemArr-1].itemId+1;
}else{
    createBoard(BoardId, "To Do", "#cccccc")
    createBoard(BoardId, "In Progress", "#cccccc")
    createBoard(BoardId, "Done", "#cccccc")
}

reCreate();
