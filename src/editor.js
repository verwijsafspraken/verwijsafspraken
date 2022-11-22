import {EditorView, keymap} from "@codemirror/view";
import {json} from "@codemirror/lang-json";
import {EditorState} from "@codemirror/state"
import {indentWithTab} from "@codemirror/commands"
import {basicSetup} from "codemirror";
import { oneDark } from '@codemirror/theme-one-dark';
import { EditModal } from "./modals.js";
import { renderEditorModal } from "./rendering.js";

let state, database, path, processDatabase;

export function notifyEditor(db, page, p, pd) {
    database = db;
    path = p;
    processDatabase = pd;
    state = EditorState.create({
        doc: JSON.stringify(stripNode(page), null, 2),
        extensions: [
            basicSetup,
            oneDark,
            EditorView.lineWrapping,
            keymap.of([
                indentWithTab
            ]),
            json()
        ]
    });
}

export function openEditor() {
    new EditModal(renderEditorModal()).open();

    const editor = new EditorView({
        lineWrapping: true,
        state,
        parent: document.querySelector('#editor')
    });

    document.querySelector('#editor-save').addEventListener('click', () => {
        let content;
        try {
            content = JSON.parse(editor.state.doc.toString());
        } catch(e) {
            return alert("Could not parse JSON: " + e.toString());
        }

        Object.assign(findItem(), content);
        processDatabase(database);
    });

    document.querySelector('#editor-download').addEventListener('click', () => {
        download('database.json', JSON.stringify(stripDatabase(database), null, 2));
    });
    
}

function stripNode({ url, path, parent, children, ...node }) {
    return node;
}

function stripDatabase({ url, path, parent, children, ...node }) {
    return {
        ...node,
        children: children?.map(stripDatabase)
    };
}

function findItem() {
    return path.reduce((page, segment) =>
        page?.children?.find(child => child.id?.toString() === segment)
    , database);
}

function download(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
