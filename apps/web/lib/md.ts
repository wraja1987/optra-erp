export function convertBasicMarkdownToHtml(markdownSource: string): string {
  const lines: string[] = markdownSource.split(/\r?\n/);
  const htmlParts: string[] = [];
  let isInList: boolean = false;

  function escapeHtml(raw: string): string {
    return raw
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function closeListIfOpen(): void {
    if (isInList) {
      htmlParts.push("</ul>");
      isInList = false;
    }
  }

  for (const line of lines) {
    if (/^\s*$/.test(line)) {
      closeListIfOpen();
      continue;
    }

    if (line.startsWith("### ")) {
      closeListIfOpen();
      htmlParts.push(`<h3>${escapeHtml(line.substring(4).trim())}</h3>`);
      continue;
    }

    if (line.startsWith("## ")) {
      closeListIfOpen();
      htmlParts.push(`<h2>${escapeHtml(line.substring(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith("# ")) {
      closeListIfOpen();
      htmlParts.push(`<h1>${escapeHtml(line.substring(2).trim())}</h1>`);
      continue;
    }

    if (line.startsWith("- ")) {
      if (!isInList) {
        htmlParts.push("<ul>");
        isInList = true;
      }
      const itemText: string = line.substring(2).trim();
      htmlParts.push(`<li>${escapeHtml(itemText)}</li>`);
      continue;
    }

    // Fallback to paragraph
    closeListIfOpen();
    htmlParts.push(`<p>${escapeHtml(line)}</p>`);
  }

  closeListIfOpen();
  return htmlParts.join("\n");
}


