interface AgentCodeSectionProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function AgentCodeSection({ value, onChange }: AgentCodeSectionProps) {
  return (
    <div className="p-5 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <h2 className="text-base font-semibold text-white mb-3">Agent Code</h2>
      <textarea
        name="agentCode"
        value={value}
        onChange={onChange}
        placeholder="Paste your agent's code here... (Add types and docstrings)"
        required
        rows={8}
        className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none text-sm resize-none font-mono"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}
      />
    </div>
  );
}
