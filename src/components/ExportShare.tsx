import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { StartupStage, Category } from '../data/questions';
import { motion, AnimatePresence } from 'framer-motion';
import { PersonalizationData } from './PersonalizationInputs';

interface ExportShareProps {
  stage: StartupStage;
  categoryScores: Record<Category, number>;
  recommendations: Array<{
    category: Category;
    text: string;
    docsUrl: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  personalizationData?: PersonalizationData;
}

const ExportShare: React.FC<ExportShareProps> = ({ 
  stage, 
  categoryScores, 
  recommendations,
  personalizationData 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('OctoFlow Assessment Results');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const copyTimeoutRef = React.useRef<number | null>(null);

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

  const generateResultsSummary = (): string => {
    let summary = `OctoFlow GitHub Assessment Results - ${stage} Stage\n`;
    summary += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    // Add personalization data if available
    if (personalizationData) {
      summary += `Team Size: ${personalizationData.teamSize || 'Not specified'}\n`;
      summary += `Primary Language: ${personalizationData.primaryLanguage || 'Not specified'}\n`;
      if (personalizationData.complianceNeeds?.length) {
        summary += `Compliance Needs: ${personalizationData.complianceNeeds.join(', ')}\n`;
      }
      summary += `\n`;
    }
    
    // Add category scores
    summary += `Category Scores:\n`;
    Object.entries(categoryScores).forEach(([category, score]) => {
      summary += `${category}: ${score.toFixed(1)}/4.0\n`;
    });
    
    // Add recommendations
    summary += `\nTop Recommendations:\n`;
    if (recommendations.length === 0) {
      summary += `Great job! You've implemented GitHub best practices effectively.\n`;
    } else {
      recommendations.slice(0, 5).forEach((rec, index) => {
        summary += `${index + 1}. [${rec.category}] ${rec.text}\n`;
      });
    }
    
    return summary;
  };
  
  const copyResultsToClipboard = () => {
    const resultsSummary = generateResultsSummary();
    
    navigator.clipboard.writeText(resultsSummary)
      .then(() => {
        setCopySuccess('Copied to clipboard!');
        
        // Clear the success message after 3 seconds
        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }
        
        copyTimeoutRef.current = window.setTimeout(() => {
          setCopySuccess('');
        }, 3000) as unknown as number;
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setCopySuccess('Failed to copy');
      });
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const openEmailModal = () => {
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    // Reset states
    setEmailAddress('');
    setEmailSent(false);
    setEmailError('');
  };

  const sendResultsByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Subject validation
    if (!emailSubject.trim()) {
      setEmailError('Please enter an email subject');
      return;
    }
    
    setIsSending(true);
    setEmailError('');
    
    try {
      // Simulate email sending (in a real app, you would call an API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEmailSent(true);
      setIsSending(false);
      
      // Reset form after successful send
      setTimeout(() => {
        setEmailSent(false);
        setEmail('');
        setEmailSubject('OctoFlow Assessment Results');
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError('Failed to send email. Please try again.');
      setIsSending(false);
    }
  };

  return (
    <div className="export-share-container">
      <h3>Export & Share Results</h3>
      
      <div className="export-options">
        <div className="export-option">
          <h4>Copy Results</h4>
          <p>Copy your assessment results to the clipboard.</p>
          <button 
            className="copy-button"
            onClick={copyResultsToClipboard}
            disabled={!!copySuccess}
          >
            {copySuccess || 'Copy to Clipboard'}
          </button>
        </div>
        
        <div className="export-option">
          <h4>Export to PDF</h4>
          <p>Download your results as a PDF document.</p>
          <button 
            onClick={exportToPDF} 
            className={`export-button ${isExporting ? 'exporting' : ''}`}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                Exporting
                <div className="export-progress-bar">
                  <div 
                    className="export-progress-fill" 
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
              </>
            ) : (
              'Export to PDF'
            )}
          </button>
        </div>
        
        <div className="export-option">
          <h4>Email Results</h4>
          <p>Share your assessment results via email.</p>
          <button onClick={openEmailModal} className="email-button">
            Send via Email
          </button>
        </div>
      </div>
      
      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="email-modal"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <h3>Email Assessment Results</h3>
                <button className="close-button" onClick={closeEmailModal}>×</button>
              </div>
              
              {emailSent ? (
                <div className="email-sent-message">
                  <div className="success-icon">✓</div>
                  <h4>Results Sent!</h4>
                  <p>Your assessment results have been sent to {emailAddress}</p>
                  <button onClick={closeEmailModal} className="close-modal-button">
                    Close
                  </button>
                </div>
              ) : (
                <div className="email-modal-content">
                  <h3>Share Results via Email</h3>
                  <form onSubmit={sendResultsByEmail}>
                    <div className="form-group">
                      <label htmlFor="email-address">Recipient Email</label>
                      <input 
                        type="email" 
                        id="email-address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="Enter email address"
                        required
                        aria-describedby={emailError ? "email-error" : undefined}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email-subject">Email Subject</label>
                      <input 
                        type="text" 
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => {
                          setEmailSubject(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="Enter email subject"
                        required
                      />
                    </div>
                    
                    {emailError && (
                      <div className="error-message" id="email-error" role="alert">
                        {emailError}
                      </div>
                    )}
                    
                    <div className="form-actions">
                      <button 
                        type="submit"
                        className="send-button"
                        disabled={isSending || !email}
                      >
                        {isSending ? (
                          <span className="sending-indicator">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </span>
                        ) : emailSent ? 'Sent!' : 'Send'}
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={closeEmailModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportShare; 