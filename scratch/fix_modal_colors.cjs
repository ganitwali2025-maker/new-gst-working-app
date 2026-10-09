const fs = require('fs');

function replaceColors(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  let orig = c;
  
  // Text colors
  c = c.replace(/#111827/gi, 'var(--text)');
  c = c.replace(/#1f2937/gi, 'var(--text)');
  c = c.replace(/#374151/gi, 'var(--text)');
  c = c.replace(/#4b5563/gi, 'var(--text)');
  c = c.replace(/#6b7280/gi, 'var(--muted)');
  c = c.replace(/#9ca3af/gi, 'var(--muted-2)');
  
  // Theme purples
  c = c.replace(/#6D28D9/gi, 'var(--accent)');
  c = c.replace(/#9333ea/gi, 'var(--accent)');
  c = c.replace(/#7C3AED/gi, 'var(--accent)');
  c = c.replace(/#8b5cf6/gi, 'var(--accent)');
  c = c.replace(/#c4b5fd/gi, 'var(--accent-soft)');
  c = c.replace(/#ddd6fe/gi, 'var(--accent-soft)');
  c = c.replace(/#ede9fe/gi, 'var(--accent-soft)');
  c = c.replace(/#f5f3ff/gi, 'var(--panel-2)');
  c = c.replace(/#faf5ff/gi, 'var(--panel-2)');
  c = c.replace(/#f3e8ff/gi, 'var(--accent-soft)');
  
  // Theme greens
  c = c.replace(/#0fa958/gi, 'var(--green)');
  c = c.replace(/#10b981/gi, 'var(--green)');
  c = c.replace(/#dcfce7/gi, 'var(--green-soft)');
  c = c.replace(/#e8f7f0/gi, 'var(--panel)');
  
  // Theme reds
  c = c.replace(/#dc2626/gi, 'var(--red)');
  c = c.replace(/#fee2e2/gi, 'var(--red-soft)');
  c = c.replace(/#fef2f2/gi, 'var(--panel)');

  if (c !== orig) {
    fs.writeFileSync(filePath, c);
    console.log('Fixed colors in', filePath);
  }
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      replaceColors(p);
    }
  });
}

processDir('c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/common');
processDir('c:/Users/lr690/OneDrive/Desktop/GST APP/src/components/views');
