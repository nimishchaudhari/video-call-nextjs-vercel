const speech = require('@google-cloud/speech').v1p1beta1;
const client = new speech.SpeechClient({ keyFilename: 'credentials.json' });

export default async function handler(req, res) {
  const { spokenLang } = req.body;

  const request = {
    config: { encoding: 'LINEAR16', sampleRateHertz: 16000, languageCode: spokenLang },
    interimResults: true,
  };

  const recognizeStream = client.streamingRecognize(request)
    .on('data', (data) => {
      const text = data.results[0]?.alternatives[0]?.transcript;
      if (text) res.write(`data: ${text}\n\n`);
    })
    .on('error', (err) => {
      console.error('ERROR:', err);
      res.status(500).end();
    });

  req.on('data', (chunk) => {
    recognizeStream.write(chunk);
  });

  req.on('end', () => {
    recognizeStream.end();
    res.end();
  });
}
