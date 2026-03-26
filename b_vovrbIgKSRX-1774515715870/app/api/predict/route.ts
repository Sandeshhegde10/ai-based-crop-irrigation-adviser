import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = JSON.stringify(body);
    
    const pythonScript = path.join(process.cwd(), 'predict_cli.py');
    
    // Using execFile avoids issues with escaping quotes in the shell
    const { stdout, stderr } = await execFileAsync('python', [pythonScript, payload]);
    
    // Parse the JSON output from Python
    const result = JSON.parse(stdout.trim());
    
    if (result.status === 'success') {
      return NextResponse.json(result.data);
    } else {
      console.error("ML Script Error:", result.message);
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Prediction API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze farm conditions with ML Model' }, 
      { status: 500 }
    );
  }
}
