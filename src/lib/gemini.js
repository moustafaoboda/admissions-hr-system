export async function callGeminiApi(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: {
      parts: [{
        text: "You are the Senior HR AI Consultant for the Arab Academy for Science, Technology and Maritime Transport (AASTMT) Smart Village Campus Admissions Office. Provide crisp, professional, and actionable administrative output matching Academy bylaws."
      }]
    }
  };

  const delays = [1000, 2000, 4000];
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      }
    } catch (err) {
      if (attempt === 2) throw err;
    }
    await new Promise(r => setTimeout(r, delays[attempt]));
  }
  return "Unable to contact Gemini AI service. Please verify network connection or API key.";
}
