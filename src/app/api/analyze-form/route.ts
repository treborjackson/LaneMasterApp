import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@/lib/anthropic';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SOLO_PROMPT = `You are an expert bowling coach analyzing form from a photo.
Return ONLY valid JSON matching this shape exactly:
{"score":72,"stance":"desc","backswing":"desc","release":"desc","followThrough":"desc","footwork":"desc","tips":["tip1","tip2","tip3"]}`;

function comparePrompt(proName: string) {
  return `You are an expert bowling coach. Compare this bowler's form to ${proName}.
Return ONLY valid JSON matching this shape exactly:
{"userScore":68,"proName":"${proName}","proStyle":"desc","categories":[{"name":"Stance","userScore":70,"proScore":95,"userNote":"desc","proNote":"desc","gap":"tip"},{"name":"Backswing","userScore":65,"proScore":90,"userNote":"desc","proNote":"desc","gap":"tip"},{"name":"Release","userScore":60,"proScore":95,"userNote":"desc","proNote":"desc","gap":"tip"},{"name":"Follow-Through","userScore":75,"proScore":92,"userNote":"desc","proNote":"desc","gap":"tip"},{"name":"Footwork","userScore":70,"proScore":88,"userNote":"desc","proNote":"desc","gap":"tip"}],"topDifferences":["d1","d2","d3"],"drillsToClose":["drill1","drill2","drill3"]}`;
}

export async function POST(req: NextRequest) {
  const userId = verifyToken(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageBase64, analyzeMode, proName, ball } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 });
  }

  const isCompare = analyzeMode === 'compare' && !!proName;
  const ballCtx   = ball ? ` Their ball: ${ball.name} (${ball.brand}).` : '';
  const system    = isCompare ? comparePrompt(proName) + ballCtx : SOLO_PROMPT + ballCtx;
  const userText  = isCompare
    ? `Compare my form to ${proName}. Return only the JSON.`
    : 'Analyze my form. Return only the JSON.';

  const response = await anthropic.messages.create({
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system,
    messages: [{
      role:    'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        { type: 'text',  text: userText },
      ],
    }],
  });

  const raw  = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const json = raw.replace(/```json\s*/g, '').replace(/```/g, '').trim();
  const result = JSON.parse(json);

  await prisma.formAnalysis.create({
    data: {
      userId,
      analysisType: isCompare ? 'compare' : 'solo',
      proCompared:  proName ?? null,
      score:        result.score ?? result.userScore ?? 0,
      resultJson:   JSON.stringify(result),
    },
  });

  return NextResponse.json(result);
}
