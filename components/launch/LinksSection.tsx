interface Link {
  name: string;
  url: string;
}

interface LinksSectionProps {
  links: Link[];
  onLinkChange: (index: number, field: 'name' | 'url', value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

export default function LinksSection({ 
  links, 
  onLinkChange, 
  onAddLink, 
  onRemoveLink 
}: LinksSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Links</h2>
        <button
          type="button"
          onClick={onAddLink}
          className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
        >
          + Add Link
        </button>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-gray-500 text-sm">{index + 1}</div>
            <input
              value={link.name}
              onChange={(e) => onLinkChange(index, 'name', e.target.value)}
              placeholder="Website, Discord, Telegram, X, etc."
              required
              className="col-span-5 px-3 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
            />
            <input
              value={link.url}
              onChange={(e) => onLinkChange(index, 'url', e.target.value)}
              placeholder="https://yourlink.com"
              type="url"
              required
              className="col-span-5 px-3 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
            />
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveLink(index)}
                className="col-span-1 text-red-400 hover:text-red-300 cursor-pointer text-center"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
