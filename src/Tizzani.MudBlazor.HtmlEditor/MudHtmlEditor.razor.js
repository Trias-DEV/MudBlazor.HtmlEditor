var Embed = Quill.import('blots/block/embed');
const Inline = Quill.import('blots/inline');

class NobrBlot extends Inline {
    static blotName = 'nobr';
    static tagName = 'nobr';

    static create() {
        let node = super.create();
        node.setAttribute('style', 'border: 1px dashed black;');
        return node;
    }
}

class Divider extends Embed {
    static create(value) {
        let node = super.create(value);
        node.setAttribute('style', "height: 0px; margin-top: 0.5em 0; border-width; 1px; border-style: solid none none none;");
        return node;
    }
}

Divider.blotName = 'hr';
Divider.tagName = 'hr';
Quill.register(Divider, true);

Quill.register(NobrBlot);

if (typeof QuillBlotFormatter !== 'undefined') {
    Quill.register('modules/blotFormatter', QuillBlotFormatter.default);
}

export function createQuillInterop(dotNetRef, editorRef, toolbarRef, placeholder, toolbarOptions, formats) {
    if (!editorRef || !editorRef.isConnected) {
        throw new Error('Editor DOM element disconnected.');
    }

    if (!toolbarOptions && (!toolbarRef || !toolbarRef.isConnected)) {
        throw new Error('Toolbar DOM element disconnected.');
    }

    const toolbar = toolbarOptions == null
        ? {
            container: toolbarRef
        }
        : toolbarOptions;

    const modulesConfig = {
        toolbar: toolbar
    };

    if (typeof QuillBlotFormatter !== 'undefined') {
        modulesConfig.blotFormatter = {};
    }
    
    // if (formats) {
    //     modulesConfig.formats = formats;
    // }

    var quill = new Quill(editorRef, {
        modules: modulesConfig,
        placeholder: placeholder,
        formats: formats,
        theme: 'snow'
    });
    return new MudQuillInterop(dotNetRef, quill, editorRef, toolbarRef);
}

export class MudQuillInterop {
    /**
     * @param {Quill} quill
     * @param {Element} editorRef
     * @param {Element} toolbarRef
     */
    constructor(dotNetRef, quill, editorRef, toolbarRef) {
        quill.getModule('toolbar').addHandler('hr', this.insertDividerHandler);
        quill.on('text-change', this.textChangedHandler);
        this.dotNetRef = dotNetRef;
        this.quill = quill;
        this.editorRef = editorRef;
        this.toolbarRef = toolbarRef;
    }

    getText = () => {
        return this.quill.getText();
    };

    getContents = () => {
        return this.quill.getContents();
    };

    getHtml = () => {
        return this.quill.root.innerHTML;
    };

    setHtml = (html) => {
        this.quill.root.innerHTML = html;
    }

    insertDividerHandler = () => {
        const range = this.quill.getSelection();

        if (range) {
            this.quill.insertEmbed(range.index, "hr", "null");
        }
    };

    /**
     *
     * @param {Delta} delta
     * @param {Delta} oldDelta
     * @param {any} source
     */
    textChangedHandler = (delta, oldDelta, source) => {
        this.dotNetRef.invokeMethodAsync('HandleHtmlContentChanged', this.getHtml());
        this.dotNetRef.invokeMethodAsync('HandleTextContentChanged', this.getText());
        this.dotNetRef.invokeMethodAsync('HandleContentsChanged', this.getContents());
    };
}
