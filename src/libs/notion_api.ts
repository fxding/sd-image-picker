import { ExtensionOptions, NotionData } from "../types";

function createNotionRecord(databaseId: string, payload: NotionData) {
  return {
    parent: {
      database_id: databaseId,
    },
    properties: {
      WebLink: {
        title: [
          {
            text: {
              content: payload.title,
            },
          },
        ],
      },
      Prompt: {
        rich_text: [
          {
            text: {
              content: payload.prompt,
            },
          },
        ],
      },
      Image: {
        url: payload.imageUrl,
      },
      PageURL: {
        url: payload.url,
      },
    },
  };
}

export async function createNewPage(options: ExtensionOptions, payload: NotionData) {
  const record = createNotionRecord(options.databaseId, payload)
  return fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(record),
  });
}

export function appendImageBlock(options: ExtensionOptions, pageId: string, payload: NotionData) {
  const imageBlock = {
    object: "block",
    type: "image",
    image: {
      type: "external",
      external: {
        url: payload.imageUrl,
      },
    },
  };

  return fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      children: [imageBlock],
    }),
  });
}