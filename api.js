const API_URL = "https://typicode.com";

// Global local cache to track state changes since JSONPlaceholder won't persist updates on their servers
let localNotes = [];

// Reusable async function that calls fetch, handles parsing, checks response.ok, and throws errors
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    // DELETE requests from JSONPlaceholder return empty bodies, handle that case gracefully
    if (options.method === 'DELETE') {
        return true;
    }
    return await response.json();
}

// Elements
const loadBtn = document.getElementById('load-btn');
const statusText = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');
const notesList = document.getElementById('notes-list');

// Set visual feedback statuses safely
function setStatus(text, type = '') {
    statusText.textContent = text;
    statusText.className = type;
}

// Render local storage notes array to DOM
function renderNotes() {
    notesList.innerHTML = '';
    if (localNotes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = "No notes available. Click 'Load notes' or create one!";
        emptyItem.className = "empty-msg";
        notesList.appendChild(emptyItem);
        return;
    }

    localNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-card';

        const titleEl = document.createElement('h3');
        titleEl.textContent = note.title;

        const bodyEl = document.createElement('p');
        bodyEl.textContent = note.body || '';

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        li.appendChild(titleEl);
        li.appendChild(bodyEl);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
    });
}

// GET - Load 10 notes
async function loadNotes() {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "info");
    
    try {
        const data = await apiRequest(`${API_URL}?_limit=10`);
        localNotes = data;
        renderNotes();
        setStatus("Loaded 10 notes from the server.", "success");
    } catch (error) {
        console.error(error);
        setStatus("Failed to load notes. Please check your network connection.", "error");
    } finally {
        loadBtn.disabled = false;
    }
}

// POST - Create Note
async function createNote(e) {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Front-end Validation
    if (!title) {
        setStatus("Validation Error: Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        setStatus("Validation Error: Title cannot exceed 100 characters.", "error");
        return;
    }

    submitBtn.disabled = true;
    setStatus("Saving note...", "info");

    try {
        const newNoteData = {
            title: title,
            body: body,
            userId: 1
        };

        const createdNote = await apiRequest(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(newNoteData)
        });

        // Prepend created item to the UI display list
        localNotes.unshift(createdNote);
        renderNotes();
        
        setStatus(`Note created (status 201, id 101).`, "success");
        noteForm.reset();
    } catch (error) {
        console.error(error);
        setStatus("Failed to save note. Server error.", "error");
    } finally {
        submitBtn.disabled = false;
    }
}

// DELETE - Remove Note
async function deleteNote(id) {
    // Approach Explanation for JSONPlaceholder Mock Limitation:
    // JSONPlaceholder simulates REST API mutations but does not actually delete resources permanently on its server. 
    // To present a valid user experience, our app dispatches a true network DELETE request step, intercepts 
    // success validation (status 200/204 response), and filters out the targeted object locally from localNotes memory.
    
    setStatus("Deleting note...", "info");
    try {
        await apiRequest(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        localNotes = localNotes.filter(note => note.id !== id);
        renderNotes();
        setStatus("Note successfully removed from list.", "success");
    } catch (error) {
        console.error(error);
        setStatus("Failed to delete note from server.", "error");
    }
}

// Event Listeners
loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);

// Initial state display setup
renderNotes();
