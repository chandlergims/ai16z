interface BasicInfoSectionProps {
  formData: {
    name: string;
    language: string;
    description: string;
    categories: string;
    tags: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function BasicInfoSection({ formData, onChange }: BasicInfoSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <h2 className="text-base font-semibold text-white mb-4">Agent Details</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Name*</label>
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="My AI Agent"
            required
            className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">Language*</label>
          <select
            name="language"
            value={formData.language}
            onChange={onChange}
            required
            className="w-full px-4 py-2.5 rounded-lg text-white focus:outline-none text-sm cursor-pointer"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              border: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="python" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Python</option>
            <option value="javascript" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>JavaScript</option>
            <option value="rust" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Rust</option>
            <option value="c" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>C</option>
            <option value="cpp" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>C++</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">Description*</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Describe what your agent does..."
          required
          rows={4}
          className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm resize-none"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Tags*</label>
          <input
            name="tags"
            value={formData.tags}
            onChange={onChange}
            placeholder="solana, defi, nft (comma-separated)"
            required
            className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
          />
      </div>
    </div>
  );
}
