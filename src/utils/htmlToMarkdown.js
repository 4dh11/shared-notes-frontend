export function htmlToMarkdown(html) {
  console.log("htmlToMarkdown: Input HTML:", html)
  let markdown = html

  // Step 1: Replace <br> tags with a single newline.
  markdown = markdown.replace(/<br\s*\/?>/gi, "\n")
  console.log("htmlToMarkdown: After <br> replacement:", markdown)

  // Step 2: Convert block-level elements to their content followed by a newline.
  // Use a temporary placeholder for newlines from block elements to avoid premature collapsing.
  // Ensure empty blocks also contribute a newline.
  markdown = markdown.replace(/<div>(.*?)<\/div>/gi, (match, p1) => {
    return p1.trim() === "" ? "__BLOCK_NEWLINE__" : `${p1}__BLOCK_NEWLINE__`
  })
  console.log("htmlToMarkdown: After <div> replacement:", markdown)
  markdown = markdown.replace(/<p>(.*?)<\/p>/gi, (match, p1) => {
    return p1.trim() === "" ? "__BLOCK_NEWLINE__" : `${p1}__BLOCK_NEWLINE__`
  })
  console.log("htmlToMarkdown: After <p> replacement:", markdown)

  // Step 3: Convert headings - ensure proper spacing (now that block elements are normalized)
  // Headings should be followed by two newlines to create a paragraph break in Markdown
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n")
  console.log("htmlToMarkdown: After headings replacement:", markdown)

  // Step 4: Convert bold and italic (inline elements)
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
  markdown = markdown.replace(/<b>(.*?)<\/b>/gi, "**$1**")
  markdown = markdown.replace(/<em>(.*?)<\/em>/gi, "*$1*")
  markdown = markdown.replace(/<i>(.*?)<\/i>/gi, "*$1*")
  console.log("htmlToMarkdown: After inline formatting:", markdown)

  // Step 5: Convert list items (order matters: remove checkboxes, then handle lists)
  // Convert numbered list items first
  markdown = markdown.replace(/<li>([\s\S]*?)<\/li>/gi, (match, content) => {
    // Check if this li is inside an ol by looking at surrounding context
    // This is a simplified approach - in a real parser you'd track the parent
    const isInOrderedList = markdown.indexOf('<ol>') !== -1 && 
                           markdown.indexOf(match) > markdown.lastIndexOf('<ol>') &&
                           (markdown.indexOf('</ol>') === -1 || markdown.indexOf(match) < markdown.indexOf('</ol>'))
    
    if (isInOrderedList) {
      return `1. ${content}\n`
    } else {
      return `- ${content}\n`
    }
  })
  console.log("htmlToMarkdown: After list items replacement:", markdown)

  // Step 6: Remove ul and ol tags (they are implied by list items)
  markdown = markdown.replace(/<ul>/gi, "")
  markdown = markdown.replace(/<\/ul>/gi, "")
  markdown = markdown.replace(/<ol>/gi, "")
  markdown = markdown.replace(/<\/ol>/gi, "")
  console.log("htmlToMarkdown: After list tag removal:", markdown)

  // Step 7: Strip any remaining HTML tags (e.g., from contenteditable quirks)
  markdown = markdown.replace(/<[^>]*>/g, "")
  console.log("htmlToMarkdown: After final HTML stripping:", markdown)

  // Step 8: Decode HTML entities (e.g., &nbsp; to space)
  markdown = markdown.replace(/&nbsp;/g, " ")
  markdown = markdown.replace(/&amp;/g, "&")
  markdown = markdown.replace(/&lt;/g, "<")
  markdown = markdown.replace(/&gt;/g, ">")
  console.log("htmlToMarkdown: After HTML entity decoding:", markdown)

  // Step 9: Replace our block newline placeholder with actual newlines
  // This will now correctly represent multiple blank lines from empty <p> or <div>
  markdown = markdown.replace(/__BLOCK_NEWLINE__/g, "\n")
  console.log("htmlToMarkdown: After block newline placeholder replacement:", markdown)

  // Step 10: Trim leading/trailing whitespace and newlines from the entire document
  const finalMarkdown = markdown.trim()
  console.log("htmlToMarkdown: Final Markdown (after trim):", finalMarkdown)

  return finalMarkdown
}