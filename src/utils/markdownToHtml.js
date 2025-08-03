export function markdownToHtml(markdown) {
  console.log("markdownToHtml: Input Markdown:", markdown)
  
  // First, normalize the markdown by identifying structural vs intentional spacing
  let normalizedMarkdown = markdown
    .replace(/^(#{1,3}\s+.+)\n\n(?=\S)/gm, '$1\n__STRUCTURAL_BREAK__\n')
    .replace(/^(#{1,3}\s+.+)\n\n\n+/gm, (match, heading) => {
      const extraNewlines = match.length - heading.length - 2
      return heading + '\n__STRUCTURAL_BREAK__\n' + '\n'.repeat(extraNewlines - 1)
    })
  
  console.log("markdownToHtml: Normalized Markdown:", normalizedMarkdown)
  
  const htmlOutput = []
  const lines = normalizedMarkdown.split("\n")
  let inBulletList = false
  let inNumberedList = false
  let consecutiveBlankLines = 0

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    const trimmedLine = line.trim()

    // Handle structural breaks
    if (line === '__STRUCTURAL_BREAK__') {
      consecutiveBlankLines = 0
      continue
    }

    // Handle bold and italic first
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>")

    if (trimmedLine === "") {
      consecutiveBlankLines++
      continue
    }

    // Close lists if we encounter a non-list item
    if ((inBulletList || inNumberedList) && !trimmedLine.startsWith("- ") && !trimmedLine.match(/^\d+\.\s/)) {
      if (inBulletList) {
        htmlOutput.push("</ul>")
        inBulletList = false
      }
      if (inNumberedList) {
        htmlOutput.push("</ol>")
        inNumberedList = false
      }
    }

    // Add user-intentional blank lines
    if (consecutiveBlankLines > 0) {
      for (let j = 0; j < consecutiveBlankLines; j++) {
        htmlOutput.push("<p><br></p>")
      }
    }
    consecutiveBlankLines = 0

    // Process the current line
    if (trimmedLine.startsWith("- ")) {
      // Bullet list
      if (inNumberedList) {
        htmlOutput.push("</ol>")
        inNumberedList = false
      }
      if (!inBulletList) {
        htmlOutput.push("<ul>")
        inBulletList = true
      }
      const content = line.substring(line.indexOf("- ") + 2)
      htmlOutput.push(`<li>${content}</li>`)
    } else if (trimmedLine.match(/^\d+\.\s/)) {
      // Numbered list
      if (inBulletList) {
        htmlOutput.push("</ul>")
        inBulletList = false
      }
      if (!inNumberedList) {
        htmlOutput.push("<ol>")
        inNumberedList = true
      }
      const content = line.substring(line.indexOf(". ") + 2)
      htmlOutput.push(`<li>${content}</li>`)
    } else if (line.startsWith("# ")) {
      htmlOutput.push(`<h1>${line.substring(2)}</h1>`)
    } else if (line.startsWith("## ")) {
      htmlOutput.push(`<h2>${line.substring(3)}</h2>`)
    } else if (line.startsWith("### ")) {
      htmlOutput.push(`<h3>${line.substring(4)}</h3>`)
    } else {
      // Regular paragraph
      htmlOutput.push(`<p>${line}</p>`)
    }
  }

  // Close any open lists at the end
  if (inBulletList) {
    htmlOutput.push("</ul>")
  }
  if (inNumberedList) {
    htmlOutput.push("</ol>")
  }

  let finalHtml = htmlOutput.join("")

  // Remove only truly empty paragraphs
  finalHtml = finalHtml.replace(/<p>\s*<\/p>/g, "")

  // Handle edge case where content might be a single line
  if (
    !finalHtml.includes("<p>") &&
    !finalHtml.includes("<h1") &&
    !finalHtml.includes("<h2") &&
    !finalHtml.includes("<h3") &&
    !finalHtml.includes("<ul>") &&
    !finalHtml.includes("<ol>") &&
    finalHtml.trim()
  ) {
    finalHtml = `<p>${finalHtml}</p>`
  }

  console.log("markdownToHtml: Output HTML:", finalHtml)
  return finalHtml
}