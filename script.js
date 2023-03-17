const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

// Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}
// ====================END========================

// Fungsi ini digunakan untuk menyimpan data ke localStorage berdasarkan KEY yang sudah ditetapkan sebelumnya.
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}
// ====================END========================

// Fungsi ini digunakan untuk memuat data dari localStorage Dan memasukkan data hasil parsing ke variabel
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}
// ====================END========================
// fungsi MAKE BOOK
function makeBook(bookObject) {
  const addJudul = document.createElement("h3");
  addJudul.innerText = bookObject.title;

  const addPenulis = document.createElement("p");
  addPenulis.innerText = "Penulis : " + bookObject.author;

  const addTahun = document.createElement("p");
  addTahun.innerText = "Tahun : " + bookObject.year;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const buttonDelete = document.createElement("button");
  buttonDelete.classList.add("red");
  buttonDelete.setAttribute("id", "button-delete");
  buttonDelete.innerText = "Hapus Buku";

  const articleContainer = document.createElement("article");
  articleContainer.classList.add("book_item");
  articleContainer.append(addJudul, addPenulis, addTahun, buttonContainer);
  articleContainer.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isCompleted) {
    const buttonUndo = document.createElement("button");
    buttonUndo.classList.add("green");
    buttonUndo.setAttribute("id", "button-undo");
    buttonUndo.innerText = "Belum selesai dibaca";

    buttonUndo.addEventListener("click", function () {
      undoTaskFromCompleted(bookObject.id);
    });
    buttonDelete.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttonContainer.append(buttonUndo, buttonDelete);
    articleContainer.append(buttonContainer);
  } else {
    const buttonDone = document.createElement("button");
    buttonDone.classList.add("green");
    buttonDone.setAttribute("id", "button-done");
    buttonDone.innerText = "Selesai dibaca";

    buttonDone.addEventListener("click", function () {
      addTaskToCompleted(bookObject.id);
    });
    buttonDelete.addEventListener("click", function () {
      removeTaskFromCompleted(bookObject.id);
    });

    buttonContainer.append(buttonDone, buttonDelete);
    articleContainer.append(buttonContainer);
  }

  return articleContainer;
}

// Fungsi ADD BOOK
function addBook() {
  const addJudul = document.getElementById("inputBookTitle").value;
  const addPenulis = document.getElementById("inputBookAuthor").value;
  const addTahun = document.getElementById("inputBookYear").value;
  const addStatus = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, addJudul, addPenulis, addTahun, addStatus);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
// ====================END========================

// Fungsi Memindahkan ke Rak sudah dibaca
function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}
// ====================END========================

// FUNGSI MENGHAPUS DATA BUKU
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
// ====================END========================

// FUNGSI MENGEMBALIKAN BUKU KE RAK BELUM DIBACA
function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}
// ====================END========================

// Fungsi SEARCH BUKU
document.getElementById("searchBook").addEventListener("submit", function (event) {
  event.preventDefault();
  const searchBook = document.getElementById("searchBookTitle").value.toLowerCase();
  const bookList = document.querySelectorAll(".book_item > h3");
  for (const book of bookList) {
    if (book.innerText.toLowerCase().includes(searchBook)) {
      book.parentElement.style.display = "block";
    } else {
      book.parentElement.style.display = "none";
    }
  }
});
// ====================END========================

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener("DOMContentLoaded", function () {
  const inputBukuForm = document.getElementById("inputBook");

  inputBukuForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
});

// Merubah tulisan button submit input
const checkbox = document.getElementById("inputBookIsComplete");
let check = false;

checkbox.addEventListener("change", function () {
  if (checkbox.checked) {
    check = true;

    document.querySelector("span").innerText = "Selesai dibaca";
  } else {
    check = false;

    document.querySelector("span").innerText = "Belum selesai dibaca";
  }
});
// ====================END========================
document.addEventListener(RENDER_EVENT, function () {
  const unreadBOOKList = document.getElementById("incompleteBookshelfList");
  const readBOOKList = document.getElementById("completeBookshelfList");
  unreadBOOKList.innerHTML = "";
  readBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      readBOOKList.append(bookElement);
    } else {
      unreadBOOKList.append(bookElement);
    }
  }
});
