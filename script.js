
//==================== vars and events 

let addButton = document.querySelector(".add_btn")
let boardPlacement = document.querySelector(".board_wrapper")
let resetBtn = document.querySelector(".reset_btn");

let boardArr = []
let boardItemArr = []
let currentColorId = 3;

let colorArr = new Map([
    [0, '#ff0000'],
    [1, '#00ff00'],
    [2, '#0000ff'],
    [3, '#ffff00']
])

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

    if(boardArr[boardId].cardCounter >= 10){
        addError('В одной доске должно быть не более 10 задач!')
        return 
    }
    
    let itemInfo = document.forms.createBoardItem.elements;
    let itemTag = [];

    if (itemInfo.title.value.length == 0 || itemInfo.title.value.length > 20) {
        addError('Название задачи должно содержать от 1 до 20 символов!')
        return 
    }

    if (itemInfo.text.value.length == 0 || itemInfo.text.value.length > 20000) {
        addError('Задача должна содержать от 1 до 20000 символов!')
        return 
    }

    for(let i = 0; i < colorArr.size; i++){
        if(itemInfo.tag[i].checked){
            itemTag.push(itemInfo.tag[i].value);
        }
    }

    if (itemTag.length == 0 || itemTag.length > 2) {
        addError('У задачи должно быть от 1 до 2 тегов!')
        return 
    }

    boardItemArr.forEach(element => {
        if (element.title == itemInfo.title) {
            addError('Задачи с таким заголовком уже существует!')
            return 
        }
    });
    
    const boardItem = {
        'boardId':  boardId,
        'position': boardArr[boardId].cardCounter,
        'itemId': itemId,
        'title': itemInfo.title.value,
        'text': itemInfo.text.value,
        'expiredDate': itemInfo.expiredDate.value,
        'tag': itemTag
    }

    addBoardItem(boardItem);
    boardItemArr.push(boardItem);
    boardArr[boardId].cardCounter++
    addToLocalStorage();
    itemId++
    
    if (document.querySelector('.modal_window') != null){
        exitModal();
    }
    
}



//=============================== drawing
let addBoard = (element) =>{

    let newboardItem = document.createElement('li');
    newboardItem.classList.add('board');
    newboardItem.setAttribute('board-index-number', element.id);

    boardPlacement.append(newboardItem);
    newboardItem.style.backgroundColor = element.color + "B3";
    newboardItem.innerHTML=`
        <div class="board_header">
            <input type="text" class="board_header_name" value="${element.name}">
            <div class="board_settings">...</div>
        </div>
        <div class="board_body">
            <ul class="board_body_list">
                
            </ul>
        </div>
        <div class="board_footer">
            <p class="add_board_item">Добавить карточку</p>
        </div>
    `
    newboardItem.childNodes[1].childNodes[1].addEventListener('change',()=> changeBoardName(newboardItem.childNodes[1].childNodes[1]))
    newboardItem.childNodes[1].childNodes[3].addEventListener('click', () => addModalBoardSettings(element.id))
    newboardItem.childNodes[5].childNodes[1].addEventListener('click', () => addBoardItemModal(element.id))

}


