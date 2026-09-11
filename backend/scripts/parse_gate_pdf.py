"""
Semi-automated GATE CS question extractor.

Reads an official GATE CS question paper PDF and splits it into individual
question blocks for a human to review, tag (subject/chapter), and insert
into the database. This is a FIRST PASS, not a fully automated pipeline --
GATE papers vary in layout year to year, so always eyeball the output.

Usage:
    pip install pdfplumber --break-system-packages
    python parse_gate_pdf.py --input GATE_CS_2025.pdf --subject "Linear Algebra"
"""

import argparse
import re
import json
import pdfplumber


def extract_text(pdf_path):
    full_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            full_text.append(text)
    return "\n".join(full_text)


def split_into_questions(text):
    """
    Splits raw extracted text into question blocks using the 'Q.NN' numbering
    pattern common in official GATE papers (e.g. 'Q.1', 'Q.25'). Returns a
    list of raw text blocks -- review and clean these manually before import,
    since answer options / figures may need manual correction.
    """
    pattern = re.compile(r"\bQ\.?\s?(\d{1,3})\b")
    matches = list(pattern.finditer(text))

    blocks = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        q_number = m.group(1)
        block_text = text[start:end].strip()
        blocks.append({"question_number": q_number, "raw_text": block_text})
    return blocks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to the official GATE CS PDF")
    parser.add_argument("--subject", required=True, help="Subject tag to apply, e.g. 'Linear Algebra'")
    parser.add_argument("--output", default="extracted_questions.json", help="Output JSON path")
    args = parser.parse_args()

    print(f"Reading {args.input} ...")
    text = extract_text(args.input)

    print("Splitting into question blocks ...")
    blocks = split_into_questions(text)

    for b in blocks:
        b["subject_tag"] = args.subject
        b["needs_review"] = True   # human must confirm chapter, options, correct answer

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(blocks, f, indent=2, ensure_ascii=False)

    print(f"Extracted {len(blocks)} question blocks -> {args.output}")
    print("Next step: open the JSON, assign 'chapter', 'options', 'correctAnswer', and")
    print("write (or AI-draft + edit) an 'explanation' for each question before inserting into MongoDB.")


if __name__ == "__main__":
    main()
