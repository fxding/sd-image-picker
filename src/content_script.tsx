// @ts-ignore
import exifr from "exifr";
import {
  ExtractImageActionData,
  NotionData,
  SaveToNotionActionData,
} from "./types";

async function handleSaveToNotion({ image }: ExtractImageActionData) {
  const imageData = new Blob([new Uint8Array(image.data)], {
    type: image.type,
  });
  try {
    const metadata = await exifr.parse(imageData);
    const notionPayload: NotionData = {
      imageUrl: image.url,
      prompt: metadata.parameters,
      url: location.href,
      title: document.title,
    };
    chrome.runtime.sendMessage<SaveToNotionActionData>(
      { action: "saveToNotion", data: notionPayload },
      (res) => {
        console.log(res);
      }
    );
  } catch (error) {
    console.error("Unable to handle image");
  }
}

chrome.runtime.onMessage.addListener(
  async (message: ExtractImageActionData, sender, sendResponse) => {
    if (message.action !== "extractMetadata") {
      return;
    }
    await handleSaveToNotion(message);
  }
);
