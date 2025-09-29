import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Share2, Wand2, ImageIcon, Loader2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API = `${API_BASE}/api`;

const WallpaperGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your wallpaper');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(`${API}/generate-wallpaper`, {
        prompt: prompt.trim(),
        aspect_ratio: '16:9'
      });

      if (response.data.success) {
        setGeneratedImage(response.data.image_url);
        setLastPrompt(response.data.prompt);
        toast.success('Wallpaper generated successfully!');
      } else {
        toast.error(response.data.error || 'Failed to generate wallpaper');
      }
    } catch (error) {
      console.error('Error generating wallpaper:', error);
      toast.error('Failed to generate wallpaper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `wallpaper-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Wallpaper downloaded!');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download wallpaper');
    }
  };

  const shareToSocial = (platform) => {
    if (!generatedImage) return;

    const shareText = `Check out this amazing wallpaper I just generated: "${lastPrompt}"`;
    const shareUrl = encodeURIComponent(generatedImage);
    const text = encodeURIComponent(shareText);

    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${text}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${shareUrl}&description=${text}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success(`Sharing to ${platform}!`);
  };

  const copyImageUrl = () => {
    if (generatedImage) {
      navigator.clipboard.writeText(generatedImage);
      toast.success('Image URL copied to clipboard!');
    }
  };

  const samplePrompts = [
    "Serene mountain landscape at sunset with purple sky",
    "Modern minimalist geometric abstract art",
    "Peaceful forest path with morning sunlight filtering through trees",
    "Vibrant galaxy and stars in deep space",
    "Ocean waves crashing on a rocky shore at golden hour"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Wallpaper Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create stunning laptop wallpapers from your imagination. Just describe what you want and watch it come to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                Describe Your Wallpaper
              </CardTitle>
              <CardDescription>
                Enter a detailed description of the wallpaper you'd like to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Textarea
                  placeholder="A breathtaking mountain landscape at sunrise with misty clouds..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isGenerating}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be specific about colors, mood, and style for best results
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((sample, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setPrompt(sample)}
                    >
                      {sample}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateWallpaper}
                disabled={isGenerating || !prompt.trim()}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Wallpaper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Your generated wallpaper will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Creating your wallpaper...</p>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated wallpaper"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>Your wallpaper will appear here</p>
                  </div>
                )}
              </div>

              {generatedImage && !isGenerating && (
                <div className="mt-6 space-y-4">
                  <div className="text-sm text-gray-600">
                    <strong>Prompt:</strong> {lastPrompt}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={downloadImage} variant="default" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={copyImageUrl} variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => shareToSocial('twitter')}
                      variant="outline"
                      size="sm"
                      className="text-blue-500 border-blue-200"
                    >
                      Twitter
                    </Button>
                    <Button
                      onClick={() => shareToSocial('facebook')}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-200"
                    >
                      Facebook
                    </Button>
                    <Button
                      onClick={() => shareToSocial('pinterest')}
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200"
                    >
                      Pinterest
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Generate high-quality wallpapers perfect for laptops and desktops • Share your creations with the world</p>
        </div>
      </div>
    </div>
  );
};

export default WallpaperGenerator;