let addBoardItemModal = (boardId) =>{
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    let modalValue =
     `
    <form name="createBoardItem">
    <div class="window">
    <p class="modal_title">Добавление карточки в "${boardArr[boardId].name}" доску</p>
    <label class="input_board_card_name" for="title">Название карточки</label>
    <input type="text" name="" id="title">

    <label for="">Описание задачи: </label>
    <input type="text" name="" id="text">

    <label for="">Тег: </label>
    <div class="tag_wrapper">`


    let i = 0;
    for (let entries of colorArr.entries()) {
        
        modalValue += `
            <div class="tag_item">
                <label class="tag_label" for="tag${i}" style="background-color: ${entries[1]};"></label>
                <input type="checkbox" name="tag" id="tag${i}" class="tag_input" value="${entries[0]}">
            </div>
        `
        i++
    }

    
    modalValue += `
            </div>
            <label for="">Дата окончания</label>
            <input type="date" id="expiredDate" name="trip-start"
            value="2022-01-10">
            <div class="btn_item_wrapper">
                <div class="add_item_btn">Добавить карточку</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
        </div>
        </form>`
    
    modalWindow.innerHTML = modalValue;
    
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

let changeBoardItemModal = (boardItemId) =>{
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    modalWindow.innerHTML = `
        <div class="window">
            <input type="text" value="${boardItemArr[boardItemId].title}" class="">
            <textarea>${boardItemArr[boardItemId].text}</textarea>

            <div class="btn_wrapper">
                <div class="add_item_btn">Изменить цвет</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
            <div class="delete_item_btn">Удалить доску</div>

        </div>
    `
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
    
    let idBoard = element.closest('.board').getAttribute('board-index-number');
    boardArr[idBoard].name = element.value;
    addToLocalStorage();

}

let changeBoardColor = (boardId, color) =>{
    boardArr[boardId].color = color;
    addToLocalStorage();
    
    allboard = document.querySelectorAll('.board');
    for(let board of allboard){
        if(board.getAttribute('board-index-number') == boardId){
            board.style.backgroundColor = color + 'B3'
            break
        }
    }

    exitModal();
}

let deleteBoard = (boardId) =>{
    if (boardArr[boardId].cardCounter != 0) {
        addError('В доске не должно быть задач, чтобы ее удалить!')
        return    
    }

    boardArr.splice(boardId,1);
    addToLocalStorage();
    allboard = document.querySelectorAll('.board');
    for(let board of allboard){
        if(board.getAttribute('board-index-number') == boardId){
            board.remove();
            break
        }
    }
    exitModal();
}

let exitModal = () =>{
    document.querySelector('.modal_window').remove();
}

let addBoardItem = (element) =>{

    let boardItem = document.createElement('li');
    boardItem.classList.add('card_body_item');
    boardItem.setAttribute('item-index-number', element.itemId)

    let content;
    
    content= `<div class="card_header_item">
                    <div class="card_title_item">${element.title}</div>
                    <div class="card_tag_item">
                    <div class="tag_section">`
 

    for(let tag of element.tag){
        content+=`
        <div class="card_tag" style="background-color: ${colorArr.get(+tag)};"></div> `
    }
    

    content += `</div></div></div>
            <div class="card_date_item">Выполнить до: ${element.expiredDate}</div>`

    boardItem.insertAdjacentHTML('beforeend',content)

    boardItem.addEventListener('click', () => changeBoardItemModal(element.itemId))

    let allboard = document.querySelectorAll('.board');
    for(let board of allboard){
        if(board.getAttribute('board-index-number') == element.boardId){
            board.childNodes[3].childNodes[1].append(boardItem)
            break
        }
    }
}

let reset = () =>{
    localStorage.removeItem('boardArr');
    localStorage.removeItem('boardItemArr');
    boardArr = [];
    boardItemArr = [];
    reCreate();
}

let reCreate = () =>{
    boardPlacement.innerHTML = ''
    boardArr.forEach(element => {
        addBoard(element);
    });

    
}

let boardReCreate = (boardId) =>{
    allboard = document.querySelectorAll('.board_body_list');
    allboard.forEach(board => {
        board.innerHTML = '';
    });

    boardItemArr.forEach(card => {
        addBoardItem(card);
    });
}

let addError = (error) =>{
    let body = document.querySelector('body')
    let errorElement;
    if (!document.querySelector('.error')) {
        errorElement = document.createElement('div')
        errorElement.classList.add('error')
    }else{
        errorElement = document.querySelector('.error');
    }
    errorElement.innerHTML = error
    body.append(errorElement)
    setTimeout(removeError, 3000)
}

let removeError = () => {
    if (document.querySelector('.error') != null) {
        document.querySelector('.error').remove()
    }
}

let addToLocalStorage = () =>{
    localStorage.setItem('boardArr', JSON.stringify(boardArr));
    localStorage.setItem('boardItemArr', JSON.stringify(boardItemArr));
}

if(localStorage.getItem("boardItemArr") != null){
    boardItemArr = JSON.parse(localStorage.getItem('boardItemArr'));
    itemId = boardItemArr[boardItemArr.length-1].itemId+1;
}

if (localStorage.getItem("boardArr") != null) {
    boardArr = JSON.parse(localStorage.getItem('boardArr'));
    BoardId = boardArr[boardArr.length-1].id+1;
 
   
}else{
    createBoard(BoardId, "To Do", "#cccccc")
    createBoard(BoardId, "In Progress", "#cccccc")
    createBoard(BoardId, "Done", "#cccccc")
}

reCreate();
boardReCreate()
