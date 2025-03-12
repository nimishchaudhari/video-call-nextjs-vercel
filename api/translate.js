const { Translate } = require('@google-cloud/translate').v2;
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

const translateClient = new Translate({ keyFilename: 'credentials.json' });
const ttsClient = new TextToSpeechClient({ keyFilename: 'credentials.json' });

export default async function handler(req, res) {
  const { text, targetLang } = req.body;
  const [translated] = await translateClient.translate(text, targetLang.split('-')[0]);
  const synthesisInput = { text: translated };
  const voice = { languageCode: targetLang, ssmlGender: 'NEUTRAL' };
  const audioConfig = { audioEncoding: 'MP3' };
  const [response] = await ttsClient.synthesizeSpeech({ input: synthesisInput, voice, audioConfig });
  res.status(200).send(response.audioContent);
}
