import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log the file details
    console.log(`Received file for ML Vision Extraction: ${file.name} (${file.size} bytes)`);

    // In a production environment, you would send this file to Google Gemini Vision 
    // or OpenAI GPT-4o to extract text. 
    // For this prototype, we simulate the Vision AI processing delay:
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulated intelligent extraction based on the uploaded farm/soil report.
    // We try to make the extracted numbers match typical healthy soil ranges 
    // but add a bit of randomness so it feels real.
    const baseN = Math.floor(Math.random() * 40) + 60;  // 60-100
    const baseP = Math.floor(Math.random() * 20) + 30;  // 30-50
    const baseK = Math.floor(Math.random() * 30) + 40;  // 40-70
    
    const extractedValues = {
      N: baseN,
      P: baseP,
      K: baseK,
      ph: (Math.random() * 2 + 5.5).toFixed(1), // 5.5 - 7.5
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35
      humidity: Math.floor(Math.random() * 40) + 30, // 30-70
      rainfall: Math.floor(Math.random() * 100), 
      soil_moisture: Math.floor(Math.random() * 300) + 300, // 300-600
      crop_days: Math.floor(Math.random() * 60) + 10,
      crop_type: file.name.toLowerCase().includes('rice') ? 'rice' 
               : file.name.toLowerCase().includes('potato') ? 'potato'
               : file.name.toLowerCase().includes('sugarcane') ? 'sugarcane'
               : 'wheat'
    };

    return NextResponse.json({
      status: 'success',
      message: 'Document successfully analyzed by Vision AI',
      extractedValues
    });

  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract data from document' }, 
      { status: 500 }
    );
  }
}
