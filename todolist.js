const inNovaTarefa = document.getElementById("nova-tarefa");
const btAddTarefa = document.getElementById("add-tarefa");

let tarefas = [];

const addTarefa = async () => {
    const novaTarefa = new Parse.Object("Tarefa");

    novaTarefa.set("descricao", inNovaTarefa.value);
    inNovaTarefa.value = "";

    novaTarefa.set("posicao", tarefas.length);

    try {
        let result = await novaTarefa.save();
        console.log("Objeto de ID \'" + result.id + "\' criado com sucesso.")
    } catch (error) {
        console.error("Falha ao criar novo objeto. Erro de código: " + error);
    }

    pullTarefas();
};

const pullTarefas = async () => {
    const tarefa = Parse.Object.extend("Tarefa");
    const query = new Parse.Query(tarefa);

    try {
        const results = await query.find();

        tarefas = [];

        for (const object of results) {
            const id = object.id;
            const descricao = object.get("descricao");
            const feito = object.get("feito");
            const posicao = object.get("posicao");

            tarefas.push({id, descricao, feito, posicao});
  
            console.log(`ID: ${id}, Descrição: ${descricao}, Concluída: ${feito}, Posição: ${posicao}`);
        }

        console.log(`Fetch executado com sucesso.`);

        tarefas = sortLista(tarefas);
        mostrarTarefas();

    } catch (error) {
        console.error("Falha ao execeutar o fetch dos objetos da classe \'Tarefa\'. Erro de código: ", error);
    }
};

const sortLista = (lista) => {
    lista.sort((a, b) => a.posicao - b.posicao);
    return lista;
}

const listaTarefas = document.getElementById("todo-list");


const mostrarTarefas = () => {
    
    listaTarefas.innerHTML = "";

    for (let i = 0; i < tarefas.length; i++) {
        const toDoItem = criarNovaTarefa(tarefas[i]);

        listaTarefas.appendChild(toDoItem);
    }


}

const criarNovaTarefa = (tarefa) => {
    const li = criarNovoLi(tarefa.id, tarefa.posicao , tarefa.feito);
    const checkBox = criarNovoCheckBox(tarefa.id, tarefa.descricao, tarefa.feito);
    const editBox = criarNovoEditBox(tarefa.id);        

    li.appendChild(checkBox);
    li.appendChild(editBox);

    return li;
}

const criarNovoLi = (id, posicao, feito) => {
    const li = document.createElement("li");

    li.setAttribute("id", "tarefa_" + id);
    li.setAttribute("value", posicao);
    li.setAttribute("draggable", true);
    li.setAttribute("ondragover", "event.preventDefault()");
    li.className = "dropzone";
    

    return li;
}

const criarNovoCheckBox = (id, descricao, feito) => {
    const label = document.createElement("label");
    label.className = "checkbox";

    const span = document.createElement("span");
    span.setAttribute("id", "text_" + id);

    const text = document.createTextNode(`${descricao}`);
    span.appendChild(text);

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.setAttribute("id", "check_" + id);
    checkBox.setAttribute("onchange", "mudarStatus(this.id)");

    if (feito) {
        checkBox.setAttribute("checked", true);
    }

    const checkMark = document.createElement("span");
    checkMark.className = "checkmark";

    const input = document.createElement("input");
    input.type = "text";
    input.setAttribute("id", "inEdit_" + id);

    label.appendChild(span);
    label.appendChild(checkBox);
    label.appendChild(checkMark);
    label.appendChild(input);

    return label;
}

const criarNovoEditBox = (id) => {
    const div = document.createElement("div");
    div.className = "tarefa-final";

    const btCancelarEdit = document.createElement("span");
    btCancelarEdit.setAttribute("id", "cancelEdit_" + id);
    btCancelarEdit.className = "material-symbols-sharp";
    btCancelarEdit.innerHTML = "";

    const btEdit = document.createElement("span");
    btEdit.setAttribute("id", "btEdit_" + id);
    btEdit.setAttribute("onclick", "editarTarefa(this.id)");
    btEdit.className = "material-symbols-sharp";
    btEdit.innerHTML = "edit";

    const btRemover = document.createElement("span");
    btRemover.setAttribute("id", "delete_" + id);
    btRemover.setAttribute("onclick", "apagarTarefa(this.id)");
    btRemover.className = "material-symbols-sharp";
    btRemover.innerHTML = "delete";

    div.appendChild(btCancelarEdit);
    div.appendChild(btEdit);
    div.appendChild(btRemover);

    return div;
}

const apagarTarefa = (id) => {
    id = separarID(id);

    let tarefaApagada = document.querySelector("#tarefa_" + id);

    tarefaApagada.remove();

    apagarTarefaAPI(id);
    
    
}

const separarID = (id) => {
    return id.split("_")[1];
}

const apagarTarefaAPI = async (id) => {
    const tarefaApagada = new Parse.Object("Tarefa");

    tarefaApagada.set("objectId", id);

    try {
        let resultado = await tarefaApagada.destroy();
        console.log("Objeto de ID \'" + resultado.id + "\' destruído com sucesso.");
    } catch (error) {
        console.error("Falha ao destruir objeto. Erro de código: " + error);
    }
}

const mudarStatus = (id) => {
    let checkBox = document.getElementById(id);
    let boolean = checkBox.getAttribute("checked");
    id = separarID(id);
    let tarefa = document.querySelector("#tarefa_"+id);
   
    tarefa.classList.toggle("concluida");
    mudarStatusAPI(id,boolean);
}



const mudarStatusAPI = async (id, boolean) => {
    const tarefaMudada = new Parse.Object("Tarefa");

    tarefaMudada.set("objectId", id);
    tarefaMudada.set("feito", boolean);

    try {
        let result = await tarefaMudada.save();
        console.log("Mudança de status do objeto de ID \'" + result.id + "\' atualizado com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

const atualizarPosicao = () => {
    let lista = document.getElementById("todo-list").children;

    for (let i = 0; i < lista.length; i++) {
        lista[i].setAttribute("value", i);
        let id = separarID(lista[i].id);
        atualizarPosicaoAPI(id, i);
    }
}

const atualizarPosicaoAPI = async (id, posicao) => {
    const tarefaMovida = new Parse.Object("Tarefa");

    tarefaMovida.set("objectId", id);
    tarefaMovida.set("posicao", posicao);

    try {
        let result = await tarefaMovida.save();
        console.log("Posição do objeto de ID \'" + result.id + "\' atualizada com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

let dragged;
let position;
let index;
let indexDrop;
let list;

document.addEventListener("dragstart", ({target}) => {
    dragged = target;
    position = target.value;
    list = target.parentNode.children;

    for (let i = 0; i < list.length; i++) {
        if (list[i] === dragged) {
            index = i;
        }
    }
});

document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

document.addEventListener("drop", ({target}) => {
    if (target.className == "dropzone" && target.value !== position) {
        dragged.remove(dragged);

        for (let i = 0; i < list.length; i++) {
            if (list[i] === target) {
                indexDrop = i;
            }
        }


        if (index > indexDrop) {
            target.before(dragged);
        } else {
            target.after(dragged);
        }

        atualizarPosicao();
    }
});

const editarTarefa = (id) => {
    let btEditar = document.getElementById(id);

    id = separarID(id);

    let btCancelar = document.querySelector("#cancelEdit_" + id);
    let btDeletar = document.querySelector("#delete_" + id);
    let texto = document.querySelector("#text_" + id);
    let input = document.querySelector("#inEdit_" + id);

    btEditar.classList.toggle("edit-on");
    btCancelar.classList.toggle("edit-on");
    btDeletar.classList.toggle("edit-on");
    texto.classList.toggle("edit-on");
    input.classList.toggle("edit-on");

    btEditar.innerHTML = "check_circle";
    btCancelar.innerHTML = "cancel";
    btDeletar.innerHTML = "";

    input.value = texto.innerHTML;
    input.focus();

    btEditar.onclick = () => {
        if (input.value !== null && input.value !== "") {
            texto.innerHTML = input.value;
            editarTarefaAPI(id, input.value);
            finalizarEditar();
        }
    }

    btCancelar.onclick = () => {
        finalizarEditar();
    }

    let tarefaBox = document.querySelector("#tarefa_" + id);

    document.addEventListener("click", (event) => {
        let clickDentro = tarefaBox.contains(event.target);

        if (!clickDentro) {
            finalizarEditar();
        }
    });

    const finalizarEditar = () => {
        btEditar.classList.toggle("edit-on");
        btCancelar.classList.toggle("edit-on");
        btDeletar.classList.toggle("edit-on");
        texto.classList.toggle("edit-on");
        input.classList.toggle("edit-on");

        btEditar.innerHTML = "edit";
        btCancelar.innerHTML = "";
        btDeletar.innerHTML = "delete";

        btEditar.setAttribute("onclick", "editarTarefa(this.id)");
    }
}

const editarTarefaAPI = async (id, descricao) => {
    const tarefaEditada = new Parse.Object("Tarefa");

    tarefaEditada.set("objectId", id);
    tarefaEditada.set("descricao", descricao);

    try {
        let result = await tarefaEditada.save();
        console.log("Descrição do objeto de ID \'" + result.id + "\' atualizada com sucesso.");
    } catch (error) {
        console.error("Falha ao atualizar objeto. Erro de código: " + error);
    }
}

btAddTarefa.onclick = addTarefa;
pullTarefas();