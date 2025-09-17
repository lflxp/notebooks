import "@blocknote/core/fonts/inter.css";
import { 
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
  SuggestionMenuController, 
  GridSuggestionMenuController
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import * as Button from "@/components/ui/button"
import * as Select from "@/components/ui/select"
import { useState } from "react";
import "./styles.css";
import { 
  // Block,
  BlockNoteSchema,
  defaultInlineContentSpecs,
  filterSuggestionItems
} from "@blocknote/core";
import { Mention } from "./mention";
import { ScrollArea } from "@/components/ui/scroll-area"
import { pb } from '@/lib/pocketbase';
import { toast } from "sonner"

// Our schema with inline content specs, which contain the configs and
// implementations for inline content  that we want our editor to use.
const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    // Adds all default inline content.
    ...defaultInlineContentSpecs,
    // Adds the mention tag.
    mention: Mention,
  },
});
// Function which gets all users for the mentions menu.
const getMentionMenuItems = (
  editor: typeof schema.BlockNoteEditor,
): DefaultReactSuggestionItem[] => {
  // TODO: 前后端联动 获取当前用户数据
  const users = ["Steve", "Bob", "Joe", "Mike"];
  return users.map((user) => ({
    title: user,
    onItemClick: () => {
      editor.insertInlineContent([
        {
          type: "mention",
          props: {
            user,
          },
        },
        " ", // add a space after the mention
      ]);
    },
  }));
};

export type NoteProps = {
  noteId?: string;
  content?: any[];
  fetchTodo?: () => void;
};

export default function Note({ noteId, content }: NoteProps) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: content && content.length > 0 ? content : [
      {
        type: "paragraph",
        content: "Welcome to this demo!",
      },
      {
        type: "paragraph",
        content: [
          {
            type: "mention",
            props: {
              user: "Steve",
            },
          },
          {
            type: "text",
            text: " <- This is an example mention",
            styles: {},
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Press the '@' key to open the mentions menu and add another",
            styles: {},
          },
        ],
      },
      {
        type: "paragraph",
        content: [],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Press the ':' key to open the Emoji Picker",
            styles: {},
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "There are now 5 columns instead of 10",
            styles: {},
          },
        ],
      },
    ],
  });

  // // 内容变化时回调
  // const handleChange = async () => {
  //   const md = await editor.blocksToMarkdownLossy(editor.document);
  //   // setMarkdown(md);
  //   // setBlocks(editor.document);
  //   onChange?.(md, editor.document);
  // };

  const [number, setNumber] = useState(0);

  const updateNoteContent = async (noteId: string, content: any[]) => {
    try {
      setNumber((prev) => prev + 1);
      const updatedData = {
        content: content,
      };
      await pb.collection('notebook').update(noteId, updatedData);
      toast.success('输入: ' + number + ' 个字符，自动保存。（继续努力哟）', { position: 'top-right' });
    } catch (error) {
      toast.error('Error updating note ' + noteId + ': ' + error, { position: 'top-right' });
    }
  }

  // const fetchTodo = async (noteId: string) => {
  //   try {
  //     const record = await pb.collection('notebook').getOne(noteId);
  //     console.log('Fetched note:', record);
  //     return record;
  //   } catch (error) {
  //     console.error('Error fetching note:', error);
  //     return null;
  //   }
  // };


  // Renders the editor instance using a React component.
  return (
    <ScrollArea className="h-[69vh] w-full rounded-md flex-1 p-0">
      <div className="min-h-[calc(100%-4rem)] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none text-base leading-relaxed">
        <div className="wrapper w-full">
          <div
            className="item w-full bordered p-0 bg-white rounded shadow"
          >
            <BlockNoteView
              editor={editor}
              emojiPicker={false}
              onChange={async (editorInstance) => {
                if (noteId) {
                  const content = editorInstance.document;
                  await updateNoteContent(noteId, content);
                }
              }}
              shadCNComponents={{
                Select,
                Button,
              }}
            >
              {/* Adds a mentions menu which opens with the "@" key */}
              <GridSuggestionMenuController
                triggerCharacter={":"}
                columns={5}
                minQueryLength={2}
              />
              <SuggestionMenuController
                triggerCharacter={"@"}
                getItems={async (query) =>
                  filterSuggestionItems(getMentionMenuItems(editor), query)
                }
              />
            </BlockNoteView>
          </div>
          {/* <div className={"item bordered"}>
            <pre>
              <code>{markdown}</code>
            </pre>
          </div> */}
          {/* <div>Document JSON:</div> */}
            {/* <div className={"item bordered"}>
              <pre>
                <code>{JSON.stringify(blocks, null, 2)}</code>
              </pre>
            </div> */}
          </div>
      </div>
    </ScrollArea>
  )
}
