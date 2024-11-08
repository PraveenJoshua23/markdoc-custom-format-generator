import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Copy, AlertCircle } from 'lucide-react';

interface RelatedLink {
  title: string;
  url: string;
  urlError?: string;
}

interface SeeAlsoLink {
  title: string;
  url: string;
  urlError?: string;
}

const DocFooterGenerator = () => {
  const [links, setLinks] = useState<RelatedLink[]>([{ title: '', url: '', urlError: '' }]);
  const [seeAlso, setSeeAlso] = useState<SeeAlsoLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSeeAlso, setShowSeeAlso] = useState(false);

  const validateUrl = useCallback((url: string): string => {
    if (!url) return 'URL is required';
    if (!url.startsWith('/docs')) return 'URL must start with /docs';
    return '';
  }, []);

  const handleAddLink = () => {
    setLinks([...links, { title: '', url: '', urlError: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const handleLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = links.map((link, i) => {
      if (i === index) {
        const newLink = { ...link, [field]: value };
        if (field === 'url') {
          newLink.urlError = validateUrl(value);
        }
        return newLink;
      }
      return link;
    });
    setLinks(newLinks);
  };

  const handleSeeAlsoChange = (field: 'title' | 'url', value: string) => {
    setSeeAlso(prev => {
      const newSeeAlso = {
        ...prev || { title: '', url: '', urlError: '' },
        [field]: value
      };
      if (field === 'url') {
        newSeeAlso.urlError = validateUrl(value);
      }
      return newSeeAlso;
    });
  };

  const toggleSeeAlso = () => {
    setShowSeeAlso(!showSeeAlso);
    if (!showSeeAlso) {
      setSeeAlso({ title: '', url: '', urlError: '' });
    } else {
      setSeeAlso(null);
    }
  };

  const hasErrors = (): boolean => {
    const linksHaveErrors = links.some(link => 
      validateUrl(link.url) !== '' || !link.title
    );
    const seeAlsoHasErrors = showSeeAlso && seeAlso && (
      validateUrl(seeAlso.url) !== '' || !seeAlso.title
    );
    return linksHaveErrors || !!seeAlsoHasErrors;
  };

  const generateMarkdoc = () => {
    if (hasErrors()) return '// Please fix validation errors before generating the code';
    
    const parts = [];
    
    const relatedLinksStr = JSON.stringify(links.map(({ title, url }) => ({ title, url })))
      .replace(/"/g, "'")
      .replace(/\s+/g, ' ');
    parts.push(`relatedLinks=${relatedLinksStr}`);

    if (showSeeAlso && seeAlso?.title && seeAlso?.url) {
      const seeAlsoStr = JSON.stringify({
        title: seeAlso.title,
        url: seeAlso.url
      })
        .replace(/"/g, "'")
        .replace(/\s+/g, ' ');
      parts.push(`seeAlso=${seeAlsoStr}`);
    }

    return `{% docfooter ${parts.join(' ')} /%}`;
  };

  const handleCopy = async () => {
    if (hasErrors()) return;
    
    try {
      await navigator.clipboard.writeText(generateMarkdoc());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">DocFooter Generator</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Related Links</h3>
          {links.map((link, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1 space-y-2">
                <div>
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={link.title}
                    onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                    className={`w-full p-2 border rounded-md ${!link.title ? 'border-red-300' : ''}`}
                  />
                  {!link.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Title is required
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Link URL (must start with /docs)"
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                    className={`w-full p-2 border rounded-md ${link.urlError ? 'border-red-300' : ''}`}
                  />
                  {link.urlError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {link.urlError}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemoveLink(index)}
                className="self-center p-2 text-red-500 hover:text-red-700"
                disabled={links.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            onClick={handleAddLink}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4" />
            Add Related Link
          </button>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSeeAlso}
              onChange={toggleSeeAlso}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Add "See Also" Link</span>
          </label>

          {showSeeAlso && (
            <div className="mt-4 space-y-2">
              <div>
                <input
                  type="text"
                  placeholder="See Also Title"
                  value={seeAlso?.title || ''}
                  onChange={(e) => handleSeeAlsoChange('title', e.target.value)}
                  className={`w-full p-2 border rounded-md ${showSeeAlso && !seeAlso?.title ? 'border-red-300' : ''}`}
                />
                {showSeeAlso && !seeAlso?.title && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Title is required
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="See Also URL (must start with /docs)"
                  value={seeAlso?.url || ''}
                  onChange={(e) => handleSeeAlsoChange('url', e.target.value)}
                  className={`w-full p-2 border rounded-md ${seeAlso?.urlError ? 'border-red-300' : ''}`}
                />
                {seeAlso?.urlError && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {seeAlso.urlError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <pre className={`bg-gray-50 p-4 rounded-lg overflow-x-auto ${hasErrors() ? 'bg-red-50' : ''}`}>
              <code>{generateMarkdoc()}</code>
            </pre>
            <button
              onClick={handleCopy}
              className={`absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md shadow-sm border
                ${hasErrors() ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={hasErrors()}
            >
              {copied ? (
                <span className="text-green-500">Copied!</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocFooterGenerator;