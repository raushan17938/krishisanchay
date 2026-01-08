import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { analyzeCrop } from "../api/ai";
import { toast } from "sonner";

const CropDoctor = () => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const data = await analyzeCrop(selectedImage, i18n.language);
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      toast.error(t('ai.analyzing') + " error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return <div className="container mx-auto px-6 py-8">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          {t('nav.cropDoctor')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('ai.uploadTitle')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {
          /* Upload Section */
        }
        <Card className="farm-card">
          <h3 className="text-xl font-semibold mb-6">{t('ai.uploadTitle')}</h3>

          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center mb-6">
            {selectedImage ? <div className="space-y-4">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected crop"
                className="max-w-full h-48 object-contain mx-auto rounded-lg"
              />
              <p className="text-sm text-muted-foreground">
                {selectedImage.name}
              </p>
            </div> : <div className="space-y-4">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-medium mb-2">{t('ai.uploadTitle')}</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG (Max 10MB)
                </p>
              </div>
            </div>}
          </div>

          <div className="flex gap-4">
            <label className="flex-1">
              <Button className="w-full btn-farm" asChild>
                <span>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {selectedImage && <Button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="flex-1 btn-earth"
            >
              {isAnalyzing ? <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('ai.analyzing')}
              </> : <>
                <Zap className="w-5 h-5 mr-2" />
                {t('ai.analyzeButton')}
              </>}
            </Button>}
          </div>
        </Card>

        {
          /* Results Section */
        }
        <Card className="farm-card">
          <h3 className="text-xl font-semibold mb-6">{t('ai.results')}</h3>

          {!analysis && !isAnalyzing && <div className="text-center py-8 text-muted-foreground">
            <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Upload a photo to start analysis</p>
          </div>}

          {isAnalyzing && <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold">{t('ai.analyzing')}</p>
            <p className="text-muted-foreground">Please wait...</p>
          </div>}

          {analysis && <div className="space-y-6 animate-fade-in">
            {
              /* Disease Detection */
            }
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                  {t('ai.disease')}
                </h4>
              </div>
              <p className="text-lg font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                {analysis.disease}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Severity: {analysis.severity} | {t('ai.confidence')}: {analysis.confidence}%
              </p>
            </div>

            {
              /* Treatment */
            }
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                {t('ai.treatment')}
              </h4>
              <ul className="space-y-2">
                {analysis.treatment.map((tip, index) => <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {tip}
                </li>)}
              </ul>
            </div>

            {
              /* Prevention */
            }
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                {t('ai.prevention')}
              </h4>
              <ul className="space-y-2">
                {analysis.prevention.map((tip, index) => <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  {tip}
                </li>)}
              </ul>
            </div>
          </div>}
        </Card>
      </div>
    </div>
  </div>;
};

export default CropDoctor;
