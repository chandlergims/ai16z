interface UseCasesSectionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function UseCasesSection({ value, onChange }: UseCasesSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <h2 className="text-base font-semibold text-white mb-2">Use Cases</h2>
      <p className="text-xs text-gray-400 mb-3">Describe practical use cases for your agent. This helps users understand when and how to use it.</p>
      <textarea
        name="useCase"
        value={value}
        onChange={onChange}
        placeholder="Describe how this use case applies to your product..."
        required
        rows={3}
        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm resize-none"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
      />
    </div>
  );
}
