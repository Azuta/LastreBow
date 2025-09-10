"use client";

// --- IMPORTACIONES ---
// Componentes y hooks principales de Tiptap para React
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';

// El kit de inicio con las extensiones más comunes
import StarterKit from '@tiptap/starter-kit';

// Extensiones específicas que añaden funcionalidades
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

// Utilidades de React y Supabase
import { useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';

// Nuestra extensión personalizada para spoilers
import { Spoiler } from './Spoiler';

// --- ICONOS PARA LA UI DEL EDITOR ---
const EditorIcons = {
    bold: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15.6 10.79c.97.67 1.65 1.77 1.65 2.91 0 2.21-1.79 4-4 4H7.5v-10h5.5c2.21 0 4 1.79 4 4 0 .79-.24 1.51-.65 2.1zM10 9.5v2h3.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H10zm0 3.5v2.5h4c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H10z" fill="currentColor"/></svg>,
    italic: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" fill="currentColor"/></svg>,
    underline: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" fill="currentColor"/></svg>,
    strike: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 10h6v2H9zM3 4v3h5v3h8V7h5V4zM4 14h16v-2H4z" fill="currentColor"/></svg>,
    h2: () => <span className="font-bold">H2</span>,
    h3: () => <span className="font-bold">H3</span>,
    bulletList: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M7.5 12.5a1.5 1.5 0 010-3 1.5 1.5 0 010 3zm0 5.5a1.5 1.5 0 010-3 1.5 1.5 0 010 3zm0-11a1.5 1.5 0 010-3 1.5 1.5 0 010 3zm4-2.5h10V9h-10zm0 5.5h10v2h-10zm0 5.5h10v2h-10z" fill="currentColor"/></svg>,
    blockquote: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" fill="currentColor"/></svg>,
    spoiler: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M11.5 12c0-1.38 1.12-2.5 2.5-2.5.54 0 1.04.17 1.45.45l-3.95 3.95c-.28-.41-.45-.91-.45-1.45zm5 5.5c-.54 0-1.04-.17-1.45-.45l3.95-3.95c.28.41.45.91.45 1.45 0 1.38-1.12 2.5-2.5 2.5zM12 4C7 4 2.73 7.11 1 11.5c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zM2.52 11.5c1.43-2.97 4.5-5 9.48-5s8.05 2.03 9.48 5c-1.43 2.97-4.5 5-9.48 5s-8.05-2.03-9.48-5zm17.92 4.09L5.35 2.52C6.79 2.19 8.35 2 10 2c2.76 0 5.26.89 7.31 2.45l-1.93 1.93c-.53-.16-1.1-.25-1.71-.25-2.76 0-5 2.24-5 5 0 .61.09 1.18.25 1.71l-1.93 1.93C6.89 16.74 9.39 18 12 18c1.65 0 3.21-.19 4.65-.52z" fill="currentColor"/></svg>,
    image: () => <svg viewBox="0 0 24 24" width="18" height="18"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z" fill="currentColor"/></svg>,
};


// --- COMPONENTE DE LA BARRA DE HERRAMIENTAS ---
const Toolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const supabase = createClient();
        const filePath = `review-images/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('review-images').upload(filePath, file);
        if (uploadError) {
            console.error('Error al subir la imagen:', uploadError);
            alert('Error al subir la imagen.');
            return;
        }
        const { data: { publicUrl } } = supabase.storage.from('review-images').getPublicUrl(filePath);
        if (publicUrl) {
            editor.chain().focus().setImage({ src: publicUrl }).run();
        }
    }, [editor]);

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[#2b2d42] rounded-t-lg border-b border-gray-600 text-sm text-white">
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.bold /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.italic /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.underline /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.strike /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.h2 /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.h3 /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.bulletList /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.blockquote /></button>
            <button type="button" onClick={() => editor.chain().focus().toggleSpoiler().run()} className={editor.isActive('spoiler') ? 'bg-yellow-500 text-black p-2 rounded' : 'p-2 hover:bg-gray-700 rounded'}><EditorIcons.spoiler /></button>
            <label className="p-2 cursor-pointer hover:bg-gray-700 rounded"><EditorIcons.image /><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DEL EDITOR ---
interface TiptapEditorProps {
    content: string;
    onChange: (richText: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Image.configure({ inline: false, HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' } }),
            Link.configure({ openOnClick: false, autolink: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: 'Comienza a escribir tu increíble reseña aquí...' }),
            Spoiler,
            // BubbleMenu, // <-- ESTA LÍNEA ERA EL ERROR Y HA SIDO ELIMINADA
        ],
        content: content,
        onUpdate: ({ editor }) => { onChange(editor.getHTML()); },
        editorProps: {
            attributes: { class: 'prose prose-invert min-h-[300px] max-w-none p-4 focus:outline-none' },
        },
    });

    return (
        <div className="bg-gray-800/50 rounded-lg border border-gray-600">
            {editor && (
                <BubbleMenu 
                    editor={editor} 
                    tippyOptions={{ duration: 100 }}
                    className="flex items-center gap-1 p-1 bg-[#2b2d42] rounded-lg border border-gray-600"
                >
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 text-white hover:bg-gray-700 rounded'}><EditorIcons.bold /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 text-white hover:bg-gray-700 rounded'}><EditorIcons.italic /></button>
                    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-[#ffbade] text-black p-2 rounded' : 'p-2 text-white hover:bg-gray-700 rounded'}><EditorIcons.strike /></button>
                </BubbleMenu>
            )}
            
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;

