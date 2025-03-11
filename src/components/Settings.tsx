import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUserSettings, clearAssessmentHistory } from '../utils/storage';

interface SettingsProps {
  onClose: () => void;
  onCompanyInfoUpdate?: (info: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  }) => void;
  companyInfo?: {
    employeeCount?: number;
    devCount?: number;
    fundingStage?: string;
    usingGitHubEnterprise?: boolean;
    usingAdvancedSecurity?: boolean;
    timeWithGitHub?: string;
  };
}

const Settings: React.FC<SettingsProps> = ({ 
  onClose, 
  onCompanyInfoUpdate,
  companyInfo = {}
}) => {
  const [settings, setSettings] = useState({
    historyLimit: 10,
    theme: 'light',
    autoSaveHistory: true
  });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [employeeCount, setEmployeeCount] = useState<number | undefined>(companyInfo.employeeCount);
  const [devCount, setDevCount] = useState<number | undefined>(companyInfo.devCount);
  const [fundingStage, setFundingStage] = useState<string>(companyInfo.fundingStage || '');
  const [usingGitHubEnterprise, setUsingGitHubEnterprise] = useState<boolean>(companyInfo.usingGitHubEnterprise || false);
  const [usingAdvancedSecurity, setUsingAdvancedSecurity] = useState<boolean>(companyInfo.usingAdvancedSecurity || false);
  const [timeWithGitHub, setTimeWithGitHub] = useState<string>(companyInfo.timeWithGitHub || '');

  // Load settings on component mount
  useEffect(() => {
    const userSettings = getUserSettings();
    setSettings(userSettings);
  }, []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('octoflow_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setDarkMode(parsedSettings.darkMode || false);
      setNotificationsEnabled(parsedSettings.notificationsEnabled !== false);
    }
    
    // Check if dark mode is enabled in the system
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle number and select inputs
      setSettings(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) : value 
      }));
    }
  };

  // Clear history with confirmation
  const handleClearHistory = () => {
    if (showConfirmClear) {
      clearAssessmentHistory();
      setShowConfirmClear(false);
      setSaveSuccess(true);
      
      // Hide success message after a delay
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } else {
      setShowConfirmClear(true);
    }
  };

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      darkMode,
      notificationsEnabled
    };
    
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    // Update company info if callback is provided
    if (onCompanyInfoUpdate) {
      onCompanyInfoUpdate({
        employeeCount,
        devCount,
        fundingStage,
        usingGitHubEnterprise,
        usingAdvancedSecurity,
        timeWithGitHub
      });
    }
    
    setSaveSuccess(true);
    
    // Hide success message after a delay
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Handle employee count change
  const handleEmployeeCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmployeeCount(value === '' ? undefined : parseInt(value, 10));
  };
  
  // Handle dev count change
  const handleDevCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDevCount(value === '' ? undefined : parseInt(value, 10));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="settings-content">
          {saveSuccess && (
            <motion.div 
              className="settings-success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Settings saved successfully!
            </motion.div>
          )}
          
          <div className="settings-section">
            <h3>History Settings</h3>
            
            <div className="settings-field">
              <label htmlFor="historyLimit">History Limit</label>
              <input 
                type="number" 
                id="historyLimit"
                name="historyLimit"
                min="1"
                max="50"
                value={settings.historyLimit}
                onChange={handleChange}
              />
              <p className="settings-help">Maximum number of assessment results to keep in history</p>
            </div>
            
            <div className="settings-field">
              <label htmlFor="autoSaveHistory">Auto-Save Results</label>
              <input 
                type="checkbox" 
                id="autoSaveHistory"
                name="autoSaveHistory"
                checked={settings.autoSaveHistory}
                onChange={handleChange}
              />
              <p className="settings-help">Automatically save assessment results to history</p>
            </div>
            
            <div className="settings-field">
              <button 
                onClick={handleClearHistory} 
                className={`danger-button ${showConfirmClear ? 'confirm' : ''}`}
              >
                {showConfirmClear ? 'Confirm Clear History' : 'Clear History'}
              </button>
              {showConfirmClear && (
                <button 
                  onClick={() => setShowConfirmClear(false)} 
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Display Settings</h3>
            
            <div className="settings-field">
              <label htmlFor="theme">Theme</label>
              <select 
                id="theme"
                name="theme"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
              <p className="settings-help">Application theme (coming soon)</p>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label htmlFor="darkMode">Dark Mode</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="toggle-slider"></span>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Notifications</h3>
            <div className="setting-item">
              <label htmlFor="notifications">Enable Notifications</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notificationsEnabled}
                  onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                />
                <span className="toggle-slider"></span>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Company Information</h3>
            <p className="settings-description">
              This information helps determine your eligibility for GitHub for Startups program.
            </p>
            
            <div className="setting-item">
              <label htmlFor="employeeCount">Number of Employees</label>
              <input
                type="number"
                id="employeeCount"
                min="1"
                placeholder="Enter number of employees"
                value={employeeCount === undefined ? '' : employeeCount}
                onChange={handleEmployeeCountChange}
              />
            </div>
            
            <div className="setting-item">
              <label htmlFor="devCount">Number of Developers</label>
              <input
                type="number"
                id="devCount"
                min="1"
                placeholder="Enter number of developers"
                value={devCount === undefined ? '' : devCount}
                onChange={handleDevCountChange}
              />
            </div>
            
            <div className="setting-item">
              <label htmlFor="fundingStage">Funding Stage</label>
              <select
                id="fundingStage"
                value={fundingStage}
                onChange={(e) => setFundingStage(e.target.value)}
              >
                <option value="">Select funding stage</option>
                <option value="pre-seed">Pre-Seed</option>
                <option value="seed">Seed</option>
                <option value="series a">Series A</option>
                <option value="series b">Series B</option>
                <option value="series c+">Series C or later</option>
                <option value="bootstrapped">Bootstrapped</option>
                <option value="public">Public Company</option>
              </select>
            </div>
            
            <div className="setting-item">
              <label htmlFor="usingGitHubEnterprise">Using GitHub Enterprise</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="usingGitHubEnterprise"
                  checked={usingGitHubEnterprise}
                  onChange={() => setUsingGitHubEnterprise(!usingGitHubEnterprise)}
                />
                <span className="toggle-slider"></span>
              </div>
            </div>
            
            <div className="setting-item">
              <label htmlFor="usingAdvancedSecurity">Using GitHub Advanced Security</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="usingAdvancedSecurity"
                  checked={usingAdvancedSecurity}
                  onChange={() => setUsingAdvancedSecurity(!usingAdvancedSecurity)}
                />
                <span className="toggle-slider"></span>
              </div>
            </div>
            
            <div className="setting-item">
              <label htmlFor="timeWithGitHub">How long have you been using GitHub?</label>
              <select
                id="timeWithGitHub"
                value={timeWithGitHub}
                onChange={(e) => setTimeWithGitHub(e.target.value)}
              >
                <option value="">Select time period</option>
                <option value="less than 6 months">Less than 6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="1-2 years">1-2 years</option>
                <option value="more than 2 years">More than 2 years</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="cancel-button" onClick={onClose}>Cancel</button>
          <button className="save-button" onClick={saveSettings}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 