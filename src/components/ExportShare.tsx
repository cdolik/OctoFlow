import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StartupStage, Category } from '../data/questions';
import { motion } from 'framer-motion';

interface ExportShareProps {
  stage: StartupStage;
  categoryScores: Record<Category, number>;
  recommendations: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const ExportShare: React.FC<ExportShareProps> = ({ stage, categoryScores, recommendations }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);
      
      // Get the results dashboard element
      const element = document.querySelector('.results-dashboard') as HTMLElement;
      if (!element) {
        console.error('Could not find results dashboard element');
        setIsExporting(false);
        return;
      }

      setExportProgress(30);
      
      // Create a canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (document) => {
          // Hide any buttons or elements we don't want in the PDF
          const clonedElement = document.querySelector('.results-dashboard') as HTMLElement;
          const actionButtons = clonedElement?.querySelector('.action-buttons');
          if (actionButtons) {
            actionButtons.remove();
          }
        }
      });

      setExportProgress(70);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit the canvas in the PDF
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the canvas as an image to the PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      setExportProgress(90);
      
      // Save the PDF
      pdf.save(`OctoFlow-${stage}-Assessment-${new Date().toISOString().split('T')[0]}.pdf`);
      
      setExportProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const copyShareableLink = () => {
    // For now, we'll just copy the current URL
    // In a real implementation, this would generate a unique shareable link
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopySuccess('Link copied to clipboard!');
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please try again.');
      });
  };

  const copyResultsText = () => {
    // Create a formatted text summary of the results
    let resultsText = `OctoFlow Assessment Results - ${stage}\n\n`;
    resultsText += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    resultsText += "Category Scores:\n";
    Object.entries(categoryScores).forEach(([category, score]) => {
      resultsText += `${category}: ${score.toFixed(1)}/4.0\n`;
    });
    
    resultsText += "\nRecommendations:\n";
    if (recommendations.length === 0) {
      resultsText += "Great job! You've implemented GitHub best practices effectively.\n";
    } else {
      recommendations.forEach((rec, index) => {
        resultsText += `${index + 1}. [${rec.category} - ${rec.priority} priority] ${rec.text}\n`;
      });
    }
    
    // Copy to clipboard
    navigator.clipboard.writeText(resultsText)
      .then(() => {
        setCopySuccess('Results copied to clipboard!');
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy results:', err);
        alert('Failed to copy results. Please try again.');
      });
  };

  return (
    <div className="export-share-container">
      <h3>Export & Share</h3>
      
      {copySuccess && (
        <motion.div 
          className="copy-success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {copySuccess}
        </motion.div>
      )}
      
      <div className="export-share-buttons">
        <button 
          onClick={exportToPDF} 
          className={`export-button ${isExporting ? 'exporting' : ''}`}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="spinner"></div>
              <span>Exporting PDF ({exportProgress}%)</span>
            </>
          ) : (
            <>
              <span className="icon">📄</span> Export as PDF
            </>
          )}
        </button>
        
        <button onClick={copyShareableLink} className="share-button">
          <span className="icon">🔗</span> Copy Link
        </button>
        
        <button onClick={copyResultsText} className="copy-button">
          <span className="icon">📋</span> Copy Results
        </button>
      </div>
    </div>
  );
};

export default ExportShare; 