//==================== vars and events 

let addBtn= document.querySelector(".add_btn")
let mainInner = document.querySelector(".main_inner")
let placeForName = document.querySelector('#work_name') 
let resetBtn = document.querySelector(".reset_btn");
let settingsBtn = document.querySelector('.settings_btn')
let filterBtn = document.querySelector('.filter_btn');
let userBtn = document.querySelector('.user_icon_wrapper')
let workTypeSelect = document.querySelector('#work_type');

let USER_URL = 'https://randomuser.me/api/?results='

let boardArr = []        // Массив с бордами 
let boardItemArr = []    // Массив с карточками
let colorArr = [];       // Массив с тегами 
let logArr = [];         // Массив логов
let filter = []          // Массив, в котором выбраны теги, в по которым идем фильтрация 
let userArr = [];        // Массив юзеров
let userId = 0;          // Последняя айдишка юзеров
let currentColorId = 0;  // Последняя айдишка тегов                 
let itemId = 0;          // Последняя айдишка карточке              все айдишки у меня уникальные и не обязаны соответствовать индексу массива. если я удалю элемент с какой-то айдишкой,
let boardId = 0;         // Последняя айдишка борды                 то больше элемента с такой айдишкой не будет. Насколько я помню, такая система в бд, так что я решил why not
let isfilter = false;    // Стоит ли сейчас фильтр
let isError = false;     // Есть ли сейчас выведенная ошибка 
let nameOfPlace = 'Название рабочей зоны';  //Название рабочей зоны      
let draggableCard;       // Карточка, которую я таскаю drag&drop'ом
let currentDate;         // Текущая дата для input

let monthName= [         //название месяцов для календаря
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
];
    

placeForName.addEventListener('change', () => changeNameOfPlace())
filterBtn.addEventListener('click', () => addFilterItemModal())
resetBtn.addEventListener('click', () => reset())
addBtn.addEventListener('click', () => addModalBoard())
settingsBtn.addEventListener('click', () => addModalSettings())
userBtn.addEventListener('click', () => addModalUser())
workTypeSelect.addEventListener('change', () => reCreateCurrenWorkType())

//=============================== creating

let createBoard = (id,name,color) =>{   //создание борды 

    if(name == ''){
        addError('Укажите название доски!') //проверочки у меня в целом везде одинковые. Если чета не подходит - я вызываю функцию, которая вываливает на страницу ошибку с текстом, после чего выход из функции
        return
    }

    if(boardArr.length >= 6){
        addError('Нельзя создать больше 6 досок')
        return
    }

    const board = {
        'id': id,
        'name': name,
        'color': color,                                // Данные для борды
        'cardCounter': 0,
    }

    addBoard(board);       //рисуем борду
    boardArr.push(board);  //пушим борду в массив
    boardId++;             // увеличиваем айдишку для следующей борды
    addToLocalStorage('board'); //Добавление в локальное хранилище (описание в самой функции)
    addLog(`Добавлена доска: ${board.name}`) //Логи пушат в массив строку, которую даю через эту функцию
    exitModal();   //все модалки работают схожим образом (описание в самой функции)
    
}


