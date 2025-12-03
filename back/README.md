# IntelliForm 🚀

An intelligent document parsing API that extracts structured data from PDFs, images, and markdown files using OCR and AI.

## Features

- 📄 **PDF Text Extraction** - Extract text from PDF documents
- 🖼️ **Image OCR** - Extract text from images using Tesseract.js
- 📝 **Markdown Support** - Parse markdown and text files
- 🤖 **AI-Powered Parsing** - Convert extracted text to structured JSON using Google's Gemini AI
- ⚡ **Fast & Efficient** - Built with Express.js for high performance

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **pdfjs-dist** - PDF text extraction
- **Tesseract.js** - OCR for images
- **Google Generative AI** - AI-powered data structuring
- **pdf-lib** - PDF manipulation
- **exceljs** - Generate Excel File
- **docx** - Generate Doc File

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mdfahaduddin/INTELLIFORM.git
cd back
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY_2=your2nd_gemini_api_key_here
GEMINI_API_KEY_3=your3rd_gemini_api_key_here
GEMINI_API_KEY_4=your4th_gemini_api_key_here
GEMINI_API_KEY_5=your5th_gemini_api_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
```

4. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Usage

### Start the server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### API Endpoint

**POST** `/api/parse`

Upload a file (PDF OR Image) to extract structured data.

#### Request

- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: Form data with a `file` field
            Form data with a `exportType` field


#### Example using JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('exportType', exportType);

const response = await fetch('http://localhost:5000/api/parse', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

#### Response

Success:
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

Error:
```json
{
  "success": false,
  "error": "No text could be extracted from the file"
}
```

## Supported File Types

| File Type | Extensions | Method |
|-----------|-----------|--------|
| PDF | `.pdf` | Text extraction via pdfjs-dist |
| Images | `.jpg`, `.jpeg`, `.png`, `.bmp`, `.gif` | OCR via Tesseract.js |

## Project Structure

```
intelliform/
├── routes/
│   └── parse.js          # Main parsing route
├── uploads/              # Temporary file storage (auto-created)
├── .env                  # Environment variables
├── geminiClient.js       # Gemini AI client setup
├── server.js             # Express server entry point
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `GEMINI_API_KEY_2` | Google Gemini API key | No |
| `GEMINI_API_KEY_3` | Google Gemini API key | No |
| `GEMINI_API_KEY_4` | Google Gemini API key | No |
| `GEMINI_API_KEY_5` | Google Gemini API key | No |

## How It Works

1. **File Upload**: User uploads a file via the `/api/parse` endpoint
2. **Text Extraction**: 
   - PDFs → pdfjs-dist extracts embedded text
   - Images → Tesseract.js performs OCR
3. **AI Processing**: Extracted text is sent to Gemini AI with a prompt to structure the data
4. **JSON Response**: AI returns structured JSON data
5. **Cleanup**: Temporary uploaded files are deleted

## Error Handling

The API handles various error scenarios:
- Missing or invalid files
- Unsupported file types
- Empty or unreadable documents
- AI processing failures
- File system errors

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Adding New File Types

To add support for new file types, modify `routes/parse.js`:

1. Add a detection function (e.g., `isDocx()`)
2. Add an extraction function (e.g., `extractTextFromDocx()`)
3. Update the routing logic in the `/parse` endpoint

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- [Google Generative AI](https://ai.google.dev/) for AI-powered parsing
- [Express.js](https://expressjs.com/) for the web framework

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: mdfahaduddin.cse@gmail.com

---

Created by Md. Fahad Uddin.