import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

function extractDatabaseIdFromPageLink(pageLink: string) {
  const regex = /([a-f0-9]{32})/;
  const match = pageLink.match(regex);

  if (match) {
    return match[0];
  }
  return "";
}

const Options = () => {
  const [notionApiKey, setNotionApiKey] = useState<string>("");
  const [notionPageLink, setNotionPageLink] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get(["notionApiKey", "notionPageLink"], (items) => {
      setNotionApiKey(items.notionApiKey);
      setNotionPageLink(items.notionPageLink);
    });
  }, []);

  const saveOptions = () => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        notionApiKey,
        notionPageLink,
        notionDatabaseId: extractDatabaseIdFromPageLink(notionPageLink),
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        const id = setTimeout(() => {
          setStatus("");
        }, 1000);
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <>
      <div className="options-title">Notion Options</div>
      <hr />
      <div className="form-control">
        <label>Notion API Key:</label>
        <input
          type="text"
          value={notionApiKey}
          onChange={(event) => setNotionApiKey(event.target.value)}
        />
      </div>
      <div className="form-control">
        <label>Notion Page Link:</label>
        <input
          type="text"
          value={notionPageLink}
          onChange={(event) => setNotionPageLink(event.target.value)}
        />
      </div>
      <div>{status}</div>
      <button className="save-options-btn" onClick={saveOptions}>
        Save
      </button>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
