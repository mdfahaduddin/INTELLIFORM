import express from "express";
import multer from "multer";
import fs from "fs";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { generateContent, API_KEYS_COUNT } from "../groqClient.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const ALLOWED_TYPES = {
  pdf: "application/pdf",
  images: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
  ],
};

const EXPORT_TYPES = ["json", "excel", "word"];

function isPDF(mimetype) {
  return mimetype === ALLOWED_TYPES.pdf;
}

function isImage(mimetype) {
  return ALLOWED_TYPES.images.includes(mimetype);
}

function isValidFileType(mimetype) {
  return isPDF(mimetype) || isImage(mimetype);
}

async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdfDocument = await loadingTask.promise;
  let fullText = "";

  console.log(`📄 Extracting text from ${pdfDocument.numPages} pages...`);

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
    console.log(`  ✓ Page ${pageNum}/${pdfDocument.numPages} extracted`);
  }

  return fullText.trim();
}

async function extractTextFromImage(filePath) {
  try {
    console.log(`🖼️  Starting OCR on image...`);

    const {
      data: { text },
    } = await Tesseract.recognize(filePath, "eng+ben", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`  ⏳ OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      preserve_interword_spaces: "1",
    });

    console.log(`  ✓ OCR completed successfully`);
    return text;
  } catch (error) {
    console.error("❌ Tesseract OCR Error:", error);
    throw new Error("Failed to extract text from image");
  }
}

async function jsonToExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Extracted Data");

  if (Array.isArray(data)) {
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      data.forEach((item) => {
        const row = headers.map((header) => item[header]);
        worksheet.addRow(row);
      });
    }
  } else if (typeof data === "object") {
    worksheet.addRow(["Field", "Value"]);

    const flattenObject = (obj, prefix = "") => {
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === "object" && !Array.isArray(value)) {
          flattenObject(value, newKey);
        } else {
          worksheet.addRow([newKey, JSON.stringify(value)]);
        }
      });
    };

    flattenObject(data);
  }

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  worksheet.columns.forEach((column) => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

async function jsonToWord(data) {
  const children = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Extracted Data",
          bold: true,
          size: 32,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  const flattenObject = (obj, prefix = "") => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: newKey + ":",
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );
        flattenObject(value, newKey);
      } else {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${newKey}: `,
                bold: true,
              }),
              new TextRun({
                text: JSON.stringify(value),
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  };

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Item ${index + 1}`,
              bold: true,
              size: 28,
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );
      flattenObject(item);
    });
  } else {
    flattenObject(data);
  }

  const doc = new Document({
    sections: [
      {
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

router.post("/parse", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    console.log(`\n📁 Processing file: ${req.file.originalname}`);
    console.log(`📊 File size: ${(req.file.size / 1024).toFixed(2)} KB`);
    console.log(`🎯 MIME type: ${req.file.mimetype}`);

    const exportType = req.body.exportType?.toLowerCase() || "json";

    if (!EXPORT_TYPES.includes(exportType)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: `Invalid export type. Supported types: ${EXPORT_TYPES.join(
          ", "
        )}`,
      });
    }

    if (!isValidFileType(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error:
          "Invalid file type. Only PDF and image files (JPEG, JPG, PNG, WEBP) are supported.",
      });
    }

    const filePath = req.file.path;
    let extractedText = "";

    if (isPDF(req.file.mimetype)) {
      extractedText = await extractTextFromPDF(filePath);
    } else if (isImage(req.file.mimetype)) {
      extractedText = await extractTextFromImage(filePath);
    }

    fs.unlinkSync(filePath);

    if (!extractedText || extractedText.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "No text could be extracted from the file",
      });
    }

    console.log(`✅ Text extracted: ${extractedText.length} characters`);

    const prompt = `You are a data extraction expert. Extract structured information from the text below.

The text may contain:
- English text
- Bangla/Bengali text (বাংলা)
- Handwritten content (may have OCR errors)
- Mixed language content

Instructions:
1. Clean up any OCR errors where possible
2. Identify all fields and their values
3. Structure the data logically as an object or array of objects
4. Preserve Bangla text as-is (don't translate)
5. Return ONLY valid JSON, no explanations, no markdown code blocks

Text:
${extractedText}

Return format example:
{
  "type": "document_type",
  "fields": {
    "field_name": "value"
  }
}

Return ONLY the JSON object, nothing else:`;

    let aiText;
    let lastError;

    console.log(`🤖 Sending to Groq AI for extraction...`);

    for (let attempt = 0; attempt < API_KEYS_COUNT; attempt++) {
      try {
        aiText = await generateContent(prompt);
        console.log(`✅ Successfully extracted data using Groq`);
        break;
      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt + 1} failed:`, error.message);

        if (error.message.includes("429") && attempt < API_KEYS_COUNT - 1) {
          console.log(`🔄 Trying next API key...`);
          continue;
        }

        if (attempt === API_KEYS_COUNT - 1) {
          throw error;
        }
      }
    }

    if (!aiText) {
      throw new Error("Failed to get response from AI model");
    }

    let jsonOutput;
    try {
      const cleanText = aiText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonOutput = JSON.parse(jsonMatch[0]);
      } else {
        jsonOutput = JSON.parse(cleanText);
      }

      console.log(`✅ JSON parsed successfully`);
    } catch (parseError) {
      console.error("⚠️  JSON Parse Error:", parseError);
      console.log("Raw AI Response:", aiText);

      jsonOutput = {
        extracted: aiText,
        raw_ocr_text: extractedText,
        note: "Could not parse as JSON, returning raw extracted text",
      };
    }

    console.log(`📤 Exporting as ${exportType.toUpperCase()}...`);

    switch (exportType) {
      case "excel":
        const excelBuffer = await jsonToExcel(jsonOutput);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=extracted-data-${Date.now()}.xlsx`
        );
        console.log(`✅ Excel file generated successfully`);
        return res.send(excelBuffer);

      case "word":
        const wordBuffer = await jsonToWord(jsonOutput);
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=extracted-data-${Date.now()}.docx`
        );
        console.log(`✅ Word document generated successfully`);
        return res.send(wordBuffer);

      case "json":
      default:
        console.log(`✅ JSON response sent successfully`);
        return res.json({
          success: true,
          data: jsonOutput,
          ocr_text: extractedText,
          metadata: {
            file_name: req.file.originalname,
            file_size: req.file.size,
            mime_type: req.file.mimetype,
            extracted_length: extractedText.length,
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("❌ Error:", err.message);
    console.error("Stack:", err.stack);

    if (
      err.message.includes("429") ||
      err.message.includes("rate limit") ||
      err.message.includes("Rate limit")
    ) {
      return res.status(429).json({
        success: false,
        error: "API rate limit reached. Please try again in a few minutes.",
        isRateLimit: true,
      });
    }

    if (
      err.message.includes("401") ||
      err.message.includes("Invalid API key")
    ) {
      return res.status(500).json({
        success: false,
        error:
          "API key configuration error. Please check your Groq API keys in .env file.",
      });
    }

    if (
      err.message.includes("503") ||
      err.message.includes("Service Unavailable")
    ) {
      return res.status(503).json({
        success: false,
        error: "AI service is temporarily unavailable. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

export default router;
