// let AllTodos = localStorage.todos ? JSON.parse(localStorage.todos) : [];
let AllTodos = [];
const tbody = document.querySelector("#todo-tbody");
const editingTodo = { id: null, title: null, description: null, status: null };
const apiURL = "http://localhost:3000/todos";

const todoForm = document.querySelector("#form");
const initForm = () => {
  todoForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const todo = getTodoFromForm(todoForm);
    const validTodo = validateTodo(todo);
    if (validTodo === undefined) return;

    if (validTodo.id === undefined) await addTodo(validTodo);
    else await editTodo(validTodo);

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

const titleError = document.querySelector("#title-error");
const descriptionError = document.querySelector("#description-error");
const validateTodo = (todo) => {
  titleError.textContent = "";
  descriptionError.textContent = "";
  if (todo.title.trim() === "") {
    titleError.textContent = "Title is required";
    return;
  }
  if (todo.description.trim() === "") {
    descriptionError.textContent = "Description is required";
    return;
  }
  return todo;
};

const getTodoApi = async () => {
  const response = await fetch(apiURL, {
    method: "GET",
  });
  return response.ok ? await response.json() : [];
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

const editTodoApi = async (todo) => {
  const response = await fetch(`${apiURL}/${todo.id}`, {
    method: "PUT",
    body: JSON.stringify(todo),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.ok;
};

const editTodo = async (todo) => {
  const oldTodoIndex = AllTodos.findIndex((todoItem) => {
    return todoItem.id === todo.id;
  });
  if (oldTodoIndex === -1) return;

  const oldTodo = AllTodos[oldTodoIndex];
  todo.status = oldTodo.status;

  const ok = await editTodoApi(todo);
  if (!ok) return;

  AllTodos.splice(oldTodoIndex, 1, todo);
};
// recivo el id para poder buscarlo en la lista
const deleteTodoApi = async (id) => {
  const response = await fetch(`${apiURL}/${id}`, {
    method: "DELETE",
  });
  return response.ok;
};
const deleteTodo = async (id) => {
  const ok = await deleteTodoApi(id);
  if (!ok) return;

  const deleteTodoIndex = AllTodos.findIndex((todo) => {
    return todo.id === id;
  });

  // Si es -1 no lo encontro
  if (deleteTodoIndex === -1) {
    return;
  }

  AllTodos.splice(deleteTodoIndex, 1);
};

const completeTodoApi = async (id) => {
  const response = await fetch(`${apiURL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.ok;
};

// recivo el id para poder buscarlo en la lista
const completeTodo = async (id) => {
  const todo = AllTodos.find((todo) => {
    return todo.id === id;
  });

  // Si es undefined es que no lo encontro
  if (todo === undefined) {
    return;
  }
  const ok = await completeTodoApi(id);
  if (!ok) return;
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
    tdActions.append(editButton);
    if (todo.status !== "completed") {
      const completeButton = document.createElement("button");
      completeButton.textContent = "Complete";
      completeButton.onclick = async () => {
        // le paso el id de la tarea que se va a completar
        await onComplete(todo.id);
        // eso se llama recursividad metodo que se llama a si mismo
        renderToHTML({ todos, onComplete, onDelete, onEdit });
      };
      tdActions.append(completeButton);
    }

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = async () => {
      // le paso el id de la tarea que se va a elimina
      await onDelete(todo.id);
      // eso se llama recursividad metodo que se llama a si mismo
      renderToHTML({ todos, onDelete, onComplete, onEdit });
    };

    tdActions.append(deleteButton);

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
    titleError.textContent = "";
    descriptionError.textContent = "";
  });
};

const init = async () => {
  initForm();
  initReset();
  AllTodos = await getTodoApi();
  renderToHTML({
    todos: AllTodos,
    onDelete: deleteTodo,
    onComplete: completeTodo,
    onEdit: setEditId,
  });
};
init();
