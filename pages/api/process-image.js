import axios from 'axios';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async (req, res) => {
  const { filePath, prompt } = req.body;
  const aiApiEndpoint = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1/images/variations';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }

  const fullFilePath = path.join(process.cwd(), 'public', filePath);

  if (!fs.existsSync(fullFilePath)) {
    return res.status(400).json({ error: 'File not found' });
  }

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(fullFilePath));
    form.append('n', 3);
    form.append('size', '1024x1024');
    if (prompt) {
      form.append('prompt', prompt);
    }

    const response = await axios.post(aiApiEndpoint, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from OpenAI API');
    }

    const variations = await Promise.all(response.data.data.map(async (image, index) => {
      const imageResponse = await axios.get(image.url, { responseType: 'arraybuffer' });
      const fileName = `variation-${index + 1}.png`;
      const filePath = path.join(process.cwd(), 'public', 'variations', fileName);
      await fs.promises.writeFile(filePath, imageResponse.data);
      return {
        url: `/variations/${fileName}`,
        prompt: prompt || 'No prompt provided',
      };
    }));

    res.status(200).json({ variations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
