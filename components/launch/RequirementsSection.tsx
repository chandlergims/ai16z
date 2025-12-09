interface Requirement {
  package: string;
  install: string;
}

interface RequirementsSectionProps {
  requirements: Requirement[];
  onRequirementChange: (index: number, field: 'package' | 'install', value: string) => void;
  onAddRequirement: () => void;
  onRemoveRequirement: (index: number) => void;
}

export default function RequirementsSection({ 
  requirements, 
  onRequirementChange, 
  onAddRequirement, 
  onRemoveRequirement 
}: RequirementsSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-white">Requirements</h2>
        <button
          type="button"
          onClick={onAddRequirement}
          className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
        >
          + Add
        </button>
      </div>
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-gray-500 text-sm">{index + 1}</div>
            <input
              value={req.package}
              onChange={(e) => onRequirementChange(index, 'package', e.target.value)}
              placeholder="requests"
              required
              className="col-span-5 px-3 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
            />
            <input
              value={req.install}
              onChange={(e) => onRequirementChange(index, 'install', e.target.value)}
              placeholder="pip3 install requests"
              required
              className="col-span-5 px-3 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
            />
            {requirements.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveRequirement(index)}
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
