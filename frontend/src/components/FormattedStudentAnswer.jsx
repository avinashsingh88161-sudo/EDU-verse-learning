import React from "react";

const FormattedStudentAnswer = ({ rawAnswer, isStudentView = false }) => {
  if (!rawAnswer) return null;

  const text = rawAnswer.trim();

  // Helper to format inline code (`code`), bold (**text**), italic (*text*)
  const renderInlineFormatting = (str) => {
    if (!str) return null;

    const parts = str.split(/(`[^`]+`)/g);

    return parts.map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={idx} className="inline-code-badge">
            {part.slice(1, -1)}
          </code>
        );
      }

      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={idx}>
          {boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith("**") && bPart.endsWith("**")) {
              return <strong key={bIdx}>{bPart.slice(2, -2)}</strong>;
            }
            return bPart;
          })}
        </span>
      );
    });
  };

  // Helper to parse single answer string for code fences, tables, bullet points, and inline code
  const renderFormattedBlocks = (contentStr) => {
    if (!contentStr) return null;

    const codeBlockRegex = /(```[\s\S]*?```)/g;
    const segments = contentStr.split(codeBlockRegex);

    return segments.map((seg, idx) => {
      if (seg.startsWith("```") && seg.endsWith("```")) {
        const lines = seg.slice(3, -3).trim().split("\n");
        let firstLine = lines[0].trim();
        let lang = "CODE";
        let codeBody = "";

        if (
          firstLine &&
          !firstLine.includes(" ") &&
          /^[a-zA-Z0-9_+#-]+$/.test(firstLine)
        ) {
          lang = firstLine.toUpperCase();
          codeBody = lines.slice(1).join("\n");
        } else {
          const codeText = lines.join("\n");
          if (
            codeText.includes("function") ||
            codeText.includes("const ") ||
            codeText.includes("let ") ||
            codeText.includes("console.log")
          ) {
            lang = "JAVASCRIPT";
          } else if (
            codeText.includes("<html") ||
            codeText.includes("</div>") ||
            codeText.includes("<p>")
          ) {
            lang = "HTML";
          } else if (
            codeText.includes("SELECT ") ||
            codeText.includes("FROM ") ||
            codeText.includes("WHERE ")
          ) {
            lang = "SQL";
          } else if (
            codeText.includes("def ") ||
            codeText.includes("import ") ||
            codeText.includes("print(")
          ) {
            lang = "PYTHON";
          } else if (
            codeText.includes("class ") ||
            codeText.includes("public static void")
          ) {
            lang = "JAVA";
          } else if (
            codeText.includes("#include") ||
            codeText.includes("std::")
          ) {
            lang = "C++";
          }
          codeBody = lines.join("\n");
        }

        return (
          <div key={idx} className="chatgpt-code-block my-12">
            <div className="code-block-header">
              <span className="code-lang-label">{lang}</span>
              <button
                type="button"
                className="copy-code-btn"
                onClick={() => navigator.clipboard.writeText(codeBody)}
              >
                Copy code
              </button>
            </div>
            <div className="code-block-body">
              <pre>
                <code>{codeBody}</code>
              </pre>
            </div>
          </div>
        );
      } else {
        const subLines = seg.split("\n");
        const renderedElements = [];
        let bulletBuffer = [];
        let tableBuffer = [];

        const flushBullets = (key) => {
          if (bulletBuffer.length > 0) {
            renderedElements.push(
              <ul key={`ul-${key}`} className="formatted-bullet-list">
                {bulletBuffer.map((b, bIdx) => (
                  <li key={bIdx}>{renderInlineFormatting(b)}</li>
                ))}
              </ul>
            );
            bulletBuffer = [];
          }
        };

        const flushTable = (key) => {
          if (tableBuffer.length > 0) {
            const rows = tableBuffer.map((r) =>
              r
                .split("|")
                .map((cell) => cell.trim())
                .filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1)
            );

            if (rows.length > 0) {
              const headers = rows[0];
              const bodyRows = rows
                .slice(1)
                .filter((r) => !r.every((cell) => /^[:\s-]+$/.test(cell)));

              renderedElements.push(
                <div
                  key={`table-${key}`}
                  className="formatted-table-container my-10"
                >
                  <table className="formatted-markdown-table">
                    <thead>
                      <tr>
                        {headers.map((h, hIdx) => (
                          <th key={hIdx}>{renderInlineFormatting(h)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bodyRows.map((r, rIdx) => (
                        <tr key={rIdx}>
                          {r.map((c, cIdx) => (
                            <td key={cIdx}>{renderInlineFormatting(c)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            tableBuffer = [];
          }
        };

        subLines.forEach((line, lineIdx) => {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
            flushBullets(lineIdx);
            tableBuffer.push(trimmedLine);
            return;
          } else {
            flushTable(lineIdx);
          }

          if (
            trimmedLine.startsWith("- ") ||
            trimmedLine.startsWith("* ") ||
            trimmedLine.startsWith("• ")
          ) {
            bulletBuffer.push(trimmedLine.slice(2));
            return;
          } else {
            flushBullets(lineIdx);
          }

          if (trimmedLine) {
            renderedElements.push(
              <p key={`p-${lineIdx}`} className="formatted-answer-paragraph">
                {renderInlineFormatting(trimmedLine)}
              </p>
            );
          }
        });

        flushBullets("end");
        flushTable("end");

        return <React.Fragment key={idx}>{renderedElements}</React.Fragment>;
      }
    });
  };

  // Split into Question Blocks (e.g. "1. Question... 2. Question...")
  const questionRegex = /(?=(?:^|\n|\s+)\d+[.)]\s+)/g;
  const rawQuestionBlocks = text.split(questionRegex).map((b) => b.trim()).filter(Boolean);

  let questionCards = [];

  rawQuestionBlocks.forEach((block) => {
    const match = block.match(/^(\d+)[.)]\s+([\s\S]*)/);
    if (match) {
      const qNum = match[1];
      const rest = match[2].trim();

      let qTitle = "";
      let qAnswer = rest;

      const qMarkIdx = rest.indexOf("?");
      const lineBreakIdx = rest.indexOf("\n");

      if (qMarkIdx !== -1 && (lineBreakIdx === -1 || qMarkIdx < lineBreakIdx)) {
        qTitle = rest.slice(0, qMarkIdx + 1).trim();
        qAnswer = rest.slice(qMarkIdx + 1).trim();
      } else if (lineBreakIdx !== -1) {
        qTitle = rest.slice(0, lineBreakIdx).trim();
        qAnswer = rest.slice(lineBreakIdx + 1).trim();
      } else {
        qTitle = `Question ${qNum}`;
        qAnswer = rest;
      }

      questionCards.push({
        num: qNum,
        title: qTitle,
        answer: qAnswer,
      });
    }
  });

  if (questionCards.length === 0) {
    return (
      <div className="teacher-qa-card glass-card">
        <div className="qa-card-header">
          <span className="qa-question-num-pill">
            {isStudentView ? "Your Solution" : "Submitted Solution"}
          </span>
        </div>
        <div className="qa-card-body">
          {renderFormattedBlocks(text)}
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-qa-cards-list">
      {questionCards.map((card, idx) => (
        <div key={idx} className="teacher-qa-card glass-card">
          <div className="qa-card-header">
            <span className="qa-question-num-pill">QUESTION {card.num}</span>
            <h4 className="qa-question-title">{card.title}</h4>
          </div>
          <div className="qa-card-body">
            <span className="qa-answer-label">
              {isStudentView ? "YOUR ANSWER" : "STUDENT ANSWER"}
            </span>
            <div className="qa-answer-content">
              {renderFormattedBlocks(card.answer)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormattedStudentAnswer;
