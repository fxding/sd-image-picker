import { NotionAPI } from "./libs";
import { ExtensionOptions, ExtractImageActionData, NotionData, SaveToNotionActionData } from "./types";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "image-pick",
    title: "Save to Notion",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "image-pick" || !tab?.id || !info.srcUrl) {
    return;
  }
  const response = await fetch(info.srcUrl);
  const blob = await response.blob();
  chrome.tabs.sendMessage<ExtractImageActionData>(tab.id, {
    action: "extractMetadata",
    image: {
      url: info.srcUrl,
      data: Array.from(new Uint8Array(await blob.arrayBuffer())),
      type: blob.type,
    },
  });
});

chrome.runtime.onMessage.addListener(async (message: SaveToNotionActionData, sender, sendResponse) => {
  if (message.action !== 'saveToNotion' || !message.data) {
    console.error("Error: request.data is undefined.");
    sendResponse({ message: "Error: request.data is undefined." });
    return;
  }
  await saveToNotion(message.data).catch((error) => {
    console.error("Error saving to Notion.");
    console.error(error);
    sendResponse({ message: "Error saving to Notion.", error });
  });
  sendResponse({ message: "Data saved successfully" });
});

function getNotionSettings(): Promise<[string, string]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(["notionApiKey", "notionDatabaseId"], (result) => {
      resolve([result.notionApiKey, result.notionDatabaseId]);
    });
  });
}

async function saveToNotion(payload: NotionData) {
  const [apiKey, databaseId] = await getNotionSettings();
  if (!apiKey || !databaseId) {
    throw new Error("Missing Notion API key or Database ID in settings.");
  }

  const options: ExtensionOptions = { apiKey, databaseId };

  let response = await NotionAPI.createNewPage(options, payload);
  if (!response.ok) {
    const error = await response.json();
    console.error("Error creating new page in Notion:", error);
    throw new Error(`Error creating new page in Notion. ${JSON.stringify(error)}`);
  }

  const newPage = await response.json();
  response = await NotionAPI.appendImageBlock(options, newPage.id, payload);
  if (!response.ok) {
    const error = await response.json();
    console.error("Error appending child block to Notion page:", error);
    throw new Error(`Error appending child block to Notion page. ${JSON.stringify(error)}`);
  } else {
    console.log("Appended child block to Notion page successfully!");
  }
}
