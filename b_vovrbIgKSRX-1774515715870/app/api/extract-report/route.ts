import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function extractWithGemini(imageBase64: string, mimeType: string): Promise<any> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert agricultural analyst. Analyze this soil health report or farm document image and extract the following values. Return ONLY a valid JSON object with these exact keys (use typical values if a field is not present):

{
  "N": <Nitrogen in kg/ha, number, typical 0-140>,
  "P": <Phosphorous in kg/ha, number, typical 0-80>,
  "K": <Potassium in kg/ha, number, typical 0-200>,
  "ph": <Soil pH, number, typical 5-8>,
  "temperature": <Temperature in Celsius, number>,
  "humidity": <Humidity %, number 0-100>,
  "rainfall": <Rainfall in mm, number>,
  "soil_moisture": <Soil moisture reading, number>,
  "crop_days": <Days since sowing / crop age in days, number>,
  "crop_type": <crop name as lowercase string e.g. "wheat", "rice", "maize">
}

No explanation. No markdown. Just the raw JSON object.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageBase64, mimeType } }
  ]);

  const text = result.response.text().trim();
  // Strip markdown code blocks if present
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function runMLPrediction(params: any): Promise<any> {
  const pythonScript = path.join(process.cwd(), 'predict_cli.py');
  const { stdout } = await execFileAsync('python', [pythonScript, JSON.stringify(params)]);
  const result = JSON.parse(stdout.trim());
  if (result.status === 'success') return result.data;
  throw new Error(result.message);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type as 'image/jpeg' | 'image/png' | 'application/pdf';

    let extractedValues: any;

    if (GEMINI_API_KEY) {
      // Real extraction via Gemini Vision
      extractedValues = await extractWithGemini(base64, mimeType);
    } else {
      // Fallback: simulated intelligent extraction
      console.warn('No GEMINI_API_KEY found — using simulated extraction');
      extractedValues = {
        N: Math.floor(Math.random() * 40) + 60,
        P: Math.floor(Math.random() * 20) + 30,
        K: Math.floor(Math.random() * 30) + 40,
        ph: parseFloat((Math.random() * 2 + 5.5).toFixed(1)),
        temperature: Math.floor(Math.random() * 15) + 20,
        humidity: Math.floor(Math.random() * 40) + 30,
        rainfall: Math.floor(Math.random() * 100),
        soil_moisture: Math.floor(Math.random() * 300) + 300,
        crop_days: Math.floor(Math.random() * 60) + 10,
        crop_type: 'wheat'
      };
    }

    // Run ML prediction with extracted values
    const prediction = await runMLPrediction(extractedValues);

    return NextResponse.json({
      status: 'success',
      extractedValues,
      prediction,
      message: GEMINI_API_KEY
        ? 'Extracted via Gemini Vision AI'
        : 'Simulated extraction (add GEMINI_API_KEY to .env.local for real OCR)'
    });

  } catch (error: any) {
    console.error('Report extraction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process document' }, { status: 500 });
  }
}
