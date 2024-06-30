import { useState, useCallback, useRef } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/system';
import Webcam from 'react-webcam';
import CameraIcon from '@mui/icons-material/Camera';
import UploadIcon from '@mui/icons-material/Upload';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const useStyles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 4,
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#282c34',
    color: '#ffffff',
  },
  header: {
    marginBottom: 4,
  },
  uploadButton: {
    marginTop: 2,
    marginBottom: 2,
  },
  imagePreview: {
    marginTop: 2,
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  promptInput: {
    marginTop: 2,
    width: '100%',
  },
  variationsContainer: {
    marginTop: 2,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 2,
    borderRadius: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  imageVariation: {
    width: '100%',
    height: 'auto',
    borderRadius: 8,
  },
  footer: {
    marginTop: 4,
    padding: 2,
    textAlign: 'center',
    backgroundColor: '#333',
    color: '#fff',
  },
  appBar: {
    marginBottom: 4,
  },
  dialog: {
    backgroundColor: '#333',
    color: '#fff',
  },
};

const StyledContainer = styled(Container)(useStyles.root);
const StyledHeader = styled(Box)(useStyles.header);
const StyledButton = styled(Button)(useStyles.uploadButton);
const StyledImagePreview = styled('img')(useStyles.imagePreview);
const StyledPromptInput = styled(TextField)(useStyles.promptInput);
const StyledVariationsContainer = styled(Grid)(useStyles.variationsContainer);
const StyledCard = styled(Card)(useStyles.card);
const StyledImageVariation = styled(CardMedia)(useStyles.imageVariation);
const StyledFooter = styled(Paper)(useStyles.footer);
const StyledAppBar = styled(AppBar)(useStyles.appBar);
const StyledDialog = styled(Dialog)(useStyles.dialog);

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user',
};

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setSelectedFile(dataURLtoFile(imageSrc, 'captured-image.png'));
    setOpenCamera(false);
  }, [webcamRef]);

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setImagePath(data.filePath);
      setVariations([]);
      generateVariations(data.filePath);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const generateVariations = async (filePath) => {
    try {
      const res = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, prompt }),
      });

      if (!res.ok) {
        throw new Error('Image processing failed');
      }

      const data = await res.json();
      setVariations(data.variations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handlePromptSubmit = () => {
    if (!imagePath) return;
    setLoading(true);
    generateVariations(imagePath);
  };

  return (
    <StyledContainer>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Game Art Generator
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <StyledHeader>
        <Typography variant="h2" component="h1" gutterBottom>
          Custom Game Art Generator
        </Typography>
        <Typography variant="h6" component="p" gutterBottom>
          Upload or take a picture to create custom game art. Use AI to generate variations and customize with your own prompts.
        </Typography>
      </StyledHeader>

      <Box>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<PhotoLibraryIcon />}
          onClick={() => document.getElementById('upload-file').click()}
        >
          Upload Image
        </StyledButton>
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="upload-file" />
        <StyledButton
          variant="contained"
          color="secondary"
          startIcon={<CameraIcon />}
          onClick={() => setOpenCamera(true)}
        >
          Take Picture
        </StyledButton>
      </Box>

      {preview && <StyledImagePreview src={preview} alt="Preview" />}

      <StyledButton variant="contained" color="secondary" onClick={handleUpload}>
        {loading ? <CircularProgress size={24} /> : 'Generate Variations'}
      </StyledButton>

      <StyledPromptInput
        label="Modify with a prompt"
        variant="outlined"
        value={prompt}
        onChange={handlePromptChange}
        disabled={!imagePath}
      />
      <StyledButton variant="contained" color="primary" onClick={handlePromptSubmit} disabled={!imagePath || loading}>
        {loading ? <CircularProgress size={24} /> : 'Update with Prompt'}
      </StyledButton>

      <StyledVariationsContainer container spacing={2}>
        {variations.length > 0 && variations.map((variation, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StyledCard>
              <StyledImageVariation component="img" image={variation.url} />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  {variation.prompt}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </StyledVariationsContainer>

      <StyledFooter elevation={3}>
        <Typography variant="body1" component="p">
          Create unique game art for your projects and share your creations with the community. Powered by AI.
        </Typography>
      </StyledFooter>

      <StyledDialog open={openCamera} onClose={() => setOpenCamera(false)} maxWidth="md" fullWidth>
        <DialogTitle>Take a Picture</DialogTitle>
        <DialogContent>
          <Webcam
            audio={false}
            height={720}
            ref={webcamRef}
            screenshotFormat="image/png"
            width={1280}
            videoConstraints={videoConstraints}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCamera(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={capture} color="primary">
            Capture
          </Button>
        </DialogActions>
      </StyledDialog>
    </StyledContainer>
  );
}
