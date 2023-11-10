
const itemsArray = localStorage.getItem("items")
    ? JSON.parse(localStorage.getItem("items")).map((item) => ({
        ...item,
        deadline: new Date(item.deadline),
    }))
    : [];

document.querySelector("#enter").addEventListener("click", () => {
    const item = document.querySelector("#item");
    const deadline = document.querySelector("#deadline").value;
    createItem(item.value, deadline);
    item.value = '';
});

function displayItems() {
    let items = "";
    for (let i = 0; i < itemsArray.length; i++) {
        items += ` <div class="item">
    <div class="input-controller">
    <i class="fa-solid fa-check completeBtn"></i>
        <textarea id="text" disabled>${itemsArray[i].text}</textarea>
        <div class="deadline-display">${itemsArray[i].deadline}</div>
        <div class="edit-controller">
        <i class="fa-regular fa-trash-can deleteBtn"></i>
            <i class="fa-solid fa-pen-to-square editBtn"></i>
        </div>
    </div>
    <div class="update-controller">
        <button class="saveBtn">Save</button>
        <button class="cancelBtn">Cancel</button>
    </div>
</div> `;
    }
    document.querySelector(".todo-list").innerHTML = items;
    activateCompleteListeners();
    activateDeleteListeners();
    activateEditListeners();
    activateSaveListeners();
    activateCancelListeners();
    activateSortListeners();
}

function activateCompleteListeners() {
    let completeBtn = document.querySelectorAll(".completeBtn");
    completeBtn.forEach((cb, i) => {
        cb.addEventListener("click", () => {
            completeTodo(i);
        });
    });
}

function activateSortListeners() {
    const sortBtn = document.querySelector("#sortId");
    sortBtn.addEventListener('click', () => {
        sortItems(sortBtn)
    });
}

function activateDeleteListeners() {
    let deleteBtn = document.querySelectorAll(".deleteBtn");
    deleteBtn.forEach((db, i) => {
        db.addEventListener("click", () => {
            deleteItem(i);
        });
    });
}

function activateEditListeners() {
    const editBtn = document.querySelectorAll(".editBtn");
    const updateController = document.querySelectorAll(".update-controller");
    const inputs = document.querySelectorAll(".input-controller textarea");
    editBtn.forEach((eb, i) => {
        eb.addEventListener("click", () => {
            updateController[i].style.display = "block";
            inputs[i].disabled = false;
        });
    });
}

function activateSaveListeners() {
    const saveBtn = document.querySelectorAll(".saveBtn");
    const inputs = document.querySelectorAll(".input-controller textarea");
    saveBtn.forEach((sb, i) => {
        sb.addEventListener("click", () => {
            updateItem(inputs[i].value, i);
        });
    });
}

function activateCancelListeners() {
    const cancelBtn = document.querySelectorAll(".cancelBtn");
    const updateController = document.querySelectorAll(".update-controller");
    const inputs = document.querySelectorAll(".input-controller textarea");
    cancelBtn.forEach((cb, i) => {
        cb.addEventListener("click", () => {
            updateController[i].style.display = "none";
            inputs[i].disabled = true;
        });
    });
}

function completeTodo(i) {
    const textAreas = document.querySelectorAll("textarea");
    textAreas.forEach((textarea, idx) => {
        if (idx === i) {
            if (textarea.classList.contains("completed")) {
                textarea.classList.remove("completed");
            } else {
                textarea.classList.add("completed");
            }
        }
    });
}

function updateItem(text, i) {
    const deadline = itemsArray[i].deadline;
    itemsArray[i] = {text: text, deadline: deadline};
    localStorage.setItem("items", JSON.stringify(itemsArray));
    displayItems();
}

function deleteItem(i) {
    itemsArray.splice(i, 1);
    localStorage.setItem("items", JSON.stringify(itemsArray));
    displayItems();
}

let sortBtnIsClicked = false;
let sortDescending = true;

function sortItems(sortBtn) {
    sortBtnIsClicked = !sortBtnIsClicked;

    if (sortBtnIsClicked) {
        if (sortDescending) {
            sortBtn.classList.add("fa-rotate-180");
            itemsArray.sort((a, b) => b.deadline - a.deadline);
        } else {
            sortBtn.classList.remove("fa-rotate-180");
            itemsArray.sort((a, b) => a.deadline - b.deadline);
        }
        sortDescending = !sortDescending;
    }
    displayItems();
}

function displayDate() {
    let date = new Date();
    date = date.toString().split(" ");
    document.querySelector("#date").innerHTML =
        date[1] + " " + date[2] + " " + date[3];
}

Notification.requestPermission().then(function (permission) {
    if (permission !== "granted") {
        console.log("Permission not granted for notifications.");
    }
});

function displayNotification(taskName) {
    if (Notification.permission === "granted") {
        new Notification("Task Deadline Approaching", {
            body: `The deadline of "${taskName}" is approaching. Complete the task faster!`,
        });
    }
}

function planNotification(text, showDate) {
    const notificationDateInMs = showDate.getTime();
    const currentDateInMs = Date.now();
    const distanceToNotificationShowInMs = notificationDateInMs - currentDateInMs;

    if (distanceToNotificationShowInMs < 0) return undefined;

    return setTimeout(
        () => displayNotification(text),
        distanceToNotificationShowInMs
    );
}

function planStoreTodosNotifications() {
    itemsArray.forEach((item) => {
        item.notificationTimeoutId = planNotification(
            item.text,
            addHours(item.deadline, -1)
        );
    });
}
function createItem(text, deadlineStr) {
    const deadline = new Date(deadlineStr);
    const notificationTimeoutId = planNotification(text, addHours(deadline, -1));
    itemsArray.push({text, deadline, notificationTimeoutId});
    localStorage.setItem("items", JSON.stringify(itemsArray));
    displayItems();
}
function addHours(date, count) {
    const result = new Date(date);
    result.setHours(date.getHours() + count);
    return result;
}

window.onload = function () {
    displayDate();
    displayItems();
    planStoreTodosNotifications();
};
