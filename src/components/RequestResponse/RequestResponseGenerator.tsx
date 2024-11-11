import { useState } from 'react';
import { Copy, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface RequestCode {
  language: string;
  code: string;
  id: string;
}

const LANGUAGES = ['cURL', 'C#', 'Python', 'Go', 'Node.js', 'PHP'];

const RequestResponseGenerator = () => {
  const [method, setMethod] = useState('GET');
  const [requests, setRequests] = useState<RequestCode[]>([
    { language: 'cURL', code: '', id: '1' }
  ]);
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const stringifyCode = (code: string): string => {
    return code
      .trim()
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\s+/g, ' ');
  };

  const addRequestBlock = () => {
    const newId = (requests.length + 1).toString();
    setRequests([...requests, { language: 'cURL', code: '', id: newId }]);
  };

  const removeRequestBlock = (id: string) => {
    if (requests.length === 1) return;
    setRequests(requests.filter(req => req.id !== id));
  };

  const updateRequest = (id: string, field: keyof RequestCode, value: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, [field]: value } : req
    ));
  };

  const generateMarkdoc = () => {
    if (requests.some(req => !req.code) || !response) {
      return '// Please fill in all request code blocks and response field';
    }

    const requestsStr = requests
      .map(req => `{language: "${req.language}", code: "${stringifyCode(req.code)}"}`)
      .join(',');

    return `{% requestresponse method="${method}" requests=[${requestsStr}] response="${stringifyCode(response)}" /%}`;
  };

  const handleCopy = async () => {
    if (requests.some(req => !req.code) || !response) return;
    
    try {
      await navigator.clipboard.writeText(generateMarkdoc());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasErrors = () => {
    return requests.some(req => !req.code) || !response;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">RequestResponse Generator</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              HTTP Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Request Code Blocks</h3>
              <button
                onClick={addRequestBlock}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                Add Code Block
              </button>
            </div>

            {requests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
                <div className="flex justify-between items-center">
                  <select
                    value={request.language}
                    onChange={(e) => updateRequest(request.id, 'language', e.target.value)}
                    className="p-2 border rounded-md bg-white"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => removeRequestBlock(request.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded"
                    disabled={requests.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={request.code}
                    onChange={(e) => updateRequest(request.id, 'code', e.target.value)}
                    placeholder={`Paste your formatted ${request.language} code here...`}
                    className="w-full h-48 p-3 font-mono text-sm border rounded-md bg-white resize-none"
                    spellCheck={false}
                  />
                </div>
                {!request.code && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Code is required
                  </p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response
            </label>
            <div className="relative">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Paste your formatted JSON response here..."
                className="w-full h-48 p-3 font-mono text-sm border rounded-md bg-white resize-none"
                spellCheck={false}
              />
            </div>
            {!response && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Response is required
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <pre className={`bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm ${hasErrors() ? 'bg-red-50' : ''}`}>
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

        <div className="text-sm text-gray-500">
          <p>Notes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Add multiple code blocks with different languages</li>
            <li>Paste your code directly - the generator will handle formatting</li>
            <li>All fields must be filled before copying</li>
            <li>Click the copy button to copy the generated code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequestResponseGenerator;