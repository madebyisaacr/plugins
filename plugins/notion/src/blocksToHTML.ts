import { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints"
import { assert } from "./utils"

export function richTextToHTML(texts: RichTextItemResponse[]) {
    return texts
        .map(({ plain_text, annotations, href }) => {
            let html = plain_text

            // Apply formatting based on annotations
            if (annotations.bold) {
                html = `<strong>${html}</strong>`
            }
            if (annotations.italic) {
                html = `<em>${html}</em>`
            }
            if (annotations.strikethrough) {
                html = `<del>${html}</del>`
            }
            if (annotations.underline) {
                html = `<u>${html}</u>`
            }

            if (annotations.code) {
                html = `<code>${html}</code>`
            }

            if (annotations.color !== "default") {
                const color = annotations.color.replace("_", "")
                html = `<span style="color:${color}">${html}</span>`
            }

            if (href) {
                html = `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`
            }

            return html
        })
        .join("")
}

export function blocksToHtml(blocks: BlockObjectResponse[]) {
    let htmlContent = ""

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        assert(block)

        switch (block.type) {
            case "paragraph":
                htmlContent += `<p>${richTextToHTML(block.paragraph.rich_text)}</p>`
                break
            case "heading_1":
                htmlContent += `<h1>${richTextToHTML(block.heading_1.rich_text)}</h1>`
                break
            case "heading_2":
                htmlContent += `<h2>${richTextToHTML(block.heading_2.rich_text)}</h2>`
                break
            case "heading_3":
                htmlContent += `<h3>${richTextToHTML(block.heading_3.rich_text)}</h3>`
                break
            case "divider":
                htmlContent += "<hr >"
                break
            case "image":
                switch (block.image.type) {
                    case "external":
                        htmlContent += `<img src="${block.image.external.url}" alt="${block.image.caption[0]?.plain_text}" />`
                        break
                    case "file":
                        htmlContent += `<img src="${block.image.file.url}" alt="${block.image.caption[0]?.plain_text}" />`
                        break
                }
                break
            case "bulleted_list_item":
            case "numbered_list_item": {
                const tag = block.type === "bulleted_list_item" ? "ul" : "ol"

                // Start the list if it's the first item of its type or the previous item isn't a list of the same type
                if (i === 0 || blocks[i - 1].type !== block.type) htmlContent += `<${tag}>`

                if (block.type === "bulleted_list_item") {
                    htmlContent += `<li>${richTextToHTML(block.bulleted_list_item.rich_text)}</li>`
                } else {
                    // Add the list item
                    htmlContent += `<li>${richTextToHTML(block.numbered_list_item.rich_text)}</li>`
                }

                // If next block is not the same type, close the list
                if (i === blocks.length - 1 || blocks[i + 1].type !== block.type) {
                    htmlContent += `</${tag}>`
                }
                break
            }
            case "code":
                htmlContent += `<pre data-language="${
                    CODE_LANGUAGE_MAPPING[block.code.language] || "JavaScript"
                }"><code>${richTextToHTML(block.code.rich_text)}</code></pre>`
                break
            case "quote":
                htmlContent += `<blockquote>${richTextToHTML(block.quote.rich_text)}</blockquote>`
                break
            case "video":
                if (block.video.type === "external") {
                    const url = block.video.external.url
                    if (url && (url.includes("youtube.com") || url.includes("youtu.be"))) {
                        try {
                            const urlObj = new URL(url)
                            let videoId = ""

                            if (urlObj.hostname === "youtube.com" || urlObj.hostname === "www.youtube.com") {
                                videoId = urlObj.searchParams.get("v") || ""
                            } else if (urlObj.hostname === "youtu.be") {
                                videoId = urlObj.pathname.slice(1)
                            }

                            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
                                const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(
                                    videoId
                                )}?controls=0&autoplay=0&loop=0&mute=1`
                                htmlContent += `<iframe src="${embedUrl}"></iframe>`
                            }
                        } catch (error) {
                            console.warn("Invalid YouTube URL:", url)
                        }
                    }
                }
                break
            default:
                // TODO: More block types can be added here!
                break
        }
    }

    return htmlContent
}

const CODE_LANGUAGE_MAPPING = {
    abap: null,
    arduino: null,
    bash: "Shell",
    basic: null,
    c: "C",
    clojure: null,
    coffeescript: null,
    "c++": "C++",
    "c#": "C#",
    css: "CSS",
    dart: null,
    diff: null,
    docker: null,
    elixir: null,
    elm: null,
    erlang: null,
    flow: null,
    fortran: null,
    "f#": null,
    gherkin: null,
    glsl: null,
    go: "Go",
    graphql: null,
    groovy: null,
    haskell: "Haskell",
    html: "HTML",
    java: "Java",
    javascript: "JSX",
    json: null,
    julia: "Julia",
    kotlin: "Kotlin",
    latex: null,
    less: "Less",
    lisp: null,
    livescript: null,
    lua: "Lua",
    makefile: null,
    markdown: "Markdown",
    markup: null,
    matlab: "MATLAB",
    mermaid: null,
    nix: null,
    "objective-c": "Objective-C",
    ocaml: null,
    pascal: null,
    perl: "Perl",
    php: "PHP",
    "plain text": null,
    powershell: null,
    prolog: null,
    protobuf: null,
    python: "Python",
    r: null,
    reason: null,
    ruby: "Ruby",
    rust: "Rust",
    sass: null,
    scala: "Scala",
    scheme: null,
    scss: "SCSS",
    shell: "Shell",
    sql: "SQL",
    swift: "Swift",
    typescript: "TSX",
    "vb.net": null,
    verilog: null,
    vhdl: null,
    "visual basic": null,
    webassembly: null,
    xml: null,
    yaml: "YAML",
    "java/c/c++/c#": null,
}
