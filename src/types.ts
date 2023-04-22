export interface ImageData {
  url: string;
  data: number[];
  type: string;
}

export interface NotionData {
  title: string;
  imageUrl: string;
  prompt: string;
  url: string;
}

export interface ExtractImageActionData {
  action: string;
  image: ImageData;
}

export interface SaveToNotionActionData {
  action: string;
  data: NotionData;
}

export interface ExtensionOptions {
  apiKey: string;
  databaseId: string;
}