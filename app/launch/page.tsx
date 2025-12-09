'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Rocket } from 'phosphor-react';
import GitHubSection from '@/components/launch/GitHubSection';
import ImageUploadSection from '@/components/launch/ImageUploadSection';
import BasicInfoSection from '@/components/launch/BasicInfoSection';
import RequirementsSection from '@/components/launch/RequirementsSection';
import LinksSection from '@/components/launch/LinksSection';

export default function LaunchAgent() {
  const { authenticated, login, user } = usePrivy();
  
  const [formData, setFormData] = useState({
    name: '',
    language: 'python',
    description: '',
    categories: '',
    tags: '',
    githubRepo: '',
    image: null as File | null,
  });

  const [requirements, setRequirements] = useState<{package: string, install: string}[]>([{package: '', install: ''}]);
  const [links, setLinks] = useState<{name: string, url: string}[]>([{name: '', url: ''}]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequirementChange = (index: number, field: 'package' | 'install', value: string) => {
    const newReqs = [...requirements];
    newReqs[index][field] = value;
    setRequirements(newReqs);
  };

  const addRequirement = () => {
    setRequirements([...requirements, {package: '', install: ''}]);
  };

  const removeRequirement = (index: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const handleLinkChange = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    setLinks([...links, {name: '', url: ''}]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      login();
      return;
    }

    try {
      setIsSubmitting(true);
      
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('language', formData.language);
      apiFormData.append('description', formData.description);
      apiFormData.append('tags', formData.tags);
      apiFormData.append('githubRepo', formData.githubRepo);
      apiFormData.append('requirements', JSON.stringify(requirements.filter(r => r.package.trim() !== '')));
      apiFormData.append('links', JSON.stringify(links.filter(l => l.url.trim() !== '')));
      
      if (formData.image) {
        apiFormData.append('image', formData.image);
      }
      
      const walletAddress = user?.wallet?.address || 'unknown';
      apiFormData.append('submittedBy', walletAddress);

      const response = await fetch('/api/submit-agent', {
        method: 'POST',
        body: apiFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit agent');
      }

      // Show success banner
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        language: 'python',
        description: '',
        categories: '',
        tags: '',
        githubRepo: '',
        image: null,
      });
      setRequirements([{package: '', install: ''}]);
      setLinks([{name: '', url: ''}]);
      setImagePreview(null);
      
      // Scroll to top to see banner
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Hide banner after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Failed to submit agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-6 p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: '#10b981', border: '1px solid #059669' }}>
            <p className="text-white font-bold text-xs">Agent submitted successfully! We will be in touch soon.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="text-white hover:text-gray-200 transition-colors ml-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Rocket size={24} weight="fill" className="text-white" />
          <h1 className="text-2xl font-bold text-white">Launch Agent</h1>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <GitHubSection 
              value={formData.githubRepo}
              onChange={handleChange}
            />
          </div>

          <ImageUploadSection 
            imagePreview={imagePreview}
            onImageChange={handleImageChange}
          />

          <BasicInfoSection 
            formData={formData}
            onChange={handleChange}
          />

          <RequirementsSection 
            requirements={requirements}
            onRequirementChange={handleRequirementChange}
            onAddRequirement={addRequirement}
            onRemoveRequirement={removeRequirement}
          />

          <LinksSection 
            links={links}
            onLinkChange={handleLinkChange}
            onAddLink={addLink}
            onRemoveLink={removeLink}
          />

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  language: 'python',
                  description: '',
                  categories: '',
                  tags: '',
                  githubRepo: '',
                  image: null,
                });
                setRequirements([{package: '', install: ''}]);
                setLinks([{name: '', url: ''}]);
                setImagePreview(null);
              }}
              className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#3b82f6' }}
            >
              {isSubmitting ? 'Submitting...' : (authenticated ? 'Submit Agent' : 'Sign In to Submit')}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
