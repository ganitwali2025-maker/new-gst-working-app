const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, '../src/components/views');

const files = fs.readdirSync(viewsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(viewsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Replace KPI Card colors (purple to accent/muted)
  content = content.replace(/color="var\(--purple\)"/g, 'color="var(--accent)"');

  // 2. Replace h3 purple headers to match GSTR2B theme
  // Many pages have something like: <h3 style={{ color: 'var(--purple)', ... }}>Title {isLocked...}</h3>
  content = content.replace(
    /<h3[^>]*?color:\s*['"]var\(--purple\)['"][^>]*>([\s\S]*?)<\/h3>/g,
    `<div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><line x1="9" y1="11" x2="15" y2="11"></line></svg>
      </div>
      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.01em' }}>$1</h3>
    </div>`
  );

  // 3. Button linear gradients replacements
  // Lock buttons
  content = content.replace(
    /background:\s*isLocked \? 'linear-gradient[^']*' : 'linear-gradient[^']*'/g,
    "background: 'var(--accent)'"
  );
  // Clear buttons
  content = content.replace(
    /background:\s*'linear-gradient\(90deg, #EF4444, #DC2626\)'/g,
    "background: '#ffffff', color: 'var(--red)', border: '1px solid var(--border)'"
  );
  // Refresh buttons
  content = content.replace(
    /background:\s*'linear-gradient\(90deg, var\(--purple\)[^']*'/g,
    "background: '#ffffff', color: 'var(--text)', border: '1px solid var(--border)'"
  );
  // Sync button in BooksPurchase
  content = content.replace(
    /background:\s*'linear-gradient\(90deg, #3B82F6, #2563EB\)'/g,
    "background: '#ffffff', color: 'var(--blue)', border: '1px solid var(--border)'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
