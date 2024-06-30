import formidable from 'formidable';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req, res) => {
  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/uploads'),
    keepExtensions: true,
    multiples: false,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      res.status(500).json({ error: 'Error parsing the files' });
      return;
    }

    if (!files.file || (Array.isArray(files.file) && files.file.length === 0)) {
      console.error('No file uploaded');
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const filePath = file.filepath || file.path;
    if (!filePath) {
      console.error('File path is not defined');
      res.status(500).json({ error: 'File path is not defined' });
      return;
    }

    const relativePath = filePath.replace(process.cwd(), '');
    res.status(200).json({ filePath: relativePath });
  });
};