let createBoardItem = (boardId) =>{  //создание карточки. У меня они именуются boardItem

    if(boardArr[getBoardIndex(boardId)].cardCounter >= 10){                                     //getBoardIndex - получить индекс борды в массиве по ее айдти
        addError('В одной доске должно быть не более 10 задач!')
        return 
    }
    
    let itemInfo = document.forms.createBoardItem.elements;   //получение массива инпутов из формы 
    let itemTag = [];   //массив для выбранных тегов для карточки
    let userId;
    if (itemInfo.title.value.length == 0 || itemInfo.title.value.length > 20) {
        addError('Название задачи должно содержать от 1 до 20 символов!')
        return 
    }

    if (itemInfo.text.value.length == 0 || itemInfo.text.value.length > 20000) {
        addError('Задача должна содержать от 1 до 20000 символов!')
        return 
    }
    
    for(let i = 0; i < colorArr.length; i++){
        if(itemInfo.tag[i].checked){
            itemTag.push(itemInfo.tag[i].value);        //в массив тегов я записываю выбранные айди тегов
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
    
    
    if(itemInfo.user.length == undefined){

        if (itemInfo.user.checked) {
            userId = itemInfo.user.value
        }else{
            addError('Выберите ответственного за задачу')
            return
        }

    }else{

        for(let i = 0; i < userArr.length; i++){
            if(itemInfo.user[i].checked) userId = itemInfo.user[i].value;
        }
    
        if(userId == undefined) {
            addError('Выберите ответственного за задачу')
            return
        }
    }

    const boardItem = {
        'boardId':  boardId,                        //привязка к борде
        'position': boardArr[getBoardIndex(boardId)].cardCounter,      //позиция в борде
        'itemId': itemId,                   //уникальная айдишка
        'title': itemInfo.title.value,                                                                          //данные карточки.
        'text': itemInfo.text.value,
        'expiredDate': itemInfo.expiredDate.value,
        'tag': itemTag,   //массив айдишек тегов
        'userId': userId
    }
    addBoardItem(boardItem);   //рисуем карточку
    boardItemArr.push(boardItem);      //пушим в массив
    boardArr[getBoardIndex(boardId)].cardCounter++ //меняем кол-во карточек в борде
    itemId++
    addToLocalStorage('item');
    addToLocalStorage('board');
    addLog(`Добавлен карточка: ${boardItem.title}`)
    if (document.querySelector('.modal_window') != null){
        exitModal();                                                //Если функция была вызвана с помощью модалки, то она закроется
    }
    
}

let addNewTag = (newColor = document.querySelector('.input_board_color').value) => { //добавление нового тега
    
    const tag = {
        'tagId': currentColorId,
        'tagColor': newColor
    }

    for(let i = 0; i<colorArr.length; i++){
        if (newColor == colorArr[i].tagColor) {
            addError('Такой тег уже существует')
            return 
        }
    }

    if (colorArr.length >=10) {
        addError('Нельзя создавать больше 10 тегов')
        return
    }

    colorArr.push(tag)
    currentColorId++;
    exitModal();
    addLog(`Добавлен тег: ${newColor}`)
    addToLocalStorage('color')
}

async function addUser(count){ //добавление нового пользователя

    let response = await fetch(USER_URL+count); //отправляем запрос по ссылке (задали в начале) и получаем результат в кол-ве count
    let userInfo = await response.json(); 

    for(let i = 0; i<count; i++){
        let userName = userInfo.results[i].name.first +` `+ userInfo.results[i].name.last

        const user = {
            'id': userId,
            'gender': userInfo.results[i].gender,
            'name': userName,
            'icon': userInfo.results[i].picture.thumbnail
        }

        userArr.push(user);
        userId++;
        addLog(`Добавлен новый пользователь: ${user.name}`)
    }

    exitModal()
    updateUserIcon()
    addToLocalStorage('user');
    

}


//=============================== drawing               всё отображение тут  

let addBoard = (element) =>{ // добавление борды

    let board = document.createElement('li');                           //принцип везде одинаковый. Создаю какой-то элемент
    board.classList.add('board');                                       // Даю ему класс
    board.setAttribute('board-index-number', element.id);               //Даю атрибут, если нужно
    document.querySelector('.board_wrapper').append(board)
    board.style.backgroundColor = element.color + "B3";             //задаю цвет борды
    board.innerHTML=`
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

    addDragAndDropEventBoard(board);        //даю ивент на эту борду для drah&drop                                            Штука, которая мне не очень нравится с эстетической точки зрения
    board.childNodes[1].childNodes[1].addEventListener('change',()=> changeBoardName(board.childNodes[1].childNodes[1]))   // Но как сделать это иначе оптимально я не придумал
    board.childNodes[1].childNodes[3].addEventListener('click', () => addModalBoardSettings(element.id))                   // Обращаюсь к конкретным элементам через childNodes, чтоб дать им ивент 
    board.childNodes[5].childNodes[1].addEventListener('click', () => addBoardItemModal(element.id))                       // минус в том, что если я решу изменить верстку, то всем может к чертям слететь
                                                                                                                           //но мне не нужно перебирать все элементы в поисках нужного по селектору
}


let addBoardItemModal = (boardId) =>{   //создание модалки для добавления карточки в доску
    let modalWindow = document.createElement('div');        
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    let index = getBoardIndex(boardId);
    let modalValue =
     `
    <form name="createBoardItem">
    <div class="window">
    <p class="modal_title">Добавление карточки в "${boardArr[index].name}" доску</p>
    <label class="input_board_card_name" for="title">Название карточки</label>
    <input type="text" name="" id="title">

    <label for="">Описание задачи: </label>
    <textarea name="" id="text"></textarea>

    <label for="">Тег: </label>
    <div class="tag_wrapper">`

                                                                                            // В value тегов всегда фигурирует айдишкник цвета, а не сам цвет
                                                                                            // по айдишнику потом ищется сам цвет и добавляется куда там нужно
    for (let i = 0; i < colorArr.length; i++) {
        modalValue += `
            <div class="tag_item">
                <input type="checkbox" name="tag" id="tag${i}" class="tag_input" value="${colorArr[i].tagId}">          
                <label class="tag_label" for="tag${i}" style="background-color: ${colorArr[i].tagColor};"></label>
            </div>
        `
    }

    modalValue += `</div> <div class="user_wrapper_add">`

    for (let i = 0; i < userArr.length; i++) {
        modalValue += `
            <div class="user_item">
                <input type="radio" name="user" id="user${i}" class="user_input_add" value="${userArr[i].id}">          
                <label class="user_label_add" for="user${i}">
                    <img src="${userArr[i].icon}">
                </label>
            </div>
        `
    }

    
    modalValue += `
            </div>
            <label for="">Дата окончания</label>
            <input type="date" id="expiredDate" name="trip-start"
            value="${currentDate}" min="${currentDate}">
            <div class="btn_item_wrapper">
                <div class="add_item_btn">Добавить карточку</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
        </div>
        </form>`
    
    modalWindow.innerHTML = modalValue;

    
    modalWindow.childNodes[1].childNodes[1].childNodes[21].childNodes[1].addEventListener('click', () => createBoardItem(boardId));     //добавление элемента в массив
    
    modalWindow.childNodes[1].childNodes[1].childNodes[21].childNodes[3].addEventListener('click', () => exitModal())           //закрыть модалку

}

let addModalBoardSettings = (boardId) =>{ //настройка борды
    let index = getBoardIndex(boardId);
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    modalWindow.innerHTML = `
        <div class="window">
            <p class="modal_title">Настройки доски "${boardArr[index].name}"</p>
            <label class="input_board_color_label" for="input_board_color">Выберите новый цвет доски:</label>
            <input type="color" value="${boardArr[index].color}" class="input_board_color" id="input_board_color">

            <div class="btn_wrapper">
                <div class="add_item_btn">Изменить цвет</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
            <div class="delete_item_btn">Удалить доску</div>

        </div>
    `

    modalWindow.childNodes[1].childNodes[7].childNodes[1].addEventListener('click', () => changeBoardColor(index, modalWindow.childNodes[1].childNodes[5].value))   //сменить цвет борды. Передаю в функицю индекс борды в массиве и цвет с input[type="color"]
    modalWindow.childNodes[1].childNodes[7].childNodes[3].addEventListener('click', () => exitModal())  //закрыть модалку
    modalWindow.childNodes[1].childNodes[9].addEventListener('click', () => deleteBoard(index)) //удаление борды
}

let changeBoardItemModal = (boardItemId) =>{       //модалка для изменения карточки
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);

    let index = getBoardItemIndex(boardItemId);   // getBoardItemIndex - получить интекс карточки в массиве по ее айдишнику

    let modalValue = `
    <form name="changeBoardItemForm">
        <div class="window">
            <input name="newTitle" type="text" value="${boardItemArr[index].title}" class="modal_title_edit">
            <textarea name="newText" class="modal_text_edit">${boardItemArr[index].text}</textarea>
            <input name="newDate" type="date" min="${currentDate}" value="${boardItemArr[index].expiredDate}" class="modal_date_edit">
            <label class="tag_label_edit" for="">Тег: </label>
            <div class="tag_wrapper">
        `
    
        
        for (let i = 0; i<colorArr.length;i++) {
            
            let checked                                                                                                      // getTagIndex - получить интекс тега в массиве по его айдишнику
                                                                                                                             // 
            if (getTagIndex(boardItemArr[index].tag[0]) == i || getTagIndex(boardItemArr[index].tag[1]) == i) {              // Если индекс одного из тегов, которые есть у карточки совпадает с индексом пролистываемого
                checked = 'checked'                                                                                          // тега в массиве тегов, то в переменную записывается слово checked 
            }else{
                checked = ''                                                                                                 
            }
                                                                                                                             // котора потом идет в атрибуты input.tag_input
            modalValue += `
                <div class="tag_item">
                    <input type="checkbox" name="tag" id="tag${i}" class="tag_input" value="${colorArr[i].tagId}" ${checked}>         
                    <label class="tag_label" for="tag${i}" style="background-color: ${colorArr[i].tagColor};"></label>
                </div>
            `
            
        }
        
        modalValue += `</div>
        <label class="tag_label_edit" for="">Ответственный за задание: </label>
        <div class="user_wrapper_add">`

        for (let i = 0; i < userArr.length; i++) {

            let checked 

            if (getUserIndex(boardItemArr[index].userId) == i){
                checked = 'checked'                                                                                          // тега в массиве тегов, то в переменную записывается слово checked 
            }else{
                checked = ''                                                                                                 
            }

            modalValue += `
                <div class="user_item">
                    <input type="radio" name="user" id="user${i}" class="user_input_add" value="${userArr[i].id}" ${checked}>          
                    <label class="user_label_add" for="user${i}">
                        <img src="${userArr[i].icon}">
                    </label>
                </div>
            `
        }

    
       modalValue+= `</div>
            <div class="btn_wrapper_edit">
                <div class="add_item_btn">Изменить</div>
                <div class="cancel_item_btn">Выйти</div>
            </div>
            <div class="delete_item_btn">Удалить задачу</div>

        </div>
        </form>
    `
    modalWindow.insertAdjacentHTML('afterbegin', modalValue)

   
    
    modalWindow.childNodes[1].childNodes[1].childNodes[15].childNodes[1].addEventListener('click', () => changeBoardItem(index)) //изменить
    modalWindow.childNodes[1].childNodes[1].childNodes[15].childNodes[3].addEventListener('click', () => exitModal()) //выйти
    modalWindow.childNodes[1].childNodes[1].childNodes[17].addEventListener('click', () => deleteBoardItem(index)) //удалить
}

let addBoardItem = (element) =>{        //отображение карточки в борде 

    let boardItem = document.createElement('li');
    boardItem.classList.add('card_body_item');
    boardItem.setAttribute('item-index-number', element.itemId)
    boardItem.setAttribute('draggable', 'true')
    let content= '';

    if (userArr[getUserIndex(element.userId)]) {  //Если такой юзер есть - выводим его
        content = `
        <div class="left"><img class="card_img" src="${userArr[getUserIndex(element.userId)].icon}" draggable="false"></div> 
        `
    }else{ // если нет - выводим самого первого юзера. Можно не выводить ничего, если убрать else. Просто не придумал лучшего поведения при отсутствии этого юзера в борде
        content = `
        <div class="left"><img class="card_img" src="${userArr[0].icon}" draggable="false"></div>
        `
    }

    content+= `
        <div class="right">
        <div class="card_header_item">
            <div class="card_title_item">${element.title}</div>
            <div class="card_tag_item">
            <div class="tag_section">`
 

    for (let i = 0; i < element.tag.length; i++) {
        if(getTagIndex(element.tag[i]) != undefined){   //На случай, если кто-то удалит все теги, которые есть у карточки 
        content+=`
        <div class="card_tag" style="background-color: ${colorArr[getTagIndex(element.tag[i])].tagColor};"></div> `
        }
    }

   

    content += `</div></div></div>
            <div class="card_date_item">Выполнить до: ${element.expiredDate}</div></div>`

    boardItem.insertAdjacentHTML('beforeend',content)

    boardItem.addEventListener('click', () => changeBoardItemModal(element.itemId)) //При нажатии на карточку открывается модалка изменения карточки

    let allboard = document.querySelectorAll('.board');
    for(let board of allboard){                                             //пролистываем все борды
        if(board.getAttribute('board-index-number') == element.boardId){    //если дошли до нужной борды
            board.childNodes[3].childNodes[1].append(boardItem)                         //добавляем карточу во враппер для карточек 
            break                                                                       //если добавили, то дальше крутить цикл нет смысла
        }
    }

    addDragAndDropEventBoardItem(boardItem)
}

let addCalendar = (month, year) =>{ //создание календаря
    mainInner.innerHTML = ''
    let date = new Date(year, month);  //создаем переменную с нужным нам месяцем

    month = date.getMonth(); //обновляем данные при необходимости (если меняем месяцы календаря)
    year = date.getFullYear();

    let calendar = document.createElement('div');
    calendar.classList.add('calendar');
    mainInner.insertAdjacentHTML('afterbegin', `<div class="calendar_month"><div class="previous_month">< Предыдущий месяц</div>
    <div class="calendar_date">${monthName[date.getMonth()]} ${date.getFullYear()}</div>
    <div class="next_month">Следующий месяц ></div></div>
    `)
    
    let dateArr = []; //массив для карточек этого месяца

    for(let item of boardItemArr){ //проходимся по массиву карточек
        let splittedDate = item.expiredDate.split('-') 
        if (+splittedDate[1] != month+1 || +splittedDate[0] != year) continue //если месяц и год даты окончания карточек не совпадают с нужными нам, то пропускаем эту карточку

        const calendarItem = { //иначе создаем объект с нужными нам данными для календаря
            'expiredDate': splittedDate[2],
            'id': item.itemId,
            'title': item.title,
            'tag': item.tag
        }
       
        dateArr.push(calendarItem)
    }
   

    dateArr.sort((a, b) => a.expiredDate < b.expiredDate ? 1 : -1) // сортируем массив с конца дат


    //создаем верхнюю строчку календаря
    let calendarValue = `<div class="row"><div class="cell day_cell">Понедельник</div> 
    <div class="cell day_cell">Вторник</div><div class="cell day_cell">Среда</div>
    <div class="cell day_cell"> Четверг</div><div class="cell day_cell">Пятница</div>
    <div class="cell day_cell">Суббота</div><div class="cell day_cell">Воскресенье</div></div><div class="row">`



    if (date.getDay() == 0) { //если воскресенье - добавляем шесть ячеек 
        calendarValue+= `<div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div><div class="cell"></div>`
    }else{//иначе добавляем кол-во ячеек равное текущий текущему дню недели-1 (Так как воскресенье - 0, то нельзя создать -1 ячейку. Поэтому нужен этот if)
        for(let i = 1; i < date.getDay(); i++){
            calendarValue+= `<div class="cell"></div>`
        }
    }

   

    while(date.getMonth() == month){ //Пока месяц не закончился создаем ячейки 
        calendarValue += `<div class="cell"> 
                            <div class="date">${date.getDate()}</div>
                            <ul class="card_wrapper">`
           
    
   
        
        while(dateArr.length != 0 && dateArr[dateArr.length-1].expiredDate == date.getDate()){ //пока текущая дата равна дате последнего элемента нашей карточки, то добавляем элементы в календарь

            calendarValue +=`
                <li class="calendar_card_item" item-index-number="${dateArr[dateArr.length-1].id}">  
                    <div class="calendar_card_item_text"> ${dateArr[dateArr.length-1].title} </div><div class="calendar_card_item_tag_wrapper">`
                    
            for(let i = 0; i< dateArr[dateArr.length-1].tag.length; i++){
                if (colorArr[getTagIndex(dateArr[dateArr.length-1].tag[i])]) {
                    calendarValue+= `<div class="card_tag" style="background-color: ${colorArr[getTagIndex(dateArr[dateArr.length-1].tag[i])].tagColor}"></div>`
                }
            }

            calendarValue+= `</div></li>`
            
            dateArr.pop(); //после добавления карточки, удаляем последний элемент массива (Решил пойти отсортировать так, потому что pop быстрее работает, чем shift)
        
        }



    calendarValue+=`</ul></div>` //закрываем карточку

    
    if(date.getDay() == 0){  //если воскресенье - переходим на новую строку
        calendarValue+= `</div><div class="row">`
    }

    date.setDate(date.getDate()+1) //устанавливаем следующий день в переменной

    }

    if (date.getDay() != 0) { //после окончания месяца дополняем календарь пустыми ячейками
        for (let i = date.getDay(); i <= 7; i++) {
            calendarValue+= `<div class="cell"></div>`
        }
    } else{
        calendarValue+= `<div class="cell"></div>`
    }

      calendarValue+= `</div></div>` //закрываем календарь

      
    calendar.insertAdjacentHTML('afterbegin', calendarValue)
    mainInner.append(calendar)

    allCards = document.querySelectorAll('.calendar_card_item')

    allCards.forEach(card => { //добавляем каждой карточек в календаре возможность изменяться по нажатию
        card.addEventListener('click', () => changeBoardItemModal(card.getAttribute('item-index-number')))
    });

    mainInner.childNodes[0].childNodes[0].addEventListener('click', () => addCalendar(month-1, year)) //при нажатии на "Предыдущий месяц", запускаем эту же функцию со сдвигом в один месяц назад
    mainInner.childNodes[0].childNodes[4].addEventListener('click', () => addCalendar(month+1, year)) //то же самое с "Следующий месяц"
}

let addModalUser = () => { //модалка для добавления нового юзера

    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    let modalValue = `
        <div class="window">
            <p class="modal_title">Пользователи доски</p>
            <div class="user_wrapper">
            `
            
    for(let i = 0; i<userArr.length; i++){
        modalValue+=`
            <input id="user${i}" type="radio" name="user" class="user_input">
            <label class="user_label" for="user${i}"><img src="${userArr[i].icon}">
                <div>${userArr[i].name}</div>
            </label>
        `
    }

    modalValue += `
            </div>
            <div class="user_btn">Удалить пользователя</div>
            <div class="user_btn_wrapper">
                <div class="user_btn">Создать пользователя</div>
                <div class="user_btn">Выйти</div>
            </div>

        </div>
    `
    modalWindow.insertAdjacentHTML('afterbegin', modalValue);
    
    modalWindow.childNodes[1].childNodes[5].addEventListener('click', ()=>deleteUser())
    modalWindow.childNodes[1].childNodes[7].childNodes[1].addEventListener('click', ()=>addUser(1))
    modalWindow.childNodes[1].childNodes[7].childNodes[3].addEventListener('click', ()=>exitModal())

}


let addModalBoard = () =>{           // Модалка для заполнения данных для борды
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
    
    document.querySelector('.add_item_btn').addEventListener('click', () => createBoard(boardId,document.querySelector(".input_board_name").value,document.querySelector(".input_board_color").value)) //передаю в борду айдишник, значения инпута имени и цвета
    document.querySelector('.cancel_item_btn').addEventListener('click', () => exitModal()) //закрыть модалку

}

let addModalSettings = () => { // Модалка настроек
    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);
    let modalValue = `
        <div class="window">
            <label class="input_board_color_label" for="input_board_color">Добавить новый тег:</label>
            <input type="color" value="#cccccc" class="input_board_color" id="input_board_color">
            <div class="add_new_color_btn">Добавить</div>
            <div class="tag_wrapper">
    `
    
    for (let i = 0; i < colorArr.length; i++) {

        modalValue += `
            <div class="tag_item">
                <input type="radio" name="tag" id="tag${i}" class="tag_input" value="${colorArr[i].tagId}">
                <label class="tag_label" for="tag${i}" style="background-color: ${colorArr[i].tagColor};"></label>
            </div>
        `
    }

    modalValue+=`
            </div>
            <div class="delete_tag_btn">Удалить выбранный тег</div>
            <div class="log_title">Лог работы:</div>
            <ul class="log_wrapper">`
        
    for (let i = 0; i < logArr.length; i++) {
        modalValue+=`<li class="log_item">${logArr[i]}</li>`
    }

    modalValue+= `
            </ul>   
            <div class="img_title">Изменить фон:</div>
            <input type="file" class="input_background">
            <div class="change_background_btn">Изменить фон</div>

            <div class="btn_wrapper_settings">
                <div class="cancel_item_btn">Выйти</div>
            </div>

        </div>
    `
    modalWindow.insertAdjacentHTML('afterbegin', modalValue)

    modalWindow.childNodes[1].childNodes[5].addEventListener('click', () => addNewTag()) //Добавить тег
    modalWindow.childNodes[1].childNodes[9].addEventListener('click', () => deleteTag()) //удалить тег
    modalWindow.childNodes[1].childNodes[19].addEventListener('click', () => changeBackground()) //изменить фон
    modalWindow.childNodes[1].childNodes[21].childNodes[1].addEventListener('click', ()=>exitModal()) //выйти
}

let addFilterItemModal = () =>{ //модалка фильтра
 
    if (isfilter) {                                         // если уже есть фильтр, то удаляет фильтр и не открывает модалку
        filter = [];                                        
        filterBtn.innerHTML = 'Фильтр'
        isfilter = false;                                   // говорит, что фильтр удален        
        boardReCreate();                                    // и пересоздает все элементы борд
        return
    }

    let modalWindow = document.createElement('div');
    modalWindow.classList.add('modal_window');
    document.querySelector('body').append(modalWindow);

    let filterValue = `
    <form name="filterForm">
    <div class="window">
    <div class="filter_title">Выберите теги для сортировки</div>
    <div class="tag_wrapper"> 
    `

    for (let i = 0; i < colorArr.length; i++) {
        filterValue+=`
        <div class="tag_item">
            <input type="checkbox" name="tag" id="tag${i}" class="tag_input" value="${colorArr[i].tagId}">
            <label class="tag_label" for="tag${i}" style="background-color: ${colorArr[i].tagColor};"></label>
        </div>`
        
    }

    filterValue+=`
    </div>
        <div class="btn_wrapper">
            <div class="modal_filter_btn">Отфильтровать</div>
            <div class="modal_filter_btn">Выйти</div>
            </div>
    </div>
    </div>
    <form>
    `
    modalWindow.insertAdjacentHTML('beforeend', filterValue)
    
    modalWindow.childNodes[1].childNodes[1].childNodes[5].childNodes[1].addEventListener('click',() => FilterItem()) //отфильтровать элементы
    modalWindow.childNodes[1].childNodes[1].childNodes[5].childNodes[3].addEventListener('click', () => exitModal()); //закрыть модалку

}

let updateUserIcon = () =>{
    let wrapper = document.querySelector('.user_icon_wrapper');
    wrapper.innerHTML = '';
    let users = '';
    for(let i = 0; i<3; i++){
        if (userArr[i]) {
            users += `<li>
            <img src="${userArr[i].icon}" class=""user_icon_item> 
            </li>`
        }
    }

    wrapper.insertAdjacentHTML('beforeend', users)

}

let reCreateCurrenWorkType = () =>{
    let workType = document.querySelector('#work_type').value
    if (workType == 'board') {
        reCreate()
        filterBtn.removeAttribute('disabled')
        addBtn.removeAttribute('disabled')

    } else if (workType == 'calendar'){
        filterBtn.setAttribute('disabled',true)
        addBtn.setAttribute('disabled',true)
        

        let currentMonth = currentDate.split("-")[1]-1
        let currentYear = currentDate.split("-")[0]
        console.log(currentDate)
        addCalendar(currentMonth,currentYear)
    }
}

//=======================================

let getBoardIndex = (boardId) => {           
    for(let i = 0; i < boardArr.length; i++){
        if (boardArr[i].id == boardId) {
            return i
        }
    }
}

let getBoardItemIndex = (itemId) =>{
    for(let i = 0; i < boardItemArr.length; i++){
        if (boardItemArr[i].itemId == itemId) {
            return i
        }
    }
}

let getTagIndex = (colorId) => {
    for (let i = 0; i < colorArr.length; i++) {
        if(colorArr[i].tagId == colorId)
        return i;
    }
}

let getUserIndex = (userId) => {
    for (let i = 0; i < userArr.length; i++) {
        if(userArr[i].id == userId)
        return i;
    }
}

let getCurrentDate = () => {
    let today = new Date();
    let year = today.getFullYear();
    let month;
    let date;

    
    if (today.getMonth()+1 < 10) {
        month = `0` + (today.getMonth()+1)
    }else{
        month = today.getMonth()+1;
    }

    if (today.getDate() < 10) {
        date = `0`+ (today.getDate()+1)
    }else{
        date = today.getDate();
    }

    console.log(month)

    return year +`-`+ month +`-`+ date
    
}


let changeBoardItem = (index) =>{              //изменение карточки. В целом, принцип такой же, как и при создании

    let itemInfo = document.forms.changeBoardItemForm.elements
    let itemTag = [];

    if (itemInfo.newTitle.value.length == 0 || itemInfo.newTitle.value.length > 20) {
        addError('Название задачи должно содержать от 1 до 20 символов!')
        return 
    }

    if (itemInfo.newText.value.length == 0 || itemInfo.newText.value.length > 20000) {
        addError('Задача должна содержать от 1 до 20000 символов!')
        return 
    }

    for(let i = 0; i < colorArr.length; i++){
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
    
    if (!itemInfo.user.value) {
        addError('Укажите ответственного за задание!')
        return
    }
   

    boardItemArr[index].text = itemInfo.newText.value
    boardItemArr[index].expiredDate = itemInfo.newDate.value
    boardItemArr[index].title = itemInfo.newTitle.value
    boardItemArr[index].tag = itemTag
    boardItemArr[index].userId = itemInfo.user.value

    reCreateCurrenWorkType()
    addToLocalStorage('item');
    addLog(`Изменена карточка ${boardItemArr[index].text}`)
    exitModal();

}

let deleteBoardItem = (boardItemIndex) => {  //удаление карточки
    let boardIndex = getBoardIndex(boardItemArr[boardItemIndex].boardId);
    boardArr[boardIndex].cardCounter--        //удалили карточку - элементов в борде стало меньше
    
    addLog(`Удалена доска ${boardItemArr[boardItemIndex]}`)
    boardItemArr.splice(boardItemIndex,1);
    addToLocalStorage('item');
    
    boardReCreate()
    exitModal();

}

let FilterItem = () =>{   //фильтрация карточек
    
    filter = [];
    let allTag = document.forms.filterForm.elements;  //получили массив с формы фильтра
    
    for(let i = 0; i < colorArr.length; i++){
        if (allTag[i].checked) {
            filter.push(allTag[i].value);          //получили айдишки выбранных цветов
        }
    }

    if (filter.length == 0) {
        addError('Выберите хотя бы один тег для сортировки')
        return
    }

    filterBtn.innerHTML = 'Удалить фильтрацию';          //меняем кнопку "фильтр" на "удаление фильтрации"
    isfilter = true;                                     //говорим, что есть фильтрация

    boardReCreate()
    exitModal();

}

let changeBackground = () =>{       //измнение фона. 
    
    let file = document.querySelector('.input_background').files[0] //получение файла

    if(!file){ // если инпут пустой, то выходим из функции
        addError('Выберите изображение')
        return
    }else if (file.type == 'image/jpeg' || file.type == 'image/jpg' || file.type == 'image/png') {   // если тип файла jpg/jpeg/png 
        let reader = new FileReader();
        reader.readAsDataURL(file);  //начинаем чтение файла, при завершении получаем его в виде URL строки 
        reader.addEventListener("load", function () {  //при завершении чтения
            document.querySelector('body').style.background = `url(${reader.result})`; //задаем нашему body background с URL, который мы получили 
            document.querySelector('body').style.backgroundSize = 'cover';
            localStorage.setItem("background", reader.result); //и сохраняем эту строку в локальное хранилище
        }, false);
        exitModal()

    }else{ //если выбрали не один из предыдущих типов, то выходим из функции
        addError('Выберите изображение')
        return
    }

    
}
    
let deleteTag = () =>{          //удаление тега
    
    if (colorArr.length <= 2) {
        addError('Минимальное кол-во тегов: 2');
        return
    }

    allTag = document.querySelectorAll('.tag_input')
    for(let i = 0; i<allTag.length; i++){
        if (allTag[i].checked){
            addLog(`Удален тег ${colorArr[i].tagColor}`)
            colorArr.splice(i,1);
            break;                 
        }
    }
    
    addToLocalStorage('color')
    exitModal()
    reCreateCurrenWorkType()

}

let deleteUser = () => { //удаление юзеров 
    if(userArr.length <= 1){
        addError('Минимальное кол-во юзеров: 1');
        return
    }

    allUser = document.querySelectorAll('.user_input')

    for(let i = 0; i <allUser.length; i++){
        if(allUser[i].checked){
            addLog(`Удален пользователь ${userArr[i].name}`)
            userArr.splice(i,1);
            break
        }
    }

    updateUserIcon()
    addToLocalStorage('user');
    exitModal()
    boardReCreate()

}


let changeBoardName = (element) =>{ //изменение названия борды
    
    let idBoard = element.closest('.board').getAttribute('board-index-number');
    boardArr[getBoardIndex(idBoard)].name = element.value;
    addLog(`Изменена доска ${element.value}`)
    addToLocalStorage('board');

}

let changeBoardColor = (index, color) =>{ //изменить цвет борды
    boardArr[index].color = color;
    addToLocalStorage('board');
    addLog(`Изменен цвет доски ${boardArr[index].name} на ${color}`)
    allboard = document.querySelectorAll('.board');
    for(let board of allboard){
        if(board.getAttribute('board-index-number') == boardArr[index].id){
            board.style.backgroundColor = color + 'B3'
            break
        }
    }

    exitModal();
}

let deleteBoard = (index) =>{ //удалить борду

    if (boardArr[index].id >= 0 && boardArr[index].id <= 2) {
        addError('Первые три доски нельзя удалить!')
        return
    }

    if (boardArr[index].cardCounter != 0) {
        addError('В доске не должно быть задач, чтобы ее удалить!')
        return    
    }
    addLog(`Удалена доска ${boardArr[index].name}`)
    allboard = document.querySelectorAll('.board');
    for(let board of allboard){
        if(board.getAttribute('board-index-number') == boardArr[index].id){
            board.remove();
            break
        }
    }
    boardArr.splice(index,1);
    addToLocalStorage('board');
    exitModal();
}

let exitModal = () =>{ //закрытие модалки
    if (document.querySelector('.modal_window') != null){ //если модалка есть
        document.querySelector('.modal_window').remove(); //закрыть
    }
}


let changeNameOfPlace = () => { //изменение названия борды
    nameOfPlace = placeForName.value;
    addLog(`Изменено название пространства на ${nameOfPlace}`)
    addToLocalStorage('name');
}

let reset = () =>{ //сборс всего
    localStorage.removeItem('logArr');
    localStorage.removeItem('colorArr');
    localStorage.removeItem('currentColorId');
    localStorage.removeItem('boardArr');
    localStorage.removeItem('boardItemArr');
    localStorage.removeItem('boardId');
    localStorage.removeItem('itemId');
    localStorage.removeItem('name');
    localStorage.removeItem('userArr');
    localStorage.removeItem('userId');
    localStorage.removeItem('background');
    location.reload() //автоматическая перезагрузка страницы 
}

let reCreate = () =>{ //пересоздание борд
    
    let boardPlacement = document.createElement('div')
    boardPlacement.classList.add('board_wrapper');
    mainInner.innerHTML = ''
    mainInner.append(boardPlacement)
    boardArr.forEach(element => {
        addBoard(element);
    });

    boardReCreate()
}

let boardReCreate = () =>{ //пересоздание карточек в бордах
    
    allboard = document.querySelectorAll('.board_body_list');
    allboard.forEach(board => {
        board.innerHTML = '';
    });

    boardItemArr.sort((a, b) => a.position > b.position ? 1 : -1)  //сортируем массив, чтоб правильно выводить элементы

    if (filter.length == 0) {           //если фильтров нет, то выводим все элементы
        boardItemArr.forEach(card => {
            addBoardItem(card);
        });
    }else{
        boardItemArr.forEach(card => {  //если есть фильтры, то сравниваем айдишники тегов в карточке и в фильтре 
                                        //выводим только нужные карточки
            for (let i = 0; i < filter.length; i++) {
                if (card.tag[0] == filter[i] || card.tag[1] == filter[i]) {
                    addBoardItem(card);
                    break
                } 
                
            }
    
        }); 
    }

}


let addLog = (text) => { //добавление логов

    if (logArr.length >= 50) { //в логах хранится не больше 50 сообщений
        logArr.shift()
    }

    logArr.push(text)
    addToLocalStorage('log')
}

let addError = (error) =>{  //добавление описания ошибки для пользователя 
    let body = document.querySelector('body')
    let errorElement;
    if (!isError) { //если блока с ошибкой еще нет, то создаем его 
        errorElement = document.createElement('div')
        errorElement.classList.add('error')
    }else{
        errorElement = document.querySelector('.error'); //если есть, то переписываем ошибку
    }
    errorElement.innerHTML = error
    body.append(errorElement)
    setTimeout(removeError, 3000) //через 3 секунды описание ошибки исчезает
    isError = true;
}

let removeError = () => {
    if (document.querySelector('.error') != null) {
        document.querySelector('.error').remove()
    }
    isError = false;
}

let addToLocalStorage = (type) =>{  //добавление в локальное хранилище
    switch (type) {                                                                     //  Так как эту функцию я дергаю и так постоянно
        case 'color':                                                                   // мне не хотелось перезаписывать каждый раз еще и то, что не меняется
            localStorage.setItem('colorArr', JSON.stringify(colorArr))                  // так что в хранилище записываю что-то по ключу, который принимаю в функции
            localStorage.setItem('currentColorId', JSON.stringify(currentColorId))
            break;
        case 'item':
            localStorage.setItem('boardItemArr', JSON.stringify(boardItemArr));
            localStorage.setItem('itemId', JSON.stringify(itemId))
            break;
        case 'board':
            localStorage.setItem('boardId', JSON.stringify(boardId))
            localStorage.setItem('boardArr', JSON.stringify(boardArr));
        case 'log':
            localStorage.setItem('logArr', JSON.stringify(logArr))
        case 'name':
            localStorage.setItem('name', JSON.stringify(nameOfPlace))
        case 'user':
            localStorage.setItem('userArr', JSON.stringify(userArr))
            localStorage.setItem('userId', JSON.stringify(userId))
        default:

            break;
    }
    
}

// drag & drop 

let addDragAndDropEventBoard = (board) =>{
    board.childNodes[1].addEventListener('dragover', dragOverHeader) //Ивент проведения dragstar айтема над шапкой борды
}

let addDragAndDropEventBoardItem = (card) =>{ //ивенты для карточек

    card.addEventListener('dragover', dragOverCard);
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
}


function dragOverHeader(){ //Когда наша карточка над шапкой борды
    
    let newBoardId = this.closest(".board").getAttribute('board-index-number');
    let oldBoardId = draggableCard.closest('.board').getAttribute('board-index-number')
  
    if (boardArr[getBoardIndex(newBoardId)].cardCounter >= 10 && newBoardId != oldBoardId) {    //если в новой карточек больше 10 задач, то выходим из функции
        addError('В одной доске должно быть не более 10 карточек')
        return
    }else{
        removeError()                                       //если была ошибка - удаляем
    }


    this.nextSibling.nextSibling.childNodes[1].insertAdjacentElement('afterbegin', draggableCard)  //Добавляем элемент в нужный нам див, относительно this 


}

function dragOverCard(evt){    //Когда наша карточка над какой-то другой карточкой    
    
    let cursorY = evt.pageY - this.getBoundingClientRect().top //Положение курсора внутри карточки, над которой водим 
    let cardHeight = this.offsetHeight; //Высота карточки, над которой водим
    
    let newBoardId = this.closest(".board").getAttribute('board-index-number');
    let oldBoardId = draggableCard.closest('.board').getAttribute('board-index-number')

    if (boardArr[getBoardIndex(newBoardId)].cardCounter >= 10 && newBoardId != oldBoardId) {    
        addError('В одной доске должно быть не более 10 карточек')
        return
    }else{
        removeError()
    }

    if (cursorY > cardHeight/2) {  //Если я в верхней половине карточки
        this.insertAdjacentElement('afterend', draggableCard) //То добавляю новую карточку после той, на которую навжоу
    }else{ //если в нижней половине карточки
        this.insertAdjacentElement('beforebegin', draggableCard) //добавляю новую перед наведенной
    }


}

function dragStart(evt){               // Когда начинаем перетаскивать наш элемент      
    setTimeout(()=>{
        this.classList.add('drag_hide')     //Добавляем невидимость элементу
    },0)
    draggableCard = this;   // и запоминаем элемент, с которым работаем 
}

function dragEnd() {                 // Когда мы отпустили кнопку при перетаскивании  

    this.classList.remove('drag_hide')  // Удаляем невидимость элемента
   
    let currentItemId = draggableCard.getAttribute('item-index-number');                              
    let oldBoardId = boardItemArr[getBoardItemIndex(currentItemId)].boardId;
    let newBoardId = draggableCard.closest(".board").getAttribute('board-index-number');            //получаем данные для работы
    let oldPosition = boardItemArr[getBoardItemIndex(currentItemId)].position; 
    let newPosition;

    console.log()

    boardArr[getBoardIndex(oldBoardId)].cardCounter--    // В старой борде карточек стало меньше
    boardArr[getBoardIndex(newBoardId)].cardCounter++    // В новой больше

    if (draggableCard.previousSibling) {                                                                                                        //Если у элемента есть карточка перед ним
        newPosition = boardItemArr[getBoardItemIndex(draggableCard.previousSibling.getAttribute('item-index-number'))].position+1;              // то новая позиция - позиция переднего соседа +1
    }else{
        newPosition = 0;                                                                                                                        //если в начале соседа нет, то позиция начинается с 0
    }

    if (oldBoardId == newBoardId) {                                                                                                                               // Если мы работаем в одной доске
                                                                                                                                                                  
        boardItemArr.forEach(element => {                                                                                                                         
            if (element.boardId == newBoardId && newPosition < oldPosition && element.position < oldPosition && element.position >= newPosition) {                // и новая позиция меньше старой (ситуация, когда перетаскиваем
                element.position++;                                                                                                                               // сверху вниз), то все позиция всех элементов в этом промежутке сместится на 1 вверх
            }else if(element.boardId == newBoardId && newPosition > oldPosition && element.position > oldPosition && element.position <= newPosition){            // если новая позиция больше старой (наоборот, когда перетаскиваем снизу вверх)
                element.position--                                                                                                                                // то позиция всех элементов сместится на 1 вниз
            }
        });

    }else{                                                                                  // если же элементы в разных досках, то 

        boardItemArr.forEach(element => {
        
            if (element.boardId == oldBoardId && element.position > oldPosition) {          // в старой доске все элементы, позиция которых больше, чем была у перетаскиваемного элемента
                element.position--;                                                         // сместятся вниз на 1
            }
    
            if (element.boardId == newBoardId && element.position >= newPosition) {         // а в новой доске все элементы, позиция которых больше, чем у этого элемента 
                element.position++;                                                         // сместянтся на 1 вверх
            }
    
        });

    }



    boardItemArr[getBoardItemIndex(currentItemId)].position = newPosition;          // изменяем позицию и борду нашего элемента
    boardItemArr[getBoardItemIndex(currentItemId)].boardId = +newBoardId;

    addToLocalStorage('item');
    addToLocalStorage('board');

}

// Получение данных при загрузке страницы

let onLoad = () => { 


    //получаем данные про юзеров
    if (localStorage.getItem("userArr") != null) {
        userArr = JSON.parse(localStorage.getItem('userArr'))
        userId = JSON.parse(localStorage.getItem('userId'))
        updateUserIcon();
    }else{
        addUser(5);
    
    }


    //получаем URL фона

    if(localStorage.getItem('background') != null){
        document.querySelector('body').style.background = `url(${localStorage.getItem('background')})`;
        document.querySelector('body').style.backgroundSize = 'cover';
    }

    //получаем название доски

    if (localStorage.getItem("name") != null) {
        nameOfPlace = localStorage.getItem("name");
        nameOfPlace = nameOfPlace.replace(/"/g,"");
        placeForName.value = nameOfPlace
    }
    
    //получаем логи
    
    if (localStorage.getItem("logArr") != null && localStorage.getItem("logArr") != '[]') {
        logArr = JSON.parse(localStorage.getItem('logArr'));
        
    }
    
    //получаем массив тегов
    
    if(localStorage.getItem("colorArr") != null && localStorage.getItem("colorArr") != '[]'){
        colorArr = JSON.parse(localStorage.getItem('colorArr'));
        currentColorId = localStorage.getItem("currentColorId")
        currentColorId = +currentColorId;
    }else{
        addNewTag('#ff0000')
        addNewTag('#ffff00')  // если их нет - создаем по умолчанию
        addNewTag('#00ff00')
        addNewTag('#0000ff')
    }
    
    //получаем массив карточек
    
    if(localStorage.getItem("boardItemArr") != null && localStorage.getItem("boardItemArr") != '[]'){
        boardItemArr = JSON.parse(localStorage.getItem('boardItemArr'));
        itemId = JSON.parse(localStorage.getItem("itemId"))
        itemId = +itemId;
    }
    
    //получаем массив досок
    
    if (localStorage.getItem("boardArr") != null && localStorage.getItem("boardArr") != '[]') {
        boardArr = JSON.parse(localStorage.getItem('boardArr'));
        boardId = JSON.parse(localStorage.getItem("boardId"))
        boardId = +boardId
    }else{
        createBoard(boardId, "To Do", "#cccccc")
        createBoard(boardId, "In Progress", "#cccccc") // если их нет - создаем по умолчанию
        createBoard(boardId, "Done", "#cccccc")
    }
    
    currentDate = getCurrentDate();

}


onLoad(); 
reCreate();