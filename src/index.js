// let AllTodos = localStorage.todos ? JSON.parse(localStorage.todos) : [];
let AllTodos = [];
const tbody = document.querySelector("#todo-tbody");
const editingTodo = { id: null, title: null, description: null, status: null };
const apiURL = "http://localhost:3000/todos";

const todoForm = document.querySelector("#form");
const initForm = () => {
    todoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const todo = getTodoFromForm(todoForm);
        if (todo.id === undefined) {
            addTodo(todo);
        } else {
            editTodo(todo);
        }
        todoForm.reset();
        setEditId(null);
        renderToHTML({
            todos: AllTodos,
            onDelete: deleteTodo,
            onComplete: completeTodo,
            onEdit: setEditId,
        });
    });
};
const getTodoApi = async () => {
    const response = await fetch(apiURL, {
        method: 'GET',
    });
    return response.ok ? await response.json() : []
    
};
const getTodoFromForm = (form) => {
    // funcion
    // Tomar el id si se esta editando
    // const firstInput = document.querySelector('#id1')
    // const secondInput = document.querySelector('#id2')
    // const value1 = firstInput.value
    // const value2 = secondInput.value
    // const result = parseInt(value1) + parseInt(value2)
    // const thirdInput = document.querySelector('#id3')
    // thirdInput.value = result

    // botomn dksajchialdhs
    // funcion()

    // boton()

    const todo = {
        id: editingTodo.id ? editingTodo.id : undefined,
        title: form.elements.title.value,
        description: form.elements.description.value,
        status: editingTodo.status ? editingTodo.status : undefined,
    };
    return todo;
};
const addTodoApi = async (todo) => {
    const response = await fetch(apiURL, {
        method: "POST",
        body: JSON.stringify(todo),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.ok;
};
const addTodo = async (todo) => {
    const allIds = AllTodos.map((todo) => {
        return todo.id;
    });
    todo.id = Math.max(0, ...allIds) + 1;
    // todo.id = Date.now()
    todo.status = "pending";
    const ok = await addTodoApi(todo);

    if (ok) {
        AllTodos.push(todo);
    } else {
        console.log("hubo un error agregando la tarea");
    }
};

const editTodo = (todo) => {
    const oldTodoIndex = AllTodos.findIndex((todoItem) => {
        return todoItem.id === todo.id;
    });
    if (oldTodoIndex === -1) {
        return;
    }
    const oldTodo = AllTodos[oldTodoIndex];
    todo.status = oldTodo.status;

    AllTodos.splice(oldTodoIndex, 1, todo);
};
// recivo el id para poder buscarlo en la lista
const deleteTodo = (id) => {
    const deleteTodoIndex = AllTodos.findIndex((todo) => {
        return todo.id === id;
    });

    // Si es -1 no lo encontro
    if (deleteTodoIndex === -1) {
        return;
    }

    AllTodos.splice(deleteTodoIndex, 1);
};

// recivo el id para poder buscarlo en la lista
const completeTodo = (id) => {
    const todo = AllTodos.find((todo) => {
        return todo.id === id;
    });

    // Si es undefined es que no lo encontro
    if (todo === undefined) {
        return;
    }

    todo.status = "completed";
};
//  aqui editamos los inputs con los valores del editingTodo
const showEditingTodo = () => {
    todoForm.elements.title.value = editingTodo.title;
    todoForm.elements.description.value = editingTodo.description;
};
// recivo el id para poder buscarlo en la lista
const setEditId = (id = null) => {
    editingTodo.id = id;
    // borramos los valores del editingTodo si el valor es null
    if (id === null) {
        editingTodo.title = null;
        editingTodo.description = null;
        editingTodo.status = null;
        return;
    }
    const todo = AllTodos.find((todo) => {
        return todo.id === id;
    });
    if (todo === undefined) {
        return;
    }
    // ponemos los valores del todo en el editingTodo y luego llamo a showwditingTodo para que lo muestre en el form
    editingTodo.title = todo.title;
    editingTodo.description = todo.description;
    editingTodo.status = todo.status;
    showEditingTodo();
};

const renderToHTML = ({ todos = [], onDelete, onComplete, onEdit }) => {
    // localStorage.todos = JSON.stringify(todos);
    const result = todos.map((todo) => {
        const tr = document.createElement("tr");

        const tdTitle = document.createElement("td");
        tdTitle.textContent = todo.title;

        const tdDescription = document.createElement("td");
        tdDescription.textContent = todo.description;

        const tdStatus = document.createElement("td");
        tdStatus.textContent = todo.status;

        const tdActions = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => {
            // le paso el id de la tarea que se va a editar
            onEdit(todo.id);
        };

        const completeButton = document.createElement("button");
        completeButton.textContent = "Complete";
        completeButton.onclick = () => {
            // le paso el id de la tarea que se va a completar
            onComplete(todo.id);
            // eso se llama recursividad metodo que se llama a si mismo
            renderToHTML({ todos, onComplete, onDelete, onEdit });
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => {
            // le paso el id de la tarea que se va a elimina
            onDelete(todo.id);
            // eso se llama recursividad metodo que se llama a si mismo
            renderToHTML({ todos, onDelete, onComplete, onEdit });
        };

        tdActions.append(editButton, completeButton, deleteButton);

        tr.append(tdTitle, tdDescription, tdStatus, tdActions);
        return tr;
    });

    if (result.length === 0) {
        const emptyList = `<tr><td colspan="4" style="text-align: center;">No task found</td></tr>`;
        tbody.innerHTML = emptyList;
        return;
    }
    tbody.replaceChildren(...result);
};

const initReset = () => {
    document.querySelector("#resetButton").addEventListener("click", () => {
        todoForm.reset();
        setEditId(null);
    });
};

const init = async () => {
    initForm();
    initReset();
    AllTodos = await getTodoApi()
    renderToHTML({
        todos: AllTodos,
        onDelete: deleteTodo,
        onComplete: completeTodo,
        onEdit: setEditId,
    });
};
init();
