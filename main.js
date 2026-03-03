const books = [];
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_SELF';
const RENDER_EVENT = 'render-book';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return { id, title, author, year, isComplete };
}

function isStorageExist() {
    if (typeof Storage === 'undefined') {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveBook() {
    if (isStorageExist()) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookId) {
    return books.find((b) => b.id === bookId) || null;
}

function findBookIndex(bookId) {
    return books.findIndex((b) => b.id === bookId);
}

function makeBookElement(bookObject) {
    const { id, title, author, year, isComplete } = bookObject;

    const container = document.createElement('div');
    container.setAttribute('data-bookid', id);
    container.setAttribute('data-testid', 'bookItem');

    const titleEl = document.createElement('h3');
    titleEl.setAttribute('data-testid', 'bookItemTitle');
    titleEl.textContent = title;

    const authorEl = document.createElement('p');
    authorEl.setAttribute('data-testid', 'bookItemAuthor');
    authorEl.textContent = `Penulis: ${author}`;

    const yearEl = document.createElement('p');
    yearEl.setAttribute('data-testid', 'bookItemYear');
    yearEl.textContent = `Tahun: ${year}`;

    const buttonGroup = document.createElement('div');

    const toggleBtn = document.createElement('button');
    toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
    toggleBtn.textContent = isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    toggleBtn.addEventListener('click', () => toggleBookComplete(id));

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteBtn.textContent = 'Hapus Buku';
    deleteBtn.addEventListener('click', () => removeBook(id));

    const editBtn = document.createElement('button');
    editBtn.setAttribute('data-testid', 'bookItemEditButton');
    editBtn.textContent = 'Edit Buku';
    editBtn.addEventListener('click', () => openEditModal(id));

    buttonGroup.append(toggleBtn, deleteBtn, editBtn);
    container.append(titleEl, authorEl, yearEl, buttonGroup);

    return container;
}

function renderBooks(query = '') {
    const incompleteList = document.getElementById('incompleteBookList');
    const completeList = document.getElementById('completeBookList');

    incompleteList.innerHTML = '';
    completeList.innerHTML = '';

    const keyword = query.toLowerCase();

    let incompleteCount = 0;
    let completeCount = 0;

    for (const book of books) {
        if (keyword && !book.title.toLowerCase().includes(keyword)) continue;

        const el = makeBookElement(book);
        if (book.isComplete) {
            completeList.appendChild(el);
            completeCount++;
        } else {
            incompleteList.appendChild(el);
            incompleteCount++;
        }
    }

    if (incompleteCount === 0) {
        incompleteList.innerHTML = '<p class="empty-state">Tidak ada buku di sini.</p>';
    }
    if (completeCount === 0) {
        completeList.innerHTML = '<p class="empty-state">Tidak ada buku di sini.</p>';
    }
}

function addBook() {
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = Number(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (!title || !author || !year) return;

    const id = generateId();
    const bookObject = generateBookObject(id, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function removeBook(bookId) {
    const idx = findBookIndex(bookId);
    if (idx === -1) return;
    books.splice(idx, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function toggleBookComplete(bookId) {
    const book = findBook(bookId);
    if (!book) return;
    book.isComplete = !book.isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function createEditModal() {
    if (document.getElementById('editModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'editModal';
    overlay.className = 'modal-overlay hidden';

    overlay.innerHTML = `
    <div class="modal-box">
      <h2>Edit Buku</h2>
      <div>
        <label for="editBookTitle">Judul</label>
        <input id="editBookTitle" type="text" />
      </div>
      <div>
        <label for="editBookAuthor">Penulis</label>
        <input id="editBookAuthor" type="text" />
      </div>
      <div>
        <label for="editBookYear">Tahun</label>
        <input id="editBookYear" type="number" />
      </div>
      <div class="modal-actions">
        <button id="editBookSave">Simpan</button>
        <button id="editBookCancel">Batal</button>
      </div>
    </div>
  `;

    document.body.appendChild(overlay);

    document.getElementById('editBookCancel').addEventListener('click', closeEditModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeEditModal();
    });
}

function openEditModal(bookId) {
    const book = findBook(bookId);
    if (!book) return;

    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');

    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookYear').value = book.year;

    const saveBtn = document.getElementById('editBookSave');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.replaceWith(newSaveBtn);

    newSaveBtn.addEventListener('click', () => saveEditBook(bookId));
}

function saveEditBook(bookId) {
    const book = findBook(bookId);
    if (!book) return;

    const newTitle = document.getElementById('editBookTitle').value.trim();
    const newAuthor = document.getElementById('editBookAuthor').value.trim();
    const newYear = Number(document.getElementById('editBookYear').value);

    if (!newTitle || !newAuthor || !newYear) {
        alert('Semua field harus diisi!');
        return;
    }

    book.title = newTitle;
    book.author = newAuthor;
    book.year = newYear;

    closeEditModal();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.add('hidden');
}

function updateSubmitLabel() {
    const isComplete = document.getElementById('bookFormIsComplete').checked;
    const span = document.querySelector('#bookFormSubmit span');
    if (span) span.textContent = isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
}

document.addEventListener('DOMContentLoaded', () => {
    createEditModal();

    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
        bookForm.reset();
        updateSubmitLabel();
    });

    document.getElementById('bookFormIsComplete')
        .addEventListener('change', updateSubmitLabel);

    document.getElementById('searchBook').addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('searchBookTitle').value;
        renderBooks(query);
    });

    document.getElementById('searchBookTitle').addEventListener('input', (e) => {
        if (e.target.value === '') renderBooks('');
    });

    document.addEventListener(RENDER_EVENT, () => {
        const query = document.getElementById('searchBookTitle').value;
        renderBooks(query);
    });

    document.addEventListener(SAVED_EVENT, () => {
        console.log('Buku berhasil disimpan ke localStorage');
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});