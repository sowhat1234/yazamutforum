"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote,
  Undo,
  Redo,
  X,
  Plus,
  Users,
  Tag as TagIcon
} from "lucide-react";

import { api } from "~/trpc/react";

interface IdeaFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export function IdeaForm({ onClose, onSuccess }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [wantsTeam, setWantsTeam] = useState(false);
  const [neededSkills, setNeededSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Describe your idea in detail. What problem does it solve? Who is the target audience? What makes it unique?",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] max-w-none",
      },
    },
  });

  const utils = api.useUtils();
  const createIdea = api.idea.create.useMutation({
    onSuccess: () => {
      void utils.idea.getAll.invalidate();
      onSuccess?.();
      // Reset form
      setTitle("");
      setCategory("");
      setTags([]);
      setTagInput("");
      setWantsTeam(false);
      setNeededSkills([]);
      setSkillInput("");
      editor?.commands.clearContent();
    },
  });

  const categories = [
    { value: "SAAS", label: "SaaS" },
    { value: "MOBILE_APP", label: "Mobile App" },
    { value: "WEB_APP", label: "Web App" },
    { value: "HARDWARE", label: "Hardware" },
    { value: "SERVICE", label: "Service" },
    { value: "OTHER", label: "Other" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !category || !editor?.getHTML()) {
      return;
    }

    createIdea.mutate({
      title: title.trim(),
      description: editor.getHTML(),
      category: category as "SAAS" | "MOBILE_APP" | "WEB_APP" | "HARDWARE" | "SERVICE" | "OTHER",
      tags,
      wantsTeam,
      neededSkills,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSkill = () => {
    if (skillInput.trim() && !neededSkills.includes(skillInput.trim()) && neededSkills.length < 8) {
      setNeededSkills([...neededSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setNeededSkills(neededSkills.filter(skill => skill !== skillToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Share Your Idea</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Idea Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title for your idea"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
            required
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description with Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          
          {/* Editor Toolbar */}
          <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("bulletList") ? "bg-gray-200" : ""
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("orderedList") ? "bg-gray-200" : ""
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                editor.isActive("blockquote") ? "bg-gray-200" : ""
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Undo"
              disabled={!editor.can().undo()}
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              className="p-2 rounded hover:bg-gray-200 transition-colors"
              title="Redo"
              disabled={!editor.can().redo()}
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Editor Content */}
          <div className="border border-gray-300 border-t-0 rounded-b-lg p-4 min-h-[200px] bg-white">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Add up to 5 tags to help others discover your idea</p>
        </div>

        {/* Team Formation */}
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-orange-600" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={wantsTeam}
                onChange={(e) => setWantsTeam(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <span className="font-medium text-orange-900">I want to build this with a team</span>
            </label>
          </div>
          
          {wantsTeam && (
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-2">
                Skills needed for the team
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {neededSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-orange-300 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              {neededSkills.length < 8 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a needed skill"
                    className="flex-1 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    maxLength={30}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              <p className="text-sm text-orange-700 mt-1">
                Specify skills you need teammates to have (up to 8 skills)
              </p>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={createIdea.isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createIdea.isPending || !title.trim() || !category || !editor.getHTML()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createIdea.isPending ? "Publishing..." : "Publish Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
