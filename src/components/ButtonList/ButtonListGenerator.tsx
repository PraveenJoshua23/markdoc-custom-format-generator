import { useState } from 'react';
import { Copy, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface ButtonItem {
  label: string;
  link: string;
  id: string;
}

const ButtonListGenerator = () => {
  const [items, setItems] = useState<ButtonItem[]>([
    { label: '', link: '', id: '1' }
  ]);
  const [copied, setCopied] = useState(false);

  const addItem = () => {
    const newId = (items.length + 1).toString();
    setItems([...items, { label: '', link: '', id: newId }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Omit<ButtonItem, 'id'>, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const generateMarkdoc = () => {
    if (items.some(item => !item.label || !item.link)) {
      return '// Please fill in all fields for each button';
    }

    const itemsStr = items
      .map(({ label, link }) => `{ label: "${label}", link: "${link}" }`)
      .join(', ');

    return `{% buttonlist items=[ ${itemsStr} ] /%}`;
  };

  const handleCopy = async () => {
    if (items.some(item => !item.label || !item.link)) return;
    
    try {
      await navigator.clipboard.writeText(generateMarkdoc());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const hasErrors = () => {
    return items.some(item => !item.label || !item.link);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">ButtonList Generator</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Button Items</h3>
            <button
              onClick={addItem}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4" />
              Add Button
            </button>
          </div>

          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Button Label"
                      value={item.label}
                      onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                      className={`w-full p-2 border rounded-md ${!item.label ? 'border-red-300' : ''}`}
                    />
                    {!item.label && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Label is required
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Button Link"
                      value={item.link}
                      onChange={(e) => updateItem(item.id, 'link', e.target.value)}
                      className={`w-full p-2 border rounded-md ${!item.link ? 'border-red-300' : ''}`}
                    />
                    {!item.link && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Link is required
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start p-2 text-red-500 hover:text-red-700"
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
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
            <li>Add multiple buttons using the "Add Button" button</li>
            <li>Both label and link are required for each button</li>
            <li>Links should be valid URLs or paths</li>
            <li>Click the copy button to copy the generated code</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ButtonListGenerator